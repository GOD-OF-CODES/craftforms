import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deliverWebhook } from '@/lib/webhooks/deliveryService'

// POST /api/forms/[formId]/webhooks/[webhookId]/test - Send test webhook
export async function POST(
  _req: Request,
  { params }: { params: { formId: string; webhookId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get webhook with form
    const webhook = await prisma.webhook.findFirst({
      where: {
        id: params.webhookId,
        formId: params.formId,
        form: {
          workspace: {
            OR: [
              { ownerId: session.user.id },
              { members: { some: { userId: session.user.id } } }
            ]
          }
        }
      },
      include: {
        form: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    // Create test payload
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: {
        formId: webhook.form.id,
        formTitle: webhook.form.title,
        responseId: 'test-response-id',
        respondentId: 'test-respondent-id',
        completedAt: new Date().toISOString(),
        answers: [
          {
            fieldId: 'test-field-id',
            fieldTitle: 'Test Question',
            fieldType: 'short_text',
            value: 'This is a test response'
          }
        ],
        metadata: {
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
          timeTaken: 30
        }
      }
    }

    // Send test webhook (with shorter retry for testing)
    const result = await deliverWebhook(
      webhook.id,
      webhook.url,
      webhook.secret,
      testPayload,
      'test-response-id'
    )

    return NextResponse.json({
      success: result.success,
      statusCode: result.statusCode,
      responseBody: result.responseBody,
      errorMessage: result.errorMessage
    })
  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to send test webhook' },
      { status: 500 }
    )
  }
}
