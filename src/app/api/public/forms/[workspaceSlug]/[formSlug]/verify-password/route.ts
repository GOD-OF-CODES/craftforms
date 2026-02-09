import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from '@/lib/rateLimit'
import { generateAccessToken } from '@/lib/formAccessToken'

// POST /api/public/forms/[workspaceSlug]/[formSlug]/verify-password
export async function POST(
  req: Request,
  { params }: { params: { workspaceSlug: string; formSlug: string } }
) {
  try {
    // Rate limit password attempts
    const clientId = getClientIdentifier(req)
    const rateCheck = checkRateLimit(`pw:${clientId}:${params.formSlug}`, rateLimitConfigs.auth)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

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

    // Return a signed HMAC access token
    const accessToken = generateAccessToken(form.id)

    return NextResponse.json({
      success: true,
      formId: form.id,
      accessToken
    })
  } catch (error) {
    console.error('Verify password error:', error)
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    )
  }
}
