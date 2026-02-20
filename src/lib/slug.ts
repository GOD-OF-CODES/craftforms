interface SlugOptions {
  maxLength?: number
  fallback?: string
  appendTimestamp?: boolean
}

export function generateSlug(name: string, options: SlugOptions = {}): string {
  const { maxLength = 50, fallback = 'my-workspace', appendTimestamp = false } = options

  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, maxLength) || fallback

  if (appendTimestamp) {
    const suffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
    return `${base}-${suffix}`
  }

  return base
}
