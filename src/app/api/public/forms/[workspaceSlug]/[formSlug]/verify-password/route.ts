import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// POST /api/public/forms/[workspaceSlug]/[formSlug]/verify-password
export async function POST(
  req: Request,
  { params }: { params: { workspaceSlug: string; formSlug: string } }
) {
  try {
    const body = await req.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    // Find workspace by slug
    const workspace = await prisma.workspace.findUnique({
      where: { slug: params.workspaceSlug }
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Find form by slug and workspace
    const form = await prisma.form.findFirst({
      where: {
        slug: params.formSlug,
        workspaceId: workspace.id
      },
      select: {
        id: true,
        passwordHash: true
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    if (!form.passwordHash) {
      return NextResponse.json({ error: 'Form is not password protected' }, { status: 400 })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, form.passwordHash)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Return a token that can be used to access the form
    // In a production app, this would be a JWT or session token
    // For now, we'll return a simple success response
    return NextResponse.json({
      success: true,
      formId: form.id
    })
  } catch (error) {
    console.error('Verify password error:', error)
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    )
  }
}
