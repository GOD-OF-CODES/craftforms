import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/apiHandler'
import { verifyFormAccess } from '@/lib/formAccess'

export const GET = withAuth(async (_req, { params }, session) => {
  const form = await verifyFormAccess(params.formId, session.user.id)
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  const fields = await prisma.formField.findMany({
    where: { formId: params.formId },
    orderBy: { orderIndex: 'asc' },
  })

  return NextResponse.json({ fields })
})

export const POST = withAuth(async (req, { params }, session) => {
  const form = await verifyFormAccess(params.formId, session.user.id)
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  const data = await req.json()

  // Get the current max order
  const maxOrderField = await prisma.formField.findFirst({
    where: { formId: params.formId },
    orderBy: { orderIndex: 'desc' },
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
})
