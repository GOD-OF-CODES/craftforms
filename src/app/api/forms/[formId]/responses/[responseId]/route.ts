import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/forms/[formId]/responses/[responseId] - Get single response
export async function GET(
  _req: Request,
  { params }: { params: { formId: string; responseId: string } }
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

    // Get response with answers
    const response = await prisma.response.findFirst({
      where: {
        id: params.responseId,
        formId: params.formId
      },
      include: {
        answers: {
          include: {
            field: {
              select: {
                id: true,
                title: true,
                type: true,
                orderIndex: true
              }
            }
          }
        }
      }
    })

    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 })
    }

    // Get adjacent response IDs for navigation
    const [prevResponse, nextResponse] = await Promise.all([
      prisma.response.findFirst({
        where: {
          formId: params.formId,
          createdAt: { lt: response.createdAt }
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      }),
      prisma.response.findFirst({
        where: {
          formId: params.formId,
          createdAt: { gt: response.createdAt }
        },
        orderBy: { createdAt: 'asc' },
        select: { id: true }
      })
    ])

    return NextResponse.json({
      response,
      form: {
        id: form.id,
        title: form.title,
        fields: form.fields
      },
      navigation: {
        prevId: prevResponse?.id || null,
        nextId: nextResponse?.id || null
      }
    })
  } catch (error) {
    console.error('Get response error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch response' },
      { status: 500 }
    )
  }
}

// DELETE /api/forms/[formId]/responses/[responseId] - Delete single response
export async function DELETE(
  _req: Request,
  { params }: { params: { formId: string; responseId: string } }
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

    // Delete response
    await prisma.response.delete({
      where: {
        id: params.responseId,
        formId: params.formId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete response error:', error)
    return NextResponse.json(
      { error: 'Failed to delete response' },
      { status: 500 }
    )
  }
}
