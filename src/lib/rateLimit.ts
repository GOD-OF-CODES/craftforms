/**
 * Rate limiting for API endpoints
 */

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  limit: number // Max requests per interval
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  })
}, 60000) // Clean up every minute

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const key = identifier

  let entry = rateLimitStore.get(key)

  // Reset if window has passed
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.interval,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)

  const remaining = Math.max(0, config.limit - entry.count)
  const allowed = entry.count <= config.limit

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  }
}

/**
 * Create rate limit headers
 */
export function rateLimitHeaders(result: {
  remaining: number
  resetAt: number
  limit: number
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(result.resetAt / 1000).toString(),
  }
}

// Preset configurations
export const rateLimitConfigs = {
  // Auth endpoints: 10 requests per minute
  auth: { interval: 60 * 1000, limit: 10 },

  // API endpoints: 100 requests per minute
  api: { interval: 60 * 1000, limit: 100 },

  // Form submission: 5 per minute per IP
  formSubmit: { interval: 60 * 1000, limit: 5 },

  // Webhook delivery: 30 per minute
  webhook: { interval: 60 * 1000, limit: 30 },

  // Export: 5 per hour
  export: { interval: 60 * 60 * 1000, limit: 5 },
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req: Request): string {
  // Try to get real IP from headers
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return 'unknown'
}

/**
 * Rate limit middleware helper
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    const identifier = getClientIdentifier(req)
    const result = checkRateLimit(identifier, config)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...rateLimitHeaders({ ...result, limit: config.limit }),
            'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const response = await handler(req)

    // Add rate limit headers to successful responses
    const headers = new Headers(response.headers)
    const limitHeaders = rateLimitHeaders({ ...result, limit: config.limit })
    Object.entries(limitHeaders).forEach(([key, value]) => {
      headers.set(key, value)
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}
