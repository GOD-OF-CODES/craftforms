import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/workspaces/[workspaceId]/themes/[themeId]/duplicate
export async function POST(
  _req: Request,
  { params }: { params: { workspaceId: string; themeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the source theme
    const sourceTheme = await prisma.theme.findFirst({
      where: {
        id: params.themeId,
        OR: [
          { workspaceId: params.workspaceId },
          { isPublic: true }
        ]
      }
    })

    if (!sourceTheme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
    }

    // Verify workspace access for the target workspace
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
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Create the duplicate
    const duplicatedTheme = await prisma.theme.create({
      data: {
        name: `${sourceTheme.name} (Copy)`,
        workspaceId: params.workspaceId,
        createdBy: session.user.id,
        colors: sourceTheme.colors as object,
        fonts: sourceTheme.fonts as object,
        backgroundImage: sourceTheme.backgroundImage,
        isPublic: false,
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

    return NextResponse.json(duplicatedTheme, { status: 201 })
  } catch (error) {
    console.error('Duplicate theme error:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate theme' },
      { status: 500 }
    )
  }
}
