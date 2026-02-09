import crypto from 'crypto'

export function generateAccessToken(formId: string): string {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret'
  const expiresAt = Date.now() + 60 * 60 * 1000 // 1 hour
  const payload = `${formId}:${expiresAt}`
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return Buffer.from(`${payload}:${signature}`).toString('base64')
}

export function verifyAccessToken(token: string, formId: string): boolean {
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret'
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    const tokenFormId = parts[0]
    const expiresAtStr = parts[1]
    const signature = parts[2]

    if (!tokenFormId || !expiresAtStr || !signature) return false
    if (tokenFormId !== formId) return false

    const expiresAt = parseInt(expiresAtStr, 10)
    if (Date.now() > expiresAt) return false

    const payload = `${tokenFormId}:${expiresAtStr}`
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex')

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
  } catch {
    return false
  }
}
