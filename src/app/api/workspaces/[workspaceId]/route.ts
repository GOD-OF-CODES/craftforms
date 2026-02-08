import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50) || 'workspace'
}

export async function GET(_req: Request, { params }: { params: { workspaceId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: params.workspaceId,
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
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            forms: true,
          },
        },
      },
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    return NextResponse.json({ workspace })
  } catch (error) {
    console.error('Get workspace error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request, { params }: { params: { workspaceId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: params.workspaceId,
        ownerId: session.user.id,
      },
    })

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
      data.slug = generateSlug(body.name)
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
  } catch (error) {
    console.error('Update workspace error:', error)
    return NextResponse.json(
      { error: 'Failed to update workspace' },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, { params }: { params: { workspaceId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: params.workspaceId,
        ownerId: session.user.id,
      },
    })

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
  } catch (error) {
    console.error('Delete workspace error:', error)
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 }
    )
  }
}
