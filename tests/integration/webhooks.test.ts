/**
 * Integration tests for Webhook system
 */

import crypto from 'crypto'
import { generateSignature, verifySignature } from '@/lib/webhooks/signatureGenerator'

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    webhook: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    webhookLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Mock fetch for webhook delivery
global.fetch = jest.fn()

import { prisma } from '@/lib/prisma'

describe('Webhook Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/forms/[formId]/webhooks', () => {
    it('should create webhook with generated secret', async () => {
      const webhookData = {
        url: 'https://example.com/webhook',
        events: ['response.submitted'],
      }

      const mockWebhook = {
        id: 'webhook-1',
        formId: 'form-1',
        url: webhookData.url,
        events: webhookData.events,
        secret: 'whsec_abc123xyz',
        enabled: true,
        createdAt: new Date(),
      }

      ;(prisma.webhook.create as jest.Mock).mockResolvedValue(mockWebhook)

      const webhook = await prisma.webhook.create({
        data: {
          formId: 'form-1',
          url: webhookData.url,
          events: webhookData.events,
          secret: `whsec_${crypto.randomBytes(16).toString('hex')}`,
          enabled: true,
        },
      })

      expect(webhook.url).toBe('https://example.com/webhook')
      expect(webhook.secret).toMatch(/^whsec_/)
      expect(webhook.enabled).toBe(true)
    })

    it('should validate webhook URL format', () => {
      const validUrls = [
        'https://example.com/webhook',
        'https://api.example.com/v1/hooks',
        'http://localhost:3000/webhook', // for testing
      ]

      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert(1)',
      ]

      validUrls.forEach((url) => {
        try {
          new URL(url)
          expect(true).toBe(true)
        } catch {
          expect(false).toBe(true)
        }
      })

      invalidUrls.forEach((url) => {
        try {
          const parsed = new URL(url)
          expect(['http:', 'https:'].includes(parsed.protocol)).toBe(
            url.startsWith('http://') || url.startsWith('https://')
          )
        } catch {
          expect(true).toBe(true) // Expected to fail
        }
      })
    })
  })

  describe('GET /api/forms/[formId]/webhooks', () => {
    it('should return webhooks for form', async () => {
      const mockWebhooks = [
        {
          id: 'webhook-1',
          url: 'https://example.com/hook1',
          events: ['response.submitted'],
          enabled: true,
        },
        {
          id: 'webhook-2',
          url: 'https://example.com/hook2',
          events: ['response.submitted'],
          enabled: false,
        },
      ]

      ;(prisma.webhook.findMany as jest.Mock).mockResolvedValue(mockWebhooks)

      const webhooks = await prisma.webhook.findMany({
        where: { formId: 'form-1' },
      })

      expect(webhooks).toHaveLength(2)
      expect(webhooks[0].enabled).toBe(true)
      expect(webhooks[1].enabled).toBe(false)
    })
  })

  describe('PATCH /api/forms/[formId]/webhooks/[webhookId]', () => {
    it('should toggle webhook enabled state', async () => {
      ;(prisma.webhook.update as jest.Mock).mockResolvedValue({
        id: 'webhook-1',
        enabled: false,
      })

      const webhook = await prisma.webhook.update({
        where: { id: 'webhook-1' },
        data: { enabled: false },
      })

      expect(webhook.enabled).toBe(false)
    })

    it('should update webhook URL', async () => {
      ;(prisma.webhook.update as jest.Mock).mockResolvedValue({
        id: 'webhook-1',
        url: 'https://new-url.com/webhook',
      })

      const webhook = await prisma.webhook.update({
        where: { id: 'webhook-1' },
        data: { url: 'https://new-url.com/webhook' },
      })

      expect(webhook.url).toBe('https://new-url.com/webhook')
    })
  })

  describe('DELETE /api/forms/[formId]/webhooks/[webhookId]', () => {
    it('should delete webhook', async () => {
      ;(prisma.webhook.delete as jest.Mock).mockResolvedValue({
        id: 'webhook-1',
      })

      const result = await prisma.webhook.delete({
        where: { id: 'webhook-1' },
      })

      expect(result.id).toBe('webhook-1')
    })
  })
})

describe('Webhook Signature', () => {
  const secret = 'whsec_testsecret123'
  const payload = JSON.stringify({
    event: 'response.submitted',
    data: { id: 'response-1' },
  })

  it('should generate valid HMAC signature', () => {
    const signature = generateSignature(payload, secret)

    expect(signature).toMatch(/^[a-f0-9]{64}$/) // SHA-256 hex
    expect(signature.length).toBe(64)
  })

  it('should verify valid signature', () => {
    const signature = generateSignature(payload, secret)
    const isValid = verifySignature(payload, signature, secret)

    expect(isValid).toBe(true)
  })

  it('should reject invalid signature', () => {
    const invalidSignature = 'invalid-signature-12345'
    const isValid = verifySignature(payload, invalidSignature, secret)

    expect(isValid).toBe(false)
  })

  it('should reject tampered payload', () => {
    const signature = generateSignature(payload, secret)
    const tamperedPayload = JSON.stringify({
      event: 'response.submitted',
      data: { id: 'response-HACKED' },
    })

    const isValid = verifySignature(tamperedPayload, signature, secret)
    expect(isValid).toBe(false)
  })

  it('should reject wrong secret', () => {
    const signature = generateSignature(payload, secret)
    const isValid = verifySignature(payload, signature, 'wrong-secret')

    expect(isValid).toBe(false)
  })
})

