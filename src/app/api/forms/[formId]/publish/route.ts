import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/forms/[formId]/publish - Publish a form
export async function POST(
  _req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify form access and ownership
    const form = await prisma.form.findFirst({
      where: {
        id: params.formId,
        workspace: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id, role: { in: ['admin', 'editor'] } } } }
          ]
        }
      },
      include: {
        workspace: true,
        fields: true
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Check if form has at least one field
    if (form.fields.length === 0) {
      return NextResponse.json(
        { error: 'Form must have at least one field to be published' },
        { status: 400 }
      )
    }

    // Update form to published
    const publishedForm = await prisma.form.update({
      where: { id: params.formId },
      data: {
        isPublished: true,
        isAcceptingResponses: true
      }
    })

    // Generate public URL
    const publicUrl = `/to/${form.workspace.slug}/${publishedForm.slug}`

    return NextResponse.json({
      success: true,
      form: publishedForm,
      publicUrl,
      message: 'Form published successfully'
    })
  } catch (error) {
    console.error('Publish form error:', error)
    return NextResponse.json(
      { error: 'Failed to publish form' },
      { status: 500 }
    )
  }
}
