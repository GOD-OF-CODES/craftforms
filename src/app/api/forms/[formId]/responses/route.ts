import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildDateRangeFilter } from '@/lib/dateFilter'
import { withAuth } from '@/lib/apiHandler'
import { verifyFormAccess } from '@/lib/formAccess'

// GET /api/forms/[formId]/responses - List responses with pagination
export const GET = withAuth(async (req, { params }, session) => {
  const form = await verifyFormAccess(params.formId, session.user.id)
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  // Parse query params
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status') // 'completed' | 'incomplete'
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  // Build where clause
  const where: Record<string, unknown> = { formId: params.formId }

  if (status === 'completed') {
    where.isCompleted = true
  } else if (status === 'incomplete') {
    where.isCompleted = false
  }

  const dateFilter = buildDateRangeFilter(startDate, endDate)
  if (dateFilter) {
    where.createdAt = dateFilter
  }

  // Get total count
  const total = await prisma.response.count({ where })

  // Get responses
  const responses = await prisma.response.findMany({
    where,
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
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit
  })

  return NextResponse.json({
    responses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
})

// DELETE /api/forms/[formId]/responses - Bulk delete responses
export const DELETE = withAuth(async (req, { params }, session) => {
  const form = await verifyFormAccess(params.formId, session.user.id, { roles: 'admin' })
  if (!form) {
    return NextResponse.json({ error: 'Form not found or insufficient permissions' }, { status: 404 })
  }

  const { responseIds } = await req.json()

  if (!Array.isArray(responseIds) || responseIds.length === 0) {
    return NextResponse.json(
      { error: 'Response IDs are required' },
      { status: 400 }
    )
  }

  // Delete responses
  const result = await prisma.response.deleteMany({
    where: {
      id: { in: responseIds },
      formId: params.formId
    }
  })

  return NextResponse.json({
    success: true,
    deletedCount: result.count
  })
})
