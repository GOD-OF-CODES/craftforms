import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, WorkspaceRole } from '@/lib/permissions'
import { sendInvitationEmail } from '@/lib/email'
import crypto from 'crypto'

// GET /api/workspaces/[workspaceId]/members - List all members
export async function GET(
  _req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// POST /api/workspaces/[workspaceId]/members - Invite a new member
export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    // Expiry: 7 days from now (would be stored in invitations table)
    // const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Store invitation (you might want a separate invitations table)
    // For now, we'll create a pending member with the invite token
    // This is a simplified approach - a full implementation would use a separate table

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
  } catch (error) {
    console.error('Invite member error:', error)
    return NextResponse.json(
      { error: 'Failed to invite member' },
      { status: 500 }
    )
  }
}
