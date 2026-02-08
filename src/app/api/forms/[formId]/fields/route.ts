import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { formId: string } }
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

    const fields = await prisma.formField.findMany({
      where: {
        formId: params.formId,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    })

    return NextResponse.json({ fields })
  } catch (error) {
    console.error('Get form fields error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form fields' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { formId: string } }
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

    // Get the current max order
    const maxOrderField = await prisma.formField.findFirst({
      where: {
        formId: params.formId,
      },
      orderBy: {
        orderIndex: 'desc',
      },
    })

    const orderIndex = maxOrderField ? maxOrderField.orderIndex + 1 : 0

    const field = await prisma.formField.create({
      data: {
        formId: params.formId,
        type: data.type,
        title: data.title || '',
        description: data.description,
        orderIndex,
        isRequired: data.required ?? false,
        properties: data.properties || {},
      },
    })

    // Update form's updatedAt timestamp
    await prisma.form.update({
      where: { id: params.formId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ field }, { status: 201 })
  } catch (error) {
    console.error('Create form field error:', error)
    return NextResponse.json(
      { error: 'Failed to create form field' },
      { status: 500 }
    )
  }
}
