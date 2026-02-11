import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50) || 'my-workspace'
}

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 10) {
      return NextResponse.json(
        { error: 'Password must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, and a number' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Hash password with 12 rounds (as per security requirements)
    const hashedPassword = await hash(password, 12)

    // Create user with default workspace in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name: name || null,
          password: hashedPassword,
          emailVerified: null,
        },
      })

      // Create default workspace for the user
      const workspaceName = name ? `${name}'s Workspace` : 'My Workspace'
      let workspaceSlug = generateSlug(workspaceName)

      // Ensure slug is unique
      const existingWorkspace = await tx.workspace.findUnique({
        where: { slug: workspaceSlug },
      })
      if (existingWorkspace) {
        workspaceSlug = `${workspaceSlug}-${Date.now()}`
      }

      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug: workspaceSlug,
          ownerId: user.id,
        },
      })

      // Add user as workspace member with owner role
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'owner',
        },
      })

      return { user, workspace }
    })

    // Return user without password
    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        workspace: {
          id: result.workspace.id,
          slug: result.workspace.slug,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)

    // Provide more specific error messages for common failures
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      )
    }

    if (error?.code === 'P1001' || error?.code === 'P1002') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred during signup. Please try again.' },
      { status: 500 }
    )
  }
}
