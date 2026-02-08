import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateWebhookSecret } from '@/lib/webhooks/signatureGenerator'

// GET /api/forms/[formId]/webhooks/[webhookId]
export async function GET(
  _req: Request,
  { params }: { params: { formId: string; webhookId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    return NextResponse.json(webhook)
  } catch (error) {
    console.error('Get webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhook' },
      { status: 500 }
    )
  }
}

// PATCH /api/forms/[formId]/webhooks/[webhookId]
export async function PATCH(
  req: Request,
  { params }: { params: { formId: string; webhookId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Validate URL if provided
    if (body.url) {
      try {
        new URL(body.url)
      } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
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

    return NextResponse.json(updatedWebhook)
  } catch (error) {
    console.error('Update webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    )
  }
}

// DELETE /api/forms/[formId]/webhooks/[webhookId]
export async function DELETE(
  _req: Request,
  { params }: { params: { formId: string; webhookId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
  } catch (error) {
    console.error('Delete webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    )
  }
}
