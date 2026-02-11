export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'phone' | 'fileSize' | 'fileType'
  value?: string | number
  message?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FieldValue {
  value: any
  type: string
}

/**
 * Validates a field value against a set of validation rules
 */
export function validateField(
  fieldValue: FieldValue,
  rules: ValidationRule[]
): ValidationResult {
  const errors: string[] = []

  for (const rule of rules) {
    const error = validateRule(fieldValue, rule)
    if (error) {
      errors.push(error)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates a single rule
 */
function validateRule(
  fieldValue: FieldValue,
  rule: ValidationRule
): string | null {
  const { value } = fieldValue

  switch (rule.type) {
    case 'required':
      return validateRequired(value, rule.message)

    case 'minLength':
      return validateMinLength(value, rule.value as number, rule.message)

    case 'maxLength':
      return validateMaxLength(value, rule.value as number, rule.message)

    case 'min':
      return validateMin(value, rule.value as number, rule.message)

    case 'max':
      return validateMax(value, rule.value as number, rule.message)

    case 'pattern':
      return validatePattern(value, rule.value as string, rule.message)

    case 'email':
      return validateEmail(value, rule.message)

    case 'url':
      return validateURL(value, rule.message)

    case 'phone':
      return validatePhone(value, rule.message)

    case 'fileSize':
      return validateFileSize(value, rule.value as number, rule.message)

    case 'fileType':
      return validateFileType(value, rule.value as string, rule.message)

    default:
      return null
  }
}

/**
 * Required field validation
 */
function validateRequired(value: any, message?: string): string | null {
  if (value === null || value === undefined || value === '') {
    return message || 'This field is required'
  }

  if (Array.isArray(value) && value.length === 0) {
    return message || 'Please select at least one option'
  }

  return null
}

/**
 * Minimum length validation for strings
 */
function validateMinLength(value: any, minLength: number, message?: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null // Skip if empty (use required rule for that)
  }

  const strValue = String(value)
  if (strValue.length < minLength) {
    return message || `Must be at least ${minLength} characters`
  }

  return null
}

/**
 * Maximum length validation for strings
 */
function validateMaxLength(value: any, maxLength: number, message?: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const strValue = String(value)
  if (strValue.length > maxLength) {
    return message || `Must be no more than ${maxLength} characters`
  }

  return null
}

/**
 * Minimum value validation for numbers
 */
function validateMin(value: any, min: number, message?: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numValue = Number(value)
  if (isNaN(numValue)) {
    return 'Must be a valid number'
  }

  if (numValue < min) {
    return message || `Must be at least ${min}`
  }

  return null
}

/**
 * Maximum value validation for numbers
 */
function validateMax(value: any, max: number, message?: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numValue = Number(value)
  if (isNaN(numValue)) {
    return 'Must be a valid number'
  }

  if (numValue > max) {
    return message || `Must be no more than ${max}`
  }

  return null
}

/**
 * Regex pattern validation
 */
function validatePattern(value: any, pattern: string, message?: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const strValue = String(value)
  const regex = new RegExp(pattern)

  if (!regex.test(strValue)) {
    return message || 'Invalid format'
  }

  return null
}

/**
 * Email format validation
 */
function validateEmail(value: any, message?: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const strValue = String(value)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(strValue)) {
    return message || 'Please enter a valid email address'
  }

  return null
}

/**
 * URL format validation
 */
function validateURL(value: any, message?: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const strValue = String(value)

  try {
    new URL(strValue)
    return null
  } catch {
    return message || 'Please enter a valid URL'
  }
}

/**
 * Phone number format validation
 */
function validatePhone(value: any, message?: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const strValue = String(value)
  // Simple phone validation - accepts various formats
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/

  if (!phoneRegex.test(strValue.replace(/\s/g, ''))) {
    return message || 'Please enter a valid phone number'
  }

  return null
}

/**
 * File size validation (in MB)
 */
function validateFileSize(file: any, maxSizeMB: number, message?: string): string | null {
  if (!file || !(file instanceof File)) {
    return null
  }

  const fileSizeMB = file.size / (1024 * 1024)

  if (fileSizeMB > maxSizeMB) {
    return message || `File size must be less than ${maxSizeMB}MB`
  }

  return null
}

/**
 * File type validation
 */
function validateFileType(file: any, allowedTypes: string, message?: string): string | null {
  if (!file || !(file instanceof File)) {
    return null
  }

  const types = allowedTypes.split(',').map(t => t.trim().toLowerCase())
  const fileExt = file.name.split('.').pop()?.toLowerCase()
  const fileMime = file.type.toLowerCase()

  const isAllowed = types.some(type => {
    if (type.startsWith('.')) {
      return fileExt === type.substring(1)
    }
    if (type.includes('/')) {
      return fileMime === type || fileMime.startsWith(type.replace('*', ''))
    }
    return fileExt === type
  })

  if (!isAllowed) {
    return message || `Only ${allowedTypes} files are allowed`
  }

  return null
}

/**
 * Validates multiple fields
 */
export function validateForm(
  fields: Array<{ id: string; value: any; type: string; rules: ValidationRule[] }>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {}

  for (const field of fields) {
    results[field.id] = validateField(
      { value: field.value, type: field.type },
      field.rules
    )
  }

  return results
}

/**
 * Check if form is valid
 */
export function isFormValid(validationResults: Record<string, ValidationResult>): boolean {
  return Object.values(validationResults).every(result => result.isValid)
}
