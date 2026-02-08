import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/forms/[formId]/screens - Get all screens for a form
export async function GET(
  _req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify form access
    const form = await prisma.form.findFirst({
      where: {
        id: params.formId,
        workspace: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id } } }
          ]
        }
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const screens = await prisma.formScreen.findMany({
      where: { formId: params.formId },
      orderBy: { type: 'asc' } // welcome comes before thank_you alphabetically
    })

    return NextResponse.json({ screens })
  } catch (error) {
    console.error('Get screens error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch screens' },
      { status: 500 }
    )
  }
}

// POST /api/forms/[formId]/screens - Create or update a screen
export async function POST(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify form access
    const form = await prisma.form.findFirst({
      where: {
        id: params.formId,
        workspace: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id, role: { in: ['admin', 'editor'] } } } }
          ]
        }
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const { type, title, description, buttonText, mediaUrl, properties } = await req.json()

    if (!type || !['welcome', 'thank_you'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid screen type. Must be "welcome" or "thank_you"' },
        { status: 400 }
      )
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Check if screen already exists
    const existingScreen = await prisma.formScreen.findFirst({
      where: {
        formId: params.formId,
        type
      }
    })

    let screen
    if (existingScreen) {
      // Update existing screen
      screen = await prisma.formScreen.update({
        where: { id: existingScreen.id },
        data: {
          title,
          description,
          buttonText,
          mediaUrl,
          properties: properties || {}
        }
      })
    } else {
      // Create new screen
      screen = await prisma.formScreen.create({
        data: {
          formId: params.formId,
          type,
          title,
          description,
          buttonText,
          mediaUrl,
          properties: properties || {}
        }
      })
    }

    return NextResponse.json({ screen })
  } catch (error) {
    console.error('Create/update screen error:', error)
    return NextResponse.json(
      { error: 'Failed to save screen' },
      { status: 500 }
    )
  }
}
