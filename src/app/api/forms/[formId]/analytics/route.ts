import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateFormAnalytics } from '@/lib/analytics'
import { withAuth } from '@/lib/apiHandler'
import { verifyFormAccess } from '@/lib/formAccess'

// GET /api/forms/[formId]/analytics - Get form analytics
export const GET = withAuth(async (_req, { params }, session) => {
  const form = await verifyFormAccess(params.formId, session.user.id, {
    include: { fields: { orderBy: { orderIndex: 'asc' } } }
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
})
