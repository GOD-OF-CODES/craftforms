import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateFormAnalytics } from '@/lib/analytics'

// GET /api/forms/[formId]/analytics - Get form analytics
export async function GET(
  _req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify form access
    const form = await prisma.form.findFirst({
      where: {
        id: params.formId,
        workspace: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id } } }
          ]
        }
      },
      include: {
        fields: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Get all responses with answers
    const responses = await prisma.response.findMany({
      where: { formId: params.formId },
      include: {
        answers: {
          include: {
            field: {
              select: {
                id: true,
                title: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform responses for analytics
    const analyticsResponses = responses.map(r => ({
      id: r.id,
      isCompleted: r.isCompleted,
      createdAt: r.createdAt,
      timeTaken: r.timeTaken,
      answers: r.answers.map(a => ({
        fieldId: a.field.id,
        fieldType: a.field.type,
        fieldTitle: a.field.title,
        value: a.value
      }))
    }))

    // Transform fields for analytics
    const analyticsFields = form.fields.map(f => ({
      id: f.id,
      title: f.title,
      type: f.type,
      properties: f.properties as Record<string, unknown> | undefined
    }))

    const analytics = calculateFormAnalytics(analyticsResponses, analyticsFields)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
