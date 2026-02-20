import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateWebhookSecret } from '@/lib/webhooks/signatureGenerator'
import { isUrlSafe } from '@/lib/webhooks/deliveryService'
import { withAuth } from '@/lib/apiHandler'
import { verifyFormAccess } from '@/lib/formAccess'

// GET /api/forms/[formId]/webhooks - List webhooks
export const GET = withAuth(async (_req, { params }, session) => {
  const form = await verifyFormAccess(params.formId, session.user.id)
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  const webhooks = await prisma.webhook.findMany({
    where: { formId: params.formId },
    include: {
      _count: {
        select: { logs: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const sanitized = webhooks.map(({ secret, ...rest }) => rest)
  return NextResponse.json(sanitized)
})

// POST /api/forms/[formId]/webhooks - Create webhook
export const POST = withAuth(async (req, { params }, session) => {
  const form = await verifyFormAccess(params.formId, session.user.id)
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  const body = await req.json()

  if (!body.url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // Validate URL (including SSRF protection)
  const urlCheck = isUrlSafe(body.url)
  if (!urlCheck.safe) {
    return NextResponse.json({ error: urlCheck.reason || 'Invalid URL' }, { status: 400 })
  }

  const webhook = await prisma.webhook.create({
    data: {
      formId: params.formId,
      url: body.url,
      secret: generateWebhookSecret(),
      events: body.events || ['response.submitted'],
      isActive: body.isActive !== false,
    }
  })

  const { secret: _secret, ...sanitizedWebhook } = webhook
  return NextResponse.json(sanitizedWebhook, { status: 201 })
})
