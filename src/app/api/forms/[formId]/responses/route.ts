import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/forms/[formId]/responses - List responses with pagination
export async function GET(
  req: NextRequest,
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
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20') || 20), 100)
    const status = searchParams.get('status') // 'completed' | 'incomplete'
    const allowedSortFields = ['createdAt', 'updatedAt', 'isCompleted', 'timeTaken']
    const rawSortBy = searchParams.get('sortBy') || 'createdAt'
    const sortBy = allowedSortFields.includes(rawSortBy) ? rawSortBy : 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: Record<string, unknown> = { formId: params.formId }

    if (status === 'completed') {
      where.isCompleted = true
    } else if (status === 'incomplete') {
      where.isCompleted = false
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        const parsed = new Date(startDate)
        if (!isNaN(parsed.getTime())) {
          (where.createdAt as Record<string, Date>).gte = parsed
        }
      }
      if (endDate) {
        const parsed = new Date(endDate)
        if (!isNaN(parsed.getTime())) {
          (where.createdAt as Record<string, Date>).lte = parsed
        }
      }
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
  } catch (error) {
    console.error('Get responses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    )
  }
}

// DELETE /api/forms/[formId]/responses - Bulk delete responses
export async function DELETE(
  req: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify form access with delete permission
    const form = await prisma.form.findFirst({
      where: {
        id: params.formId,
        workspace: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id, role: { in: ['admin'] } } } }
          ]
        }
      }
    })

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
  } catch (error) {
    console.error('Delete responses error:', error)
    return NextResponse.json(
      { error: 'Failed to delete responses' },
      { status: 500 }
    )
  }
}
