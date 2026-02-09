import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { formId: string; fieldId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to this form
    const form = await prisma.form.findFirst({
      where: {
        id: params.formId,
        workspace: {
          OR: [
            { ownerId: session.user.id },
            {
              members: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          ],
        },
      },
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const data = await req.json()

    const field = await prisma.formField.update({
      where: {
        id: params.fieldId,
        formId: params.formId,
      },
      data: {
        title: data.title,
        description: data.description,
        isRequired: data.required,
        properties: data.properties,
        validations: data.validations,
        orderIndex: data.orderIndex,
      },
    })

    // Update form's updatedAt timestamp
    await prisma.form.update({
      where: { id: params.formId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ field })
  } catch (error) {
    console.error('Update form field error:', error)
    return NextResponse.json(
      { error: 'Failed to update form field' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { formId: string; fieldId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to this form
    const form = await prisma.form.findFirst({
      where: {
        id: params.formId,
        workspace: {
          OR: [
            { ownerId: session.user.id },
            {
              members: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          ],
        },
      },
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    await prisma.formField.delete({
      where: {
        id: params.fieldId,
        formId: params.formId,
      },
    })

    // Update form's updatedAt timestamp
    await prisma.form.update({
      where: { id: params.formId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete form field error:', error)
    return NextResponse.json(
      { error: 'Failed to delete form field' },
      { status: 500 }
    )
  }
}
