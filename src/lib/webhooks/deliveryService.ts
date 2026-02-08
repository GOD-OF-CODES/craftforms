/**
 * Webhook delivery service with retry logic
 */

import { prisma } from '@/lib/prisma'
import { generateWebhookHeaders } from './signatureGenerator'

interface WebhookPayload {
  event: string
  timestamp: string
  data: {
    formId: string
    formTitle: string
    responseId: string
    respondentId?: string
    completedAt: string
    answers: Array<{
      fieldId: string
      fieldTitle: string
      fieldType: string
      value: unknown
    }>
    metadata?: {
      ipAddress?: string
      userAgent?: string
      timeTaken?: number
    }
  }
}

interface DeliveryResult {
  success: boolean
  statusCode?: number
  responseBody?: string
  errorMessage?: string
}

const MAX_RETRIES = 3
const RETRY_DELAYS = [1000, 5000, 30000] // 1s, 5s, 30s

/**
 * Deliver webhook with retry logic
 */
export async function deliverWebhook(
  webhookId: string,
  url: string,
  secret: string,
  payload: WebhookPayload,
  responseId: string
): Promise<DeliveryResult> {
  const payloadString = JSON.stringify(payload)
  const headers = generateWebhookHeaders(payloadString, secret)

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await attemptDelivery(url, payloadString, headers)

      // Log the attempt
      await logWebhookAttempt(webhookId, responseId, payloadString, result)

      if (result.success) {
        return result
      }

      // Wait before retry (exponential backoff)
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAYS[attempt] || 30000)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await logWebhookAttempt(webhookId, responseId, payloadString, {
        success: false,
        errorMessage,
      })

      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAYS[attempt] || 30000)
      }
    }
  }

  return {
    success: false,
    errorMessage: `Failed after ${MAX_RETRIES} attempts`,
  }
}

/**
 * Single delivery attempt
 */
async function attemptDelivery(
  url: string,
  payload: string,
  headers: Record<string, string>
): Promise<DeliveryResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: payload,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const responseBody = await response.text().catch(() => '')

    return {
      success: response.ok,
      statusCode: response.status,
      responseBody: responseBody.substring(0, 10000), // Limit stored response
      errorMessage: response.ok ? undefined : `HTTP ${response.status}`,
    }
  } catch (error) {
    clearTimeout(timeout)
    throw error
  }
}

/**
 * Log webhook delivery attempt
 */
async function logWebhookAttempt(
  webhookId: string,
  responseId: string,
  requestBody: string,
  result: DeliveryResult
): Promise<void> {
  try {
    await prisma.webhookLog.create({
      data: {
        webhookId,
        responseId,
        statusCode: result.statusCode,
        requestBody: JSON.parse(requestBody),
        responseBody: result.responseBody,
        errorMessage: result.errorMessage,
      },
    })
  } catch (error) {
    console.error('Failed to log webhook attempt:', error)
  }
}

/**
 * Build webhook payload for response submission
 */
export function buildResponseSubmittedPayload(
  form: { id: string; title: string },
  response: {
    id: string
    respondentId: string | null
    completedAt: Date | null
    ipAddress: string | null
    userAgent: string | null
    timeTaken: number | null
    answers: Array<{
      field: { id: string; title: string; type: string }
      value: unknown
    }>
  }
): WebhookPayload {
  return {
    event: 'response.submitted',
    timestamp: new Date().toISOString(),
    data: {
      formId: form.id,
      formTitle: form.title,
      responseId: response.id,
      respondentId: response.respondentId || undefined,
      completedAt: response.completedAt?.toISOString() || new Date().toISOString(),
      answers: response.answers.map((a) => ({
        fieldId: a.field.id,
        fieldTitle: a.field.title,
        fieldType: a.field.type,
        value: a.value,
      })),
      metadata: {
        ipAddress: response.ipAddress || undefined,
        userAgent: response.userAgent || undefined,
        timeTaken: response.timeTaken || undefined,
      },
    },
  }
}

/**
 * Fire webhooks for a form event
 */
export async function fireWebhooks(
  formId: string,
  event: string,
  payload: WebhookPayload
): Promise<void> {
  // Get active webhooks for this form and event
  const webhooks = await prisma.webhook.findMany({
    where: {
      formId,
      isActive: true,
      events: { has: event },
    },
  })

  // Deliver webhooks in parallel (fire and forget)
  const deliveryPromises = webhooks.map((webhook) =>
    deliverWebhook(
      webhook.id,
      webhook.url,
      webhook.secret,
      payload,
      payload.data.responseId
    ).catch((error) => {
      console.error(`Webhook delivery failed for ${webhook.id}:`, error)
    })
  )

  // Don't await - let them run in background
  Promise.all(deliveryPromises).catch(console.error)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
