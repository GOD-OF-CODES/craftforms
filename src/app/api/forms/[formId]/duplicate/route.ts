import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { withAuth } from '@/lib/apiHandler'
import { verifyFormAccess } from '@/lib/formAccess'

// POST /api/forms/[formId]/duplicate - Duplicate a form
export const POST = withAuth(async (_req, { params }, session) => {
  const originalForm = await verifyFormAccess(params.formId, session.user.id, {
    include: { fields: true, screens: true }
  })

  if (!originalForm) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  // Generate unique slug
  const baseSlug = `${originalForm.slug}-copy`
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.form.findFirst({
      where: {
        workspaceId: originalForm.workspaceId,
        slug
      }
    })
    if (!existing) break
    slug = `${baseSlug}-${counter}`
    counter++
  }

  // Create duplicated form
  const duplicatedForm = await prisma.form.create({
    data: {
      title: `${originalForm.title} (Copy)`,
      slug,
      description: originalForm.description,
      workspaceId: originalForm.workspaceId,
      createdBy: session.user.id,
      isPublished: false,
      isAcceptingResponses: true,
      settings: originalForm.settings ?? undefined,
      themeId: originalForm.themeId,
      // Duplicate fields
      fields: {
        create: originalForm.fields.map((field) => ({
          type: field.type,
          title: field.title,
          description: field.description,
          isRequired: field.isRequired,
          orderIndex: field.orderIndex,
          properties: field.properties as Prisma.InputJsonValue,
          validations: field.validations as Prisma.InputJsonValue | undefined,
          logicJumps: field.logicJumps as Prisma.InputJsonValue | undefined
        }))
      },
      // Duplicate screens
      screens: {
        create: originalForm.screens.map((screen) => ({
          type: screen.type,
          title: screen.title,
          description: screen.description,
          buttonText: screen.buttonText,
          mediaUrl: screen.mediaUrl,
          properties: screen.properties as Prisma.InputJsonValue | undefined
        }))
      }
    },
    include: {
      fields: true,
      screens: true
    }
  })

  return NextResponse.json({
    success: true,
    form: duplicatedForm,
    message: 'Form duplicated successfully'
  })
})
