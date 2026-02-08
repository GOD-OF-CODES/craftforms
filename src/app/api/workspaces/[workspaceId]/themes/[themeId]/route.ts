import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/workspaces/[workspaceId]/themes/[themeId]
export async function GET(
  _req: Request,
  { params }: { params: { workspaceId: string; themeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
  } catch (error) {
    console.error('Get theme error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    )
  }
}

// PATCH /api/workspaces/[workspaceId]/themes/[themeId]
export async function PATCH(
  req: Request,
  { params }: { params: { workspaceId: string; themeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
  } catch (error) {
    console.error('Update theme error:', error)
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    )
  }
}

// DELETE /api/workspaces/[workspaceId]/themes/[themeId]
export async function DELETE(
  _req: Request,
  { params }: { params: { workspaceId: string; themeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Check if the user is the creator or workspace owner
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: params.workspaceId,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id, role: 'admin' } } }
        ]
      }
    })

    if (!workspace && theme.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    await prisma.theme.delete({
      where: { id: params.themeId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete theme error:', error)
    return NextResponse.json(
      { error: 'Failed to delete theme' },
      { status: 500 }
    )
  }
}
