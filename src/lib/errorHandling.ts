/**
 * Global Error Handling Utilities
 *
 * Provides centralized error handling, logging, and user-friendly error messages.
 */

// Error types
export type ErrorType =
  | 'network'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'rate_limit'
  | 'server'
  | 'unknown'

// Structured error interface
export interface AppError {
  type: ErrorType
  message: string
  code?: string
  details?: Record<string, any>
  originalError?: Error
  timestamp: Date
  retryable: boolean
}

// User-friendly error messages
const errorMessages: Record<ErrorType, string> = {
  network: 'Unable to connect. Please check your internet connection and try again.',
  validation: 'Please check your input and try again.',
  authentication: 'Your session has expired. Please sign in again.',
  authorization: "You don't have permission to perform this action.",
  not_found: 'The requested resource could not be found.',
  rate_limit: "You're making too many requests. Please wait a moment and try again.",
  server: 'Something went wrong on our end. Please try again later.',
  unknown: 'An unexpected error occurred. Please try again.'
}

/**
 * Creates a structured AppError from various error types
 */
export function createAppError(
  error: unknown,
  defaultType: ErrorType = 'unknown'
): AppError {
  const timestamp = new Date()

  // Handle fetch/network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: errorMessages.network,
      originalError: error,
      timestamp,
      retryable: true
    }
  }

  // Handle Response errors (from fetch)
  if (error instanceof Response) {
    return createErrorFromResponse(error, timestamp)
  }

  // Handle Error objects
  if (error instanceof Error) {
    return {
      type: defaultType,
      message: error.message || errorMessages[defaultType],
      originalError: error,
      timestamp,
      retryable: defaultType !== 'validation' && defaultType !== 'authorization'
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: defaultType,
      message: error,
      timestamp,
      retryable: true
    }
  }

  // Handle object errors with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return {
      type: (error as any).type || defaultType,
      message: (error as any).message,
      code: (error as any).code,
      details: (error as any).details,
      timestamp,
      retryable: true
    }
  }

  // Default unknown error
  return {
    type: 'unknown',
    message: errorMessages.unknown,
    timestamp,
    retryable: true
  }
}

/**
 * Creates AppError from HTTP Response
 */
function createErrorFromResponse(response: Response, timestamp: Date): AppError {
  const status = response.status

  if (status === 401) {
    return {
      type: 'authentication',
      message: errorMessages.authentication,
      code: 'UNAUTHORIZED',
      timestamp,
      retryable: false
    }
  }

  if (status === 403) {
    return {
      type: 'authorization',
      message: errorMessages.authorization,
      code: 'FORBIDDEN',
      timestamp,
      retryable: false
    }
  }

  if (status === 404) {
    return {
      type: 'not_found',
      message: errorMessages.not_found,
      code: 'NOT_FOUND',
      timestamp,
      retryable: false
    }
  }

  if (status === 422 || status === 400) {
    return {
      type: 'validation',
      message: errorMessages.validation,
      code: 'VALIDATION_ERROR',
      timestamp,
      retryable: false
    }
  }

  if (status === 429) {
    return {
      type: 'rate_limit',
      message: errorMessages.rate_limit,
      code: 'RATE_LIMITED',
      timestamp,
      retryable: true
    }
  }

  if (status >= 500) {
    return {
      type: 'server',
      message: errorMessages.server,
      code: 'SERVER_ERROR',
      timestamp,
      retryable: true
    }
  }

  return {
    type: 'unknown',
    message: errorMessages.unknown,
    code: `HTTP_${status}`,
    timestamp,
    retryable: true
  }
}

/**
 * Get user-friendly error message
 */
export function getUserMessage(error: AppError | unknown): string {
  if (isAppError(error)) {
    return error.message
  }
  return createAppError(error).message
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'timestamp' in error
  )
}

/**
 * Log error to console (and potentially to external service)
 */
export function logError(error: AppError | unknown, context?: Record<string, any>): void {
  const appError = isAppError(error) ? error : createAppError(error)

  console.error('[Error]', {
    ...appError,
    context,
    stack: appError.originalError?.stack
  })

  // TODO: Send to error tracking service (e.g., Sentry)
  // if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(appError.originalError || appError)
  // }
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    baseDelay?: number
    maxDelay?: number
    onRetry?: (attempt: number, error: AppError) => void
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry
  } = options

  let lastError: AppError | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = createAppError(error)

      // Don't retry non-retryable errors
      if (!lastError.retryable || attempt === maxAttempts) {
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)

      onRetry?.(attempt, lastError)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Safe fetch wrapper that converts errors to AppError
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T; error: null } | { data: null; error: AppError }> {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const error = createErrorFromResponse(response, new Date())
      return { data: null, error }
    }

    const data = await response.json()
    return { data, error: null }
  } catch (error) {
    return { data: null, error: createAppError(error) }
  }
}
