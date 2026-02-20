import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/apiHandler'
import { verifyFormAccess } from '@/lib/formAccess'

export const PATCH = withAuth(async (req, { params }, session) => {
  const form = await verifyFormAccess(params.formId, session.user.id)
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  const data = await req.json()

  const field = await prisma.formField.update({
    where: { id: params.fieldId },
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
})

export const DELETE = withAuth(async (_req, { params }, session) => {
  const form = await verifyFormAccess(params.formId, session.user.id)
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  await prisma.formField.delete({
    where: { id: params.fieldId },
  })

  // Update form's updatedAt timestamp
  await prisma.form.update({
    where: { id: params.formId },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json({ success: true })
})
