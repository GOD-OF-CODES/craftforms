import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/forms/[formId]/screens/[screenId] - Get a specific screen
export async function GET(
  _req: Request,
  { params }: { params: { formId: string; screenId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const screen = await prisma.formScreen.findFirst({
      where: {
        id: params.screenId,
        formId: params.formId,
        form: {
          workspace: {
            OR: [
              { ownerId: session.user.id },
              { members: { some: { userId: session.user.id } } }
            ]
          }
        }
      }
    })

    if (!screen) {
      return NextResponse.json({ error: 'Screen not found' }, { status: 404 })
    }

    return NextResponse.json({ screen })
  } catch (error) {
    console.error('Get screen error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch screen' },
      { status: 500 }
    )
  }
}

// PATCH /api/forms/[formId]/screens/[screenId] - Update a screen
export async function PATCH(
  req: Request,
  { params }: { params: { formId: string; screenId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify screen access
    const existingScreen = await prisma.formScreen.findFirst({
      where: {
        id: params.screenId,
        formId: params.formId,
        form: {
          workspace: {
            OR: [
              { ownerId: session.user.id },
              { members: { some: { userId: session.user.id, role: { in: ['admin', 'editor'] } } } }
            ]
          }
        }
      }
    })

    if (!existingScreen) {
      return NextResponse.json({ error: 'Screen not found' }, { status: 404 })
    }

    const updates = await req.json()

    const screen = await prisma.formScreen.update({
      where: { id: params.screenId },
      data: {
        title: updates.title !== undefined ? updates.title : existingScreen.title,
        description: updates.description !== undefined ? updates.description : existingScreen.description,
        buttonText: updates.buttonText !== undefined ? updates.buttonText : existingScreen.buttonText,
        mediaUrl: updates.mediaUrl !== undefined ? updates.mediaUrl : existingScreen.mediaUrl,
        properties: updates.properties !== undefined ? updates.properties : existingScreen.properties
      }
    })

    return NextResponse.json({ screen })
  } catch (error) {
    console.error('Update screen error:', error)
    return NextResponse.json(
      { error: 'Failed to update screen' },
      { status: 500 }
    )
  }
}

// DELETE /api/forms/[formId]/screens/[screenId] - Delete a screen
export async function DELETE(
  _req: Request,
  { params }: { params: { formId: string; screenId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify screen access
    const existingScreen = await prisma.formScreen.findFirst({
      where: {
        id: params.screenId,
        formId: params.formId,
        form: {
          workspace: {
            OR: [
              { ownerId: session.user.id },
              { members: { some: { userId: session.user.id, role: { in: ['admin', 'editor'] } } } }
            ]
          }
        }
      }
    })

    if (!existingScreen) {
      return NextResponse.json({ error: 'Screen not found' }, { status: 404 })
    }

    await prisma.formScreen.delete({
      where: { id: params.screenId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete screen error:', error)
    return NextResponse.json(
      { error: 'Failed to delete screen' },
      { status: 500 }
    )
  }
}
