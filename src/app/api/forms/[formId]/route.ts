import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/apiHandler'

export const GET = withAuth(async (_req, { params }) => {
  const form = await prisma.form.findUnique({
    where: { id: params.formId },
    include: {
      fields: {
        orderBy: { orderIndex: 'asc' },
      },
      screens: true,
      theme: true,
    },
  })

  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  return NextResponse.json({ form })
})

export const PATCH = withAuth(async (req, { params }) => {
  const body = await req.json()

  // Build update data
  const updateData: Record<string, unknown> = {}

  // Basic fields
  if (body.title !== undefined) {
    updateData.title = body.title
  }
  if (body.slug !== undefined) updateData.slug = body.slug
  if (body.description !== undefined) updateData.description = body.description
  if (body.isPublished !== undefined) updateData.isPublished = body.isPublished
  if (body.isAcceptingResponses !== undefined) updateData.isAcceptingResponses = body.isAcceptingResponses
  if (body.responseLimit !== undefined) updateData.responseLimit = body.responseLimit
  if (body.closeDate !== undefined) updateData.closeDate = body.closeDate ? new Date(body.closeDate) : null
  if (body.themeId !== undefined) updateData.themeId = body.themeId

  // Password protection
  if (body.password) {
    const salt = await bcrypt.genSalt(12)
    updateData.passwordHash = await bcrypt.hash(body.password, salt)
  }
  if (body.removePassword) {
    updateData.passwordHash = null
  }

  // Settings (merge with existing)
  if (body.settings) {
    const existingForm = await prisma.form.findUnique({
      where: { id: params.formId },
      select: { settings: true }
    })
    const existingSettings = (existingForm?.settings as Record<string, unknown>) || {}
    updateData.settings = { ...existingSettings, ...body.settings }
  }

  const form = await prisma.form.update({
    where: { id: params.formId },
    data: updateData,
  })

  return NextResponse.json({ form })
})

export const DELETE = withAuth(async (_req, { params }) => {
  await prisma.form.delete({
    where: { id: params.formId },
  })

  return NextResponse.json({ success: true })
})