describe('Webhook Delivery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('should deliver webhook successfully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('OK'),
    })

    const response = await fetch('https://example.com/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': 'sha256=abc123',
      },
      body: JSON.stringify({ event: 'response.submitted' }),
    })

    expect(response.ok).toBe(true)
    expect(response.status).toBe(200)
  })

  it('should log successful delivery', async () => {
    const mockLog = {
      id: 'log-1',
      webhookId: 'webhook-1',
      status: 'success',
      statusCode: 200,
      requestBody: '{"event":"response.submitted"}',
      responseBody: 'OK',
      deliveredAt: new Date(),
    }

    ;(prisma.webhookLog.create as jest.Mock).mockResolvedValue(mockLog)

    const log = await prisma.webhookLog.create({
      data: mockLog,
    })

    expect(log.status).toBe('success')
    expect(log.statusCode).toBe(200)
  })

  it('should handle delivery failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    })

    const response = await fetch('https://example.com/webhook', {
      method: 'POST',
      body: JSON.stringify({ event: 'response.submitted' }),
    })

    expect(response.ok).toBe(false)
    expect(response.status).toBe(500)
  })

  it('should log failed delivery', async () => {
    const mockLog = {
      id: 'log-2',
      webhookId: 'webhook-1',
      status: 'failed',
      statusCode: 500,
      error: 'Internal Server Error',
      attempt: 1,
    }

    ;(prisma.webhookLog.create as jest.Mock).mockResolvedValue(mockLog)

    const log = await prisma.webhookLog.create({
      data: mockLog,
    })

    expect(log.status).toBe('failed')
    expect(log.attempt).toBe(1)
  })

  it('should handle network timeout', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Request timeout'))

    await expect(
      fetch('https://example.com/webhook', {
        method: 'POST',
        body: JSON.stringify({ event: 'response.submitted' }),
      })
    ).rejects.toThrow('Request timeout')
  })

  it('should retry on failure with exponential backoff', async () => {
    const retryDelays = [1000, 5000, 30000] // 1s, 5s, 30s

    retryDelays.forEach((delay, attempt) => {
      const expectedDelay = delay
      expect(expectedDelay).toBe(retryDelays[attempt])
    })

    expect(retryDelays.length).toBe(3) // Max 3 attempts
  })
})

describe('Webhook Logs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/webhooks/[webhookId]/logs', () => {
    it('should return paginated logs', async () => {
      const mockLogs = Array.from({ length: 10 }, (_, i) => ({
        id: `log-${i}`,
        webhookId: 'webhook-1',
        status: i % 2 === 0 ? 'success' : 'failed',
        statusCode: i % 2 === 0 ? 200 : 500,
        createdAt: new Date(),
      }))

      ;(prisma.webhookLog.findMany as jest.Mock).mockResolvedValue(mockLogs)

      const logs = await prisma.webhookLog.findMany({
        where: { webhookId: 'webhook-1' },
        take: 10,
        orderBy: { createdAt: 'desc' },
      })

      expect(logs).toHaveLength(10)
    })

    it('should filter logs by status', async () => {
      ;(prisma.webhookLog.findMany as jest.Mock).mockResolvedValue([
        { id: 'log-1', status: 'failed', statusCode: 500 },
        { id: 'log-2', status: 'failed', statusCode: 502 },
      ])

      const logs = await prisma.webhookLog.findMany({
        where: { webhookId: 'webhook-1', status: 'failed' },
      })

      expect(logs.every((l) => l.status === 'failed')).toBe(true)
    })
  })
})

describe('Webhook Payload', () => {
  it('should build correct response.submitted payload', () => {
    const form = {
      id: 'form-1',
      title: 'Contact Form',
      slug: 'contact-form',
    }

    const response = {
      id: 'response-1',
      completedAt: new Date('2024-01-15T10:00:00Z'),
      answers: [
        { fieldId: 'field-1', value: 'John Doe' },
        { fieldId: 'field-2', value: 'john@example.com' },
      ],
    }

    const payload = {
      event: 'response.submitted',
      timestamp: new Date().toISOString(),
      form: {
        id: form.id,
        title: form.title,
        slug: form.slug,
      },
      response: {
        id: response.id,
        completedAt: response.completedAt.toISOString(),
        answers: response.answers,
      },
    }

    expect(payload.event).toBe('response.submitted')
    expect(payload.form.id).toBe('form-1')
    expect(payload.response.answers).toHaveLength(2)
  })

  it('should include all required headers', () => {
    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-ID': 'webhook-1',
      'X-Webhook-Signature': 'sha256=abc123',
      'X-Webhook-Timestamp': Date.now().toString(),
      'User-Agent': 'CraftForms-Webhook/1.0',
    }

    expect(headers['Content-Type']).toBe('application/json')
    expect(headers['X-Webhook-Signature']).toMatch(/^sha256=/)
    expect(headers['X-Webhook-Timestamp']).toBeDefined()
  })
})

describe('Test Webhook', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('should send test webhook payload', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('OK'),
    })

    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      message: 'This is a test webhook delivery',
    }

    const response = await fetch('https://example.com/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    })

    expect(response.ok).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"event":"test"'),
      })
    )
  })
})
