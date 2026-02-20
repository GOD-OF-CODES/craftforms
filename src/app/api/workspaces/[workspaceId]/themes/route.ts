import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/apiHandler'
import { verifyWorkspaceAccess } from '@/lib/formAccess'

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
export const GET = withAuth(async (_req, { params }, session) => {
  const workspace = await verifyWorkspaceAccess(params.workspaceId, session.user.id)
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
})

// POST /api/workspaces/[workspaceId]/themes - Create theme
export const POST = withAuth(async (req, { params }, session) => {
  const workspace = await verifyWorkspaceAccess(params.workspaceId, session.user.id)
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
})
