import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/formAccessToken'

// GET /api/public/forms/[workspaceSlug]/[formSlug] - Get public form data
export async function GET(
  _req: NextRequest,
  { params }: { params: { workspaceSlug: string; formSlug: string } }
) {
  try {
    // Find workspace by slug
    const workspace = await prisma.workspace.findUnique({
      where: { slug: params.workspaceSlug }
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Find form by slug and workspace
    const form = await prisma.form.findFirst({
      where: {
        slug: params.formSlug,
        workspaceId: workspace.id
      },
      include: {
        fields: {
          orderBy: { orderIndex: 'asc' }
        },
        screens: true,
        theme: true
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Check if form is published
    if (!form.isPublished) {
      return NextResponse.json(
        { error: 'This form is not accepting responses' },
        { status: 403 }
      )
    }

    // Check if form is accepting responses
    if (!form.isAcceptingResponses) {
      return NextResponse.json(
        { error: 'This form is currently not accepting responses' },
        { status: 403 }
      )
    }

    // Check form settings for access restrictions
    const settings = form.settings as Record<string, unknown> | null

    // Check response limit using form.responseLimit
    if (form.responseLimit !== null) {
      const responseCount = await prisma.response.count({
        where: { formId: form.id }
      })
      if (responseCount >= form.responseLimit) {
        return NextResponse.json(
          { error: 'This form has reached its response limit' },
          { status: 403 }
        )
      }
    }

    // Check close date using form.closeDate (not settings)
    if (form.closeDate) {
      if (new Date() > form.closeDate) {
        return NextResponse.json(
          { error: 'This form is no longer accepting responses' },
          { status: 403 }
        )
      }
    }

    // Check if password protected
    const requiresPassword = !!form.passwordHash

    // If password-protected, only return full data if a valid access token is provided
    if (requiresPassword) {
      const accessToken = _req.nextUrl.searchParams.get('accessToken')
      if (!accessToken || !verifyAccessToken(accessToken, form.id)) {
        // Return minimal data — don't reveal form fields
        return NextResponse.json({
          form: {
            id: form.id,
            title: form.title,
            description: form.description,
            requiresPassword: true,
            fields: [],
            screens: [],
            theme: form.theme ? {
              colors: form.theme.colors,
              fonts: form.theme.fonts,
              backgroundImage: form.theme.backgroundImage
            } : null,
            settings: {}
          }
        })
      }
    }

    // Return form data for public consumption
    return NextResponse.json({
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        fields: form.fields.map(field => ({
          id: field.id,
          type: field.type,
          title: field.title,
          description: field.description,
          isRequired: field.isRequired,
          orderIndex: field.orderIndex,
          properties: field.properties,
          validations: field.validations,
          logicJumps: field.logicJumps
        })),
        screens: form.screens.map(screen => ({
          id: screen.id,
          type: screen.type,
          title: screen.title,
          description: screen.description,
          buttonText: screen.buttonText,
          mediaUrl: screen.mediaUrl,
          properties: screen.properties
        })),
        theme: form.theme ? {
          colors: form.theme.colors,
          fonts: form.theme.fonts,
          backgroundImage: form.theme.backgroundImage
        } : null,
        settings: {
          showProgressBar: settings?.showProgressBar !== false,
          showQuestionNumbers: settings?.showQuestionNumbers !== false,
          allowMultipleResponses: settings?.allowMultipleResponses === true,
          randomizeQuestions: settings?.randomizeQuestions === true
        },
        requiresPassword: false
      }
    })
  } catch (error) {
    console.error('Get public form error:', error)
    return NextResponse.json(
      { error: 'Failed to load form' },
      { status: 500 }
    )
  }
}
