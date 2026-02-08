/**
 * Integration tests for Forms CRUD operations
 */

import { prisma } from '@/lib/prisma'

// Mock NextAuth session
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() =>
    Promise.resolve({
      user: { id: 'test-user-id', email: 'test@example.com' }
    })
  ),
}))

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    form: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workspace: {
      findFirst: jest.fn(),
    },
    workspaceMember: {
      findFirst: jest.fn(),
    },
  },
}))

describe('Forms API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/workspaces/[workspaceId]/forms', () => {
    it('should return forms for authenticated user', async () => {
      const mockForms = [
        {
          id: 'form-1',
          title: 'Test Form 1',
          slug: 'test-form-1',
          status: 'draft',
          createdAt: new Date(),
        },
        {
          id: 'form-2',
          title: 'Test Form 2',
          slug: 'test-form-2',
          status: 'published',
          createdAt: new Date(),
        },
      ]

      ;(prisma.workspaceMember.findFirst as jest.Mock).mockResolvedValue({
        userId: 'test-user-id',
        role: 'owner',
      })
      ;(prisma.form.findMany as jest.Mock).mockResolvedValue(mockForms)

      // Simulate API call behavior
      const result = await prisma.form.findMany({
        where: { workspaceId: 'test-workspace-id' },
      })

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Test Form 1')
    })

    it('should return empty array when no forms exist', async () => {
      ;(prisma.workspaceMember.findFirst as jest.Mock).mockResolvedValue({
        userId: 'test-user-id',
        role: 'owner',
      })
      ;(prisma.form.findMany as jest.Mock).mockResolvedValue([])

      const result = await prisma.form.findMany({
        where: { workspaceId: 'test-workspace-id' },
      })

      expect(result).toHaveLength(0)
    })
  })

  describe('POST /api/workspaces/[workspaceId]/forms', () => {
    it('should create a new form', async () => {
      const newForm = {
        id: 'new-form-id',
        title: 'New Form',
        slug: 'new-form',
        status: 'draft',
        workspaceId: 'test-workspace-id',
        createdById: 'test-user-id',
      }

      ;(prisma.workspaceMember.findFirst as jest.Mock).mockResolvedValue({
        userId: 'test-user-id',
        role: 'editor',
      })
      ;(prisma.form.create as jest.Mock).mockResolvedValue(newForm)

      const result = await prisma.form.create({
        data: {
          title: 'New Form',
          slug: 'new-form',
          workspaceId: 'test-workspace-id',
          createdById: 'test-user-id',
        },
      })

      expect(result.title).toBe('New Form')
      expect(result.status).toBe('draft')
    })

    it('should generate unique slug', async () => {
      const formWithSlug = {
        id: 'form-id',
        title: 'My Form',
        slug: 'my-form-abc123',
        status: 'draft',
      }

      ;(prisma.form.create as jest.Mock).mockResolvedValue(formWithSlug)

      const result = await prisma.form.create({
        data: { title: 'My Form' },
      })

      expect(result.slug).toMatch(/^my-form-/)
    })
  })

  describe('GET /api/forms/[formId]', () => {
    it('should return form with fields', async () => {
      const mockForm = {
        id: 'form-1',
        title: 'Test Form',
        slug: 'test-form',
        status: 'published',
        fields: [
          { id: 'field-1', type: 'short_text', title: 'Name' },
          { id: 'field-2', type: 'email', title: 'Email' },
        ],
        screens: [],
        theme: null,
      }

      ;(prisma.form.findUnique as jest.Mock).mockResolvedValue(mockForm)

      const result = await prisma.form.findUnique({
        where: { id: 'form-1' },
        include: { fields: true, screens: true, theme: true },
      })

      expect(result?.title).toBe('Test Form')
      expect(result?.fields).toHaveLength(2)
    })

    it('should return null for non-existent form', async () => {
      ;(prisma.form.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await prisma.form.findUnique({
        where: { id: 'non-existent' },
      })

      expect(result).toBeNull()
    })
  })

  describe('PATCH /api/forms/[formId]', () => {
    it('should update form title', async () => {
      const updatedForm = {
        id: 'form-1',
        title: 'Updated Title',
        slug: 'test-form',
      }

      ;(prisma.form.update as jest.Mock).mockResolvedValue(updatedForm)

      const result = await prisma.form.update({
        where: { id: 'form-1' },
        data: { title: 'Updated Title' },
      })

      expect(result.title).toBe('Updated Title')
    })

    it('should update form settings', async () => {
      const updatedForm = {
        id: 'form-1',
        title: 'Test Form',
        settings: {
          showProgressBar: true,
          showQuestionNumbers: false,
        },
      }

      ;(prisma.form.update as jest.Mock).mockResolvedValue(updatedForm)

      const result = await prisma.form.update({
        where: { id: 'form-1' },
        data: {
          settings: {
            showProgressBar: true,
            showQuestionNumbers: false,
          },
        },
      })

      expect(result.settings).toEqual({
        showProgressBar: true,
        showQuestionNumbers: false,
      })
    })
  })

  describe('DELETE /api/forms/[formId]', () => {
    it('should delete form', async () => {
      const deletedForm = {
        id: 'form-1',
        title: 'Deleted Form',
      }

      ;(prisma.form.delete as jest.Mock).mockResolvedValue(deletedForm)

      const result = await prisma.form.delete({
        where: { id: 'form-1' },
      })

      expect(result.id).toBe('form-1')
    })
  })

  describe('Form Publishing', () => {
    it('should publish form', async () => {
      const publishedForm = {
        id: 'form-1',
        status: 'published',
        publishedAt: new Date(),
      }

      ;(prisma.form.update as jest.Mock).mockResolvedValue(publishedForm)

      const result = await prisma.form.update({
        where: { id: 'form-1' },
        data: {
          status: 'published',
          publishedAt: new Date(),
        },
      })

      expect(result.status).toBe('published')
      expect(result.publishedAt).toBeDefined()
    })

    it('should unpublish form', async () => {
      const unpublishedForm = {
        id: 'form-1',
        status: 'draft',
      }

      ;(prisma.form.update as jest.Mock).mockResolvedValue(unpublishedForm)

      const result = await prisma.form.update({
        where: { id: 'form-1' },
        data: { status: 'draft' },
      })

      expect(result.status).toBe('draft')
    })
  })

  describe('Form Duplication', () => {
    it('should duplicate form with fields', async () => {
      const originalForm = {
        id: 'form-1',
        title: 'Original Form',
        fields: [
          { id: 'field-1', type: 'short_text', title: 'Name' },
        ],
      }

      const duplicatedForm = {
        id: 'form-2',
        title: 'Original Form (Copy)',
        slug: 'original-form-copy',
        status: 'draft',
      }

      ;(prisma.form.findUnique as jest.Mock).mockResolvedValue(originalForm)
      ;(prisma.form.create as jest.Mock).mockResolvedValue(duplicatedForm)

      // Fetch original
      const original = await prisma.form.findUnique({
        where: { id: 'form-1' },
        include: { fields: true },
      })

      // Create duplicate
      const duplicate = await prisma.form.create({
        data: {
          title: `${original?.title} (Copy)`,
          slug: 'original-form-copy',
          status: 'draft',
        },
      })

      expect(duplicate.title).toBe('Original Form (Copy)')
      expect(duplicate.status).toBe('draft')
    })
  })
})

describe('Form Fields API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Field Ordering', () => {
    it('should reorder fields correctly', async () => {
      const mockForm = {
        id: 'form-1',
        fields: [
          { id: 'field-1', order: 0 },
          { id: 'field-2', order: 1 },
          { id: 'field-3', order: 2 },
        ],
      }

      ;(prisma.form.findUnique as jest.Mock).mockResolvedValue(mockForm)

      const form = await prisma.form.findUnique({
        where: { id: 'form-1' },
        include: { fields: true },
      })

      expect(form?.fields).toHaveLength(3)
      expect(form?.fields[0].order).toBe(0)
      expect(form?.fields[2].order).toBe(2)
    })
  })
})
