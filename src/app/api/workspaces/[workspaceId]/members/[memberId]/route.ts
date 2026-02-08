import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManageUser, canChangeRole, WorkspaceRole } from '@/lib/permissions'

// PATCH /api/workspaces/[workspaceId]/members/[memberId] - Update member role
export async function PATCH(
  req: Request,
  { params }: { params: { workspaceId: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get workspace and check ownership
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId }
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Get current user's membership
    const currentUserMembership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: session.user.id
      }
    })

    const isOwner = workspace.ownerId === session.user.id
    const currentUserRole: WorkspaceRole = isOwner ? 'owner' : (currentUserMembership?.role as WorkspaceRole) || 'viewer'

    // Get target member
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: params.memberId },
      include: { user: true }
    })

    if (!targetMember || targetMember.workspaceId !== params.workspaceId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Cannot manage yourself
    if (targetMember.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    const { role } = await req.json()

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
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

    const targetRole = targetMember.role as WorkspaceRole

    // Check if current user can change this member's role
    if (!canChangeRole(currentUserRole, targetRole, role as WorkspaceRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to change this role' },
        { status: 403 }
      )
    }

    // Update member role
    const updatedMember = await prisma.workspaceMember.update({
      where: { id: params.memberId },
      data: { role },
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

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Update member error:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE /api/workspaces/[workspaceId]/members/[memberId] - Remove member
export async function DELETE(
  _req: Request,
  { params }: { params: { workspaceId: string; memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId }
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Get current user's membership
    const currentUserMembership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: session.user.id
      }
    })

    const isOwner = workspace.ownerId === session.user.id
    const currentUserRole: WorkspaceRole = isOwner ? 'owner' : (currentUserMembership?.role as WorkspaceRole) || 'viewer'

    // Get target member
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: params.memberId },
      include: { user: true }
    })

    if (!targetMember || targetMember.workspaceId !== params.workspaceId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check if this is a self-removal (leaving workspace)
    const isSelfRemoval = targetMember.userId === session.user.id

    if (isSelfRemoval) {
      // Anyone can leave a workspace (except owner via this route)
      if (isOwner) {
        return NextResponse.json(
          { error: 'Owner cannot leave the workspace. Transfer ownership first or delete the workspace.' },
          { status: 400 }
        )
      }
    } else {
      // Removing another member - check permissions
      const targetRole = targetMember.role as WorkspaceRole

      if (!canManageUser(currentUserRole, targetRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to remove this member' },
          { status: 403 }
        )
      }
    }

    // Remove member
    await prisma.workspaceMember.delete({
      where: { id: params.memberId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    )
  }
}
