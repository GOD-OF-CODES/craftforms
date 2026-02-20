import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/apiHandler'
import { verifyFormAccess } from '@/lib/formAccess'

// POST /api/forms/[formId]/publish - Publish a form
export const POST = withAuth(async (_req, { params }, session) => {
  const form = await verifyFormAccess(params.formId, session.user.id, {
    roles: 'editor',
    include: { workspace: true, fields: true }
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
})
