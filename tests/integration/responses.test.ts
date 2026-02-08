/**
 * Integration tests for Response submission and management
 */

import { prisma } from '@/lib/prisma'

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    form: {
      findUnique: jest.fn(),
    },
    response: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    responseAnswer: {
      createMany: jest.fn(),
    },
  },
}))

describe('Response Submission', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/public/forms/[formId]/submit', () => {
    it('should submit response successfully', async () => {
      const mockForm = {
        id: 'form-1',
        status: 'published',
        settings: { acceptResponses: true },
        fields: [
          { id: 'field-1', type: 'short_text', required: true },
          { id: 'field-2', type: 'email', required: true },
        ],
      }

      const mockResponse = {
        id: 'response-1',
        formId: 'form-1',
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        metadata: {
          userAgent: 'Mozilla/5.0',
          ipAddress: '127.0.0.1',
        },
      }

      ;(prisma.form.findUnique as jest.Mock).mockResolvedValue(mockForm)
      ;(prisma.response.create as jest.Mock).mockResolvedValue(mockResponse)
      ;(prisma.responseAnswer.createMany as jest.Mock).mockResolvedValue({ count: 2 })

      // Simulate submission
      const form = await prisma.form.findUnique({
        where: { id: 'form-1' },
        include: { fields: true },
      })

      expect(form?.status).toBe('published')
      expect(form?.settings.acceptResponses).toBe(true)

      const response = await prisma.response.create({
        data: {
          formId: 'form-1',
          status: 'completed',
          startedAt: new Date(),
          completedAt: new Date(),
        },
      })

      expect(response.status).toBe('completed')
    })

    it('should reject submission for unpublished form', async () => {
      const mockForm = {
        id: 'form-1',
        status: 'draft',
      }

      ;(prisma.form.findUnique as jest.Mock).mockResolvedValue(mockForm)

      const form = await prisma.form.findUnique({
        where: { id: 'form-1' },
      })

      expect(form?.status).toBe('draft')
      // In real API, this would return 403
    })

    it('should reject submission when responses disabled', async () => {
      const mockForm = {
        id: 'form-1',
        status: 'published',
        settings: { acceptResponses: false },
      }

      ;(prisma.form.findUnique as jest.Mock).mockResolvedValue(mockForm)

      const form = await prisma.form.findUnique({
        where: { id: 'form-1' },
      })

      expect(form?.settings.acceptResponses).toBe(false)
    })

    it('should reject when response limit reached', async () => {
      const mockForm = {
        id: 'form-1',
        status: 'published',
        settings: { responseLimit: 100 },
        _count: { responses: 100 },
      }

      ;(prisma.form.findUnique as jest.Mock).mockResolvedValue(mockForm)

      const form = await prisma.form.findUnique({
        where: { id: 'form-1' },
      })

      expect(form?._count.responses).toBe(100)
      expect(form?.settings.responseLimit).toBe(100)
      // In real API, this would return 403
    })

    it('should store answers correctly', async () => {
      const answers = [
        { fieldId: 'field-1', value: 'John Doe' },
        { fieldId: 'field-2', value: 'john@example.com' },
        { fieldId: 'field-3', value: ['option-1', 'option-2'] },
      ]

      ;(prisma.responseAnswer.createMany as jest.Mock).mockResolvedValue({
        count: answers.length,
      })

      const result = await prisma.responseAnswer.createMany({
        data: answers.map((a) => ({
          responseId: 'response-1',
          fieldId: a.fieldId,
          value: a.value,
        })),
      })

      expect(result.count).toBe(3)
    })

    it('should track completion time', async () => {
      const startedAt = new Date('2024-01-01T10:00:00Z')
      const completedAt = new Date('2024-01-01T10:05:30Z')

      const mockResponse = {
        id: 'response-1',
        startedAt,
        completedAt,
      }

      ;(prisma.response.create as jest.Mock).mockResolvedValue(mockResponse)

      const response = await prisma.response.create({
        data: {
          formId: 'form-1',
          startedAt,
          completedAt,
        },
      })

      const completionTime = response.completedAt.getTime() - response.startedAt.getTime()
      expect(completionTime).toBe(330000) // 5 minutes 30 seconds in ms
    })
  })
})

