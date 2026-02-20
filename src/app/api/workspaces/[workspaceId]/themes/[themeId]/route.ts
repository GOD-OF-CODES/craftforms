import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/apiHandler'

// GET /api/workspaces/[workspaceId]/themes/[themeId]
export const GET = withAuth(async (_req, { params }) => {
  const theme = await prisma.theme.findFirst({
    where: {
      id: params.themeId,
      OR: [
        { workspaceId: params.workspaceId },
        { isPublic: true }
      ]
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        }
      },
      _count: {
        select: { forms: true }
      }
    }
  })

  if (!theme) {
    return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
  }

  return NextResponse.json(theme)
})

// PATCH /api/workspaces/[workspaceId]/themes/[themeId]
export const PATCH = withAuth(async (req, { params }, session) => {
  // Verify theme exists in workspace
  const theme = await prisma.theme.findFirst({
    where: {
      id: params.themeId,
      workspaceId: params.workspaceId,
    }
  })

  if (!theme) {
    return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
  }

  // Verify user is workspace admin/owner or theme creator
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: params.workspaceId,
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id, role: { in: ['admin', 'editor'] } } } }
      ]
    }
  })

  if (!workspace && theme.createdBy !== session.user.id) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  const body = await req.json()

  const updatedTheme = await prisma.theme.update({
    where: { id: params.themeId },
    data: {
      name: body.name !== undefined ? body.name : undefined,
      colors: body.colors !== undefined ? body.colors : undefined,
      fonts: body.fonts !== undefined ? body.fonts : undefined,
      backgroundImage: body.backgroundImage !== undefined ? body.backgroundImage : undefined,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  })

  return NextResponse.json(updatedTheme)
})

// DELETE /api/workspaces/[workspaceId]/themes/[themeId]
export const DELETE = withAuth(async (_req, { params }, session) => {
  // Verify theme ownership
  const theme = await prisma.theme.findFirst({
    where: {
      id: params.themeId,
      workspaceId: params.workspaceId,
    }
  })

  if (!theme) {
    return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
  }

  // Verify user is a current workspace member
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: params.workspaceId,
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } }
      ]
    }
  })

  if (!workspace) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  // Only workspace admin/owner or theme creator can delete
  const isAdmin = await prisma.workspace.findFirst({
    where: {
      id: params.workspaceId,
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id, role: 'admin' } } }
      ]
    }
  })

  if (!isAdmin && theme.createdBy !== session.user.id) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  await prisma.theme.delete({
    where: { id: params.themeId }
  })

  return NextResponse.json({ success: true })
})
