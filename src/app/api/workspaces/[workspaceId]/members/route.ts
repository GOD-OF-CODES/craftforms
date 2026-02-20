import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hasPermission, WorkspaceRole } from '@/lib/permissions'
import { sendInvitationEmail } from '@/lib/email'
import crypto from 'crypto'
import { withAuth } from '@/lib/apiHandler'

// GET /api/workspaces/[workspaceId]/members - List all members
export const GET = withAuth(async (_req, { params }, session) => {
  // Check if user has access to this workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: params.workspaceId,
      userId: session.user.id
    }
  })

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: params.workspaceId,
      ownerId: session.user.id
    }
  })

  if (!membership && !workspace) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Get all members
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: params.workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  // Also get the owner
  const workspaceWithOwner = await prisma.workspace.findUnique({
    where: { id: params.workspaceId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true
        }
      }
    }
  })

  return NextResponse.json({
    members,
    owner: workspaceWithOwner?.owner
  })
})

// POST /api/workspaces/[workspaceId]/members - Invite a new member
export const POST = withAuth(async (req, { params }, session) => {
  // Check if user can manage members
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: params.workspaceId,
      userId: session.user.id
    }
  })

  const workspace = await prisma.workspace.findFirst({
    where: { id: params.workspaceId },
    include: { owner: true }
  })

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const isOwner = workspace.ownerId === session.user.id
  const userRole: WorkspaceRole = isOwner ? 'owner' : (membership?.role as WorkspaceRole) || 'viewer'

  if (!hasPermission(userRole, 'workspace:manage_members')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const { email, role } = await req.json()

  if (!email || !role) {
    return NextResponse.json(
      { error: 'Email and role are required' },
      { status: 400 }
    )
  }

  // Validate role
  if (!['admin', 'editor', 'viewer'].includes(role)) {
    return NextResponse.json(
      { error: 'Invalid role. Must be admin, editor, or viewer' },
      { status: 400 }
    )
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    // Check if already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: existingUser.id
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this workspace' },
        { status: 400 }
      )
    }

    // Check if owner
    if (workspace.ownerId === existingUser.id) {
      return NextResponse.json(
        { error: 'User is the owner of this workspace' },
        { status: 400 }
      )
    }

    // Add as member directly
    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: params.workspaceId,
        userId: existingUser.id,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    })

    return NextResponse.json({ member, invited: false })
  }

  // User doesn't exist - create invitation
  const inviteToken = crypto.randomBytes(32).toString('hex')

  // Send invitation email
  await sendInvitationEmail(
    email,
    session.user.name || 'A team member',
    workspace.name,
    role,
    inviteToken
  )

  return NextResponse.json({
    success: true,
    invited: true,
    message: `Invitation sent to ${email}`
  })
})
