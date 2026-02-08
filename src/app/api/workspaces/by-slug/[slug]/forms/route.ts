import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find workspace by slug
    const workspace = await prisma.workspace.findUnique({
      where: { slug: params.slug },
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Check user has access to workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: session.user.id,
        },
      },
    })

    if (!member && workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get forms with response stats
    const forms = await prisma.form.findMany({
      where: {
        workspaceId: workspace.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        responses: {
          select: {
            id: true,
            isCompleted: true,
            timeTaken: true,
            createdAt: true,
          },
        },
      },
    })

    // Transform to include analytics
    const formsWithStats = forms.map((form) => {
      const responseCount = form.responses.length
      const completedCount = form.responses.filter((r) => r.isCompleted).length
      const completedResponses = form.responses.filter((r) => r.timeTaken !== null)
      const avgTimeTaken = completedResponses.length > 0
        ? completedResponses.reduce((sum, r) => sum + (r.timeTaken || 0), 0) / completedResponses.length
        : null
      const lastResponse = form.responses.length > 0
        ? form.responses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null

      return {
        id: form.id,
        title: form.title,
        slug: form.slug,
        isPublished: form.isPublished,
        responseCount,
        completedCount,
        avgTimeTaken,
        lastResponseAt: lastResponse?.createdAt || null,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
      }
    })

    return NextResponse.json({ forms: formsWithStats })
  } catch (error) {
    console.error('Get forms by slug error:', error)
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
  }
}
