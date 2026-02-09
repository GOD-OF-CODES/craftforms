import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyFormAccess } from '@/lib/authz'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50) || 'untitled-form'
}

export async function GET(_req: Request, { params }: { params: { formId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await verifyFormAccess(params.formId, session.user.id, {
      includeFields: true,
      includeScreens: true,
      includeTheme: true,
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    return NextResponse.json({ form })
  } catch (error) {
    console.error('Get form error:', error)
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { formId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership before allowing update
    const existingForm = await verifyFormAccess(params.formId, session.user.id)

    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const body = await req.json()

    // Build update data
    const updateData: Record<string, unknown> = {}

    // Basic fields
    if (body.title !== undefined) {
      updateData.title = body.title
      if (body.slug === undefined) {
        updateData.slug = generateSlug(body.title)
      }
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
      updateData.passwordHash = await bcrypt.hash(body.password, 12)
    }
    if (body.removePassword) {
      updateData.passwordHash = null
    }

    // Settings (merge with existing)
    if (body.settings) {
      const existingSettings = (existingForm.settings as Record<string, unknown>) || {}
      updateData.settings = { ...existingSettings, ...body.settings }
    }

    const form = await prisma.form.update({
      where: { id: params.formId },
      data: updateData,
    })

    return NextResponse.json({ form })
  } catch (error) {
    console.error('Update form error:', error)
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { formId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership before allowing delete
    const form = await verifyFormAccess(params.formId, session.user.id)

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    await prisma.form.delete({
      where: { id: params.formId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete form error:', error)
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 })
  }
}
