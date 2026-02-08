import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Default theme colors
const DEFAULT_COLORS = {
  primary: '#6366f1',
  primaryText: '#ffffff',
  background: '#ffffff',
  text: '#1f2937',
  secondaryText: '#6b7280',
  error: '#ef4444',
  success: '#22c55e',
}

// Default theme fonts
const DEFAULT_FONTS = {
  questionFamily: 'Inter',
  questionSize: '24px',
  questionWeight: '600',
  answerFamily: 'Inter',
  answerSize: '18px',
  answerWeight: '400',
  buttonFamily: 'Inter',
  buttonSize: '16px',
  buttonWeight: '500',
}

// GET /api/workspaces/[workspaceId]/themes - List themes
export async function GET(
  _req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify workspace access
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

    // Get workspace themes and public themes
    const themes = await prisma.theme.findMany({
      where: {
        OR: [
          { workspaceId: params.workspaceId },
          { isPublic: true }
        ]
      },
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json(themes)
  } catch (error) {
    console.error('Get themes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    )
  }
}

// POST /api/workspaces/[workspaceId]/themes - Create theme
export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify workspace access
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

    const body = await req.json()

    const theme = await prisma.theme.create({
      data: {
        name: body.name || 'Untitled Theme',
        workspaceId: params.workspaceId,
        createdBy: session.user.id,
        colors: body.colors || DEFAULT_COLORS,
        fonts: body.fonts || DEFAULT_FONTS,
        backgroundImage: body.backgroundImage || null,
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

    return NextResponse.json(theme, { status: 201 })
  } catch (error) {
    console.error('Create theme error:', error)
    return NextResponse.json(
      { error: 'Failed to create theme' },
      { status: 500 }
    )
  }
}
