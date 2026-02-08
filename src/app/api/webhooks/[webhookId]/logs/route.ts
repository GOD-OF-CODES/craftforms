import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/webhooks/[webhookId]/logs - Get webhook logs
export async function GET(
  req: Request,
  { params }: { params: { webhookId: string } }
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

    // Parse query params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const status = searchParams.get('status') // 'success' or 'failed'

    // Build filter
    const where: Record<string, unknown> = {
      webhookId: params.webhookId
    }

    if (status === 'success') {
      where.statusCode = { gte: 200, lt: 300 }
    } else if (status === 'failed') {
      where.OR = [
        { statusCode: null },
        { statusCode: { not: { gte: 200, lt: 300 } } },
        { errorMessage: { not: null } }
      ]
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.webhookLog.findMany({
        where,
        orderBy: { attemptedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          response: {
            select: {
              id: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.webhookLog.count({ where })
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get webhook logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhook logs' },
      { status: 500 }
    )
  }
}
