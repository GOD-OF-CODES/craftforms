import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/apiHandler'
import { verifyFormAccess } from '@/lib/formAccess'

// POST /api/forms/[formId]/unpublish - Unpublish a form
export const POST = withAuth(async (_req, { params }, session) => {
  const form = await verifyFormAccess(params.formId, session.user.id, { roles: 'editor' })
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
})
