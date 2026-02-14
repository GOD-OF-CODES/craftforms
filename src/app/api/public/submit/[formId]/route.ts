import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// POST /api/public/submit/[formId] - Submit a form response
export async function POST(
  req: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const form = await prisma.form.findUnique({
      where: { id: params.formId },
      include: {
        fields: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    if (!form.isPublished) {
      return NextResponse.json(
        { error: 'This form is not published' },
        { status: 403 }
      )
    }

    if (!form.isAcceptingResponses) {
      return NextResponse.json(
        { error: 'This form is not accepting responses' },
        { status: 403 }
      )
    }

    // Check response limit
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

    // Check close date
    if (form.closeDate && new Date() > form.closeDate) {
      return NextResponse.json(
        { error: 'This form is no longer accepting responses' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { answers, startedAt } = body

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      )
    }

    // Validate required fields
    for (const field of form.fields) {
      if (field.isRequired && !(field.id in answers)) {
        return NextResponse.json(
          { error: `Field "${field.title}" is required` },
          { status: 400 }
        )
      }
    }

    // Get IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      req.headers.get('x-real-ip') ||
                      'unknown'
    const userAgent = req.headers.get('user-agent') || undefined

    const startTime = startedAt ? new Date(startedAt) : new Date()
    const now = new Date()
    const timeTaken = Math.round((now.getTime() - startTime.getTime()) / 1000)

    // Create response with answers in a transaction
    const response = await prisma.$transaction(async (tx) => {
      const newResponse = await tx.response.create({
        data: {
          formId: form.id,
          respondentId: crypto.randomUUID(),
          ipAddress,
          userAgent,
          startedAt: startTime,
          completedAt: now,
          timeTaken: timeTaken > 0 ? timeTaken : null,
          isCompleted: true,
        }
      })

      // Create answer records
      const answerEntries = Object.entries(answers)
      if (answerEntries.length > 0) {
        await tx.responseAnswer.createMany({
          data: answerEntries
            .filter(([fieldId]) => form.fields.some(f => f.id === fieldId))
            .map(([fieldId, value]) => ({
              responseId: newResponse.id,
              fieldId,
              value: (typeof value === 'object' && value !== null ? value : { value }) as Prisma.InputJsonValue,
            }))
        })
      }

      return newResponse
    })

    return NextResponse.json({
      success: true,
      responseId: response.id
    })
  } catch (error) {
    console.error('Submit form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    )
  }
}
