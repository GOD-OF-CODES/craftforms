import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateWebhookSecret } from '@/lib/webhooks/signatureGenerator'
import { isUrlSafe } from '@/lib/webhooks/deliveryService'
import { withAuth } from '@/lib/apiHandler'

// GET /api/forms/[formId]/webhooks/[webhookId]
export const GET = withAuth(async (_req, { params }, session) => {
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
      logs: {
        orderBy: { attemptedAt: 'desc' },
        take: 10
      },
      _count: {
        select: { logs: true }
      }
    }
  })

  if (!webhook) {
    return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
  }

  const { secret: _secret, ...sanitizedWebhook } = webhook
  return NextResponse.json(sanitizedWebhook)
})

// PATCH /api/forms/[formId]/webhooks/[webhookId]
export const PATCH = withAuth(async (req, { params }, session) => {
  // Verify webhook access
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
    }
  })

  if (!webhook) {
    return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
  }

  const body = await req.json()

  // Validate URL if provided (including SSRF protection)
  if (body.url) {
    const urlCheck = isUrlSafe(body.url)
    if (!urlCheck.safe) {
      return NextResponse.json({ error: urlCheck.reason || 'Invalid URL' }, { status: 400 })
    }
  }

  const updateData: Record<string, unknown> = {}
  if (body.url !== undefined) updateData.url = body.url
  if (body.events !== undefined) updateData.events = body.events
  if (body.isActive !== undefined) updateData.isActive = body.isActive
  if (body.regenerateSecret) updateData.secret = generateWebhookSecret()

  const updatedWebhook = await prisma.webhook.update({
    where: { id: params.webhookId },
    data: updateData
  })

  const { secret: _secret, ...sanitizedWebhook } = updatedWebhook
  return NextResponse.json(sanitizedWebhook)
})

// DELETE /api/forms/[formId]/webhooks/[webhookId]
export const DELETE = withAuth(async (_req, { params }, session) => {
  // Verify webhook access
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
    }
  })

  if (!webhook) {
    return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
  }

  await prisma.webhook.delete({
    where: { id: params.webhookId }
  })

  return NextResponse.json({ success: true })
})
