import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'
import { withAuth } from '@/lib/apiHandler'
import { verifyWorkspaceAccess } from '@/lib/formAccess'

export const GET = withAuth(async (_req, { params }, session) => {
  const workspace = await verifyWorkspaceAccess(params.workspaceId, session.user.id, {
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { forms: true } },
    },
  })

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  return NextResponse.json({ workspace })
})

export const PATCH = withAuth(async (req, { params }, session) => {
  const workspace = await verifyWorkspaceAccess(params.workspaceId, session.user.id, { ownerOnly: true })
  if (!workspace) {
    return NextResponse.json(
      { error: 'Workspace not found or you are not the owner' },
      { status: 404 }
    )
  }

  const body = await req.json()

  // Whitelist allowed fields to prevent mass assignment
  const data: Record<string, unknown> = {}
  if (body.name !== undefined) {
    data.name = body.name
    data.slug = generateSlug(body.name, { fallback: 'workspace' })
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const updated = await prisma.workspace.update({
    where: { id: params.workspaceId },
    data,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return NextResponse.json({ workspace: updated })
})

export const DELETE = withAuth(async (_req, { params }, session) => {
  const workspace = await verifyWorkspaceAccess(params.workspaceId, session.user.id, { ownerOnly: true })
  if (!workspace) {
    return NextResponse.json(
      { error: 'Workspace not found or you are not the owner' },
      { status: 404 }
    )
  }

  await prisma.workspace.delete({
    where: { id: params.workspaceId },
  })

  return NextResponse.json({ success: true })
})
