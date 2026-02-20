interface PasswordValidationResult {
  valid: boolean
  error?: string
}

export function validatePassword(password: unknown): PasswordValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' }
  }

  if (password.length < 10) {
    return { valid: false, error: 'Password must be at least 10 characters' }
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain uppercase, lowercase, and a number' }
  }

  return { valid: true }
}