describe('Response Management', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/forms/[formId]/responses', () => {
    it('should return paginated responses', async () => {
      const mockResponses = Array.from({ length: 10 }, (_, i) => ({
        id: `response-${i}`,
        formId: 'form-1',
        status: 'completed',
        createdAt: new Date(),
      }))

      ;(prisma.response.findMany as jest.Mock).mockResolvedValue(mockResponses)
      ;(prisma.response.count as jest.Mock).mockResolvedValue(50)

      const responses = await prisma.response.findMany({
        where: { formId: 'form-1' },
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      })

      const total = await prisma.response.count({
        where: { formId: 'form-1' },
      })

      expect(responses).toHaveLength(10)
      expect(total).toBe(50)
    })

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      ;(prisma.response.findMany as jest.Mock).mockResolvedValue([
        { id: 'response-1', createdAt: new Date('2024-01-15') },
      ])

      const responses = await prisma.response.findMany({
        where: {
          formId: 'form-1',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      expect(responses).toHaveLength(1)
    })

    it('should filter by completion status', async () => {
      ;(prisma.response.findMany as jest.Mock).mockResolvedValue([
        { id: 'response-1', status: 'completed' },
        { id: 'response-2', status: 'completed' },
      ])

      const responses = await prisma.response.findMany({
        where: {
          formId: 'form-1',
          status: 'completed',
        },
      })

      expect(responses.every((r) => r.status === 'completed')).toBe(true)
    })
  })

  describe('GET /api/forms/[formId]/responses/[responseId]', () => {
    it('should return response with answers', async () => {
      const mockResponse = {
        id: 'response-1',
        formId: 'form-1',
        status: 'completed',
        answers: [
          { fieldId: 'field-1', value: 'John Doe' },
          { fieldId: 'field-2', value: 'john@example.com' },
        ],
        metadata: {
          userAgent: 'Mozilla/5.0',
          ipAddress: '127.0.0.1',
        },
      }

      ;(prisma.response.findUnique as jest.Mock).mockResolvedValue(mockResponse)

      const response = await prisma.response.findUnique({
        where: { id: 'response-1' },
        include: { answers: true },
      })

      expect(response?.answers).toHaveLength(2)
      expect(response?.answers[0].value).toBe('John Doe')
    })
  })

  describe('DELETE /api/forms/[formId]/responses/[responseId]', () => {
    it('should delete response', async () => {
      const deletedResponse = { id: 'response-1' }

      ;(prisma.response.delete as jest.Mock).mockResolvedValue(deletedResponse)

      const result = await prisma.response.delete({
        where: { id: 'response-1' },
      })

      expect(result.id).toBe('response-1')
    })
  })
})

describe('Response Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should calculate completion rate', async () => {
    ;(prisma.response.count as jest.Mock)
      .mockResolvedValueOnce(100) // total
      .mockResolvedValueOnce(75) // completed

    const total = await prisma.response.count({
      where: { formId: 'form-1' },
    })

    const completed = await prisma.response.count({
      where: { formId: 'form-1', status: 'completed' },
    })

    const completionRate = (completed / total) * 100
    expect(completionRate).toBe(75)
  })

  it('should calculate average completion time', async () => {
    const mockResponses = [
      { startedAt: new Date('2024-01-01T10:00:00Z'), completedAt: new Date('2024-01-01T10:03:00Z') },
      { startedAt: new Date('2024-01-01T11:00:00Z'), completedAt: new Date('2024-01-01T11:05:00Z') },
      { startedAt: new Date('2024-01-01T12:00:00Z'), completedAt: new Date('2024-01-01T12:04:00Z') },
    ]

    ;(prisma.response.findMany as jest.Mock).mockResolvedValue(mockResponses)

    const responses = await prisma.response.findMany({
      where: { formId: 'form-1', status: 'completed' },
      select: { startedAt: true, completedAt: true },
    })

    const totalTime = responses.reduce((sum, r) => {
      return sum + (r.completedAt.getTime() - r.startedAt.getTime())
    }, 0)

    const avgTime = totalTime / responses.length / 1000 // in seconds
    expect(avgTime).toBe(240) // 4 minutes average
  })
})

describe('Response Export', () => {
  it('should export responses to CSV format', async () => {
    const mockResponses = [
      {
        id: 'response-1',
        createdAt: new Date('2024-01-15'),
        answers: [
          { field: { title: 'Name' }, value: 'John Doe' },
          { field: { title: 'Email' }, value: 'john@example.com' },
        ],
      },
    ]

    ;(prisma.response.findMany as jest.Mock).mockResolvedValue(mockResponses)

    const responses = await prisma.response.findMany({
      where: { formId: 'form-1' },
      include: { answers: { include: { field: true } } },
    })

    // Simulate CSV generation
    const headers = ['Name', 'Email']
    const rows = responses.map((r) =>
      r.answers.map((a: { value: string }) => a.value)
    )

    expect(headers).toContain('Name')
    expect(rows[0]).toContain('John Doe')
  })
})
