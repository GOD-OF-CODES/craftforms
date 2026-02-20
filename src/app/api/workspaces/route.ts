import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'
import { withAuth } from '@/lib/apiHandler'

export const GET = withAuth(async (_req, _ctx, session) => {
  const workspaces = await prisma.workspace.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          forms: true,
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json({ workspaces })
})

export const POST = withAuth(async (req, _ctx, session) => {
  const { name } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json(
      { error: 'Workspace name is required' },
      { status: 400 }
    )
  }

  const slug = generateSlug(name, { fallback: 'workspace' })

  // Check if slug already exists for this user
  const existing = await prisma.workspace.findFirst({
    where: {
      slug,
      ownerId: session.user.id,
    },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'A workspace with this name already exists' },
      { status: 400 }
    )
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      slug,
      ownerId: session.user.id,
    },
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

  return NextResponse.json({ workspace }, { status: 201 })
})
