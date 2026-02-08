import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/forms/[formId]/unpublish - Unpublish a form
export async function POST(
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
            { members: { some: { userId: session.user.id, role: { in: ['admin', 'editor'] } } } }
          ]
        }
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Update form to unpublished
    const unpublishedForm = await prisma.form.update({
      where: { id: params.formId },
      data: {
        isPublished: false
      }
    })

    return NextResponse.json({
      success: true,
      form: unpublishedForm,
      message: 'Form unpublished successfully'
    })
  } catch (error) {
    console.error('Unpublish form error:', error)
    return NextResponse.json(
      { error: 'Failed to unpublish form' },
      { status: 500 }
    )
  }
}
