import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/forms/[formId]/responses/export - Export responses as CSV or Excel
export async function POST(
  req: NextRequest,
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
      },
      include: {
        fields: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const body = await req.json()
    const {
      format = 'csv',
      responseIds,
      startDate,
      endDate,
      status
    } = body

    // Build where clause
    const where: Record<string, unknown> = { formId: params.formId }

    // Filter by specific response IDs if provided
    if (responseIds && Array.isArray(responseIds) && responseIds.length > 0) {
      where.id = { in: responseIds }
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate)
      }
    }

    // Filter by status
    if (status === 'completed') {
      where.isCompleted = true
    } else if (status === 'incomplete') {
      where.isCompleted = false
    }

    // Get responses with answers
    const responses = await prisma.response.findMany({
      where,
      include: {
        answers: {
          include: {
            field: {
              select: {
                id: true,
                title: true,
                type: true,
                orderIndex: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Build field headers from form fields
    const fieldHeaders = form.fields.map(f => ({
      id: f.id,
      title: f.title || `Field ${f.orderIndex + 1}`,
      type: f.type
    }))

    // Format responses for export
    const rows = responses.map(response => {
      const row: Record<string, string> = {
        'Response ID': response.id,
        'Respondent ID': response.respondentId || '',
        'Status': response.isCompleted ? 'Completed' : 'Incomplete',
        'Submitted At': response.createdAt.toISOString(),
        'Started At': response.startedAt.toISOString(),
        'Completed At': response.completedAt?.toISOString() || '',
        'Time Taken (seconds)': response.timeTaken?.toString() || ''
      }

      // Add answers for each field
      fieldHeaders.forEach(field => {
        const answer = response.answers.find(a => a.field.id === field.id)
        if (answer) {
          row[field.title] = formatAnswerForExport(answer.value)
        } else {
          row[field.title] = ''
        }
      })

      return row
    })

    // Generate headers
    const headers = [
      'Response ID',
      'Respondent ID',
      'Status',
      'Submitted At',
      'Started At',
      'Completed At',
      'Time Taken (seconds)',
      ...fieldHeaders.map(f => f.title)
    ]

    if (format === 'csv') {
      // Generate CSV content
      const csvContent = generateCSV(headers, rows)

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${(form.title || 'responses').replace(/[^a-zA-Z0-9_\- ]/g, '')}-export.csv"`
        }
      })
    } else if (format === 'json') {
      // Return JSON for potential Excel conversion on client
      return NextResponse.json({
        headers,
        rows,
        form: {
          id: form.id,
          title: form.title
        },
        exportedAt: new Date().toISOString(),
        totalResponses: responses.length
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Export responses error:', error)
    return NextResponse.json(
      { error: 'Failed to export responses' },
      { status: 500 }
    )
  }
}

function formatAnswerForExport(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  // Handle object with 'value' property
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return formatAnswerForExport((value as Record<string, unknown>).value)
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(v => String(v)).join('; ')
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return String(value)
}

function generateCSV(headers: string[], rows: Record<string, string>[]): string {
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const headerRow = headers.map(escapeCSV).join(',')
  const dataRows = rows.map(row =>
    headers.map(header => escapeCSV(row[header] || '')).join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}
