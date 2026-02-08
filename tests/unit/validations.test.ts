/**
 * Unit tests for validation functions
 */

import {
  validateField,
  validateForm,
  isFormValid,
  ValidationRule,
  ValidationResult,
} from '@/lib/validations'

describe('Validation Functions', () => {
  describe('validateField - required rule', () => {
    const requiredRule: ValidationRule[] = [{ type: 'required' }]

    it('should pass for non-empty string', () => {
      const result = validateField({ value: 'hello', type: 'short_text' }, requiredRule)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail for empty string', () => {
      const result = validateField({ value: '', type: 'short_text' }, requiredRule)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('This field is required')
    })

    it('should fail for null', () => {
      const result = validateField({ value: null, type: 'short_text' }, requiredRule)
      expect(result.isValid).toBe(false)
    })

    it('should fail for undefined', () => {
      const result = validateField({ value: undefined, type: 'short_text' }, requiredRule)
      expect(result.isValid).toBe(false)
    })

    it('should pass for number 0', () => {
      const result = validateField({ value: 0, type: 'number' }, requiredRule)
      expect(result.isValid).toBe(true)
    })

    it('should pass for false boolean', () => {
      const result = validateField({ value: false, type: 'yes_no' }, requiredRule)
      expect(result.isValid).toBe(true)
    })

    it('should pass for non-empty array', () => {
      const result = validateField({ value: ['item'], type: 'checkboxes' }, requiredRule)
      expect(result.isValid).toBe(true)
    })

    it('should fail for empty array', () => {
      const result = validateField({ value: [], type: 'checkboxes' }, requiredRule)
      expect(result.isValid).toBe(false)
    })

    it('should use custom error message', () => {
      const rules: ValidationRule[] = [{ type: 'required', message: 'Please fill this out' }]
      const result = validateField({ value: '', type: 'short_text' }, rules)
      expect(result.errors).toContain('Please fill this out')
    })
  })

  describe('validateField - minLength rule', () => {
    it('should pass when length meets minimum', () => {
      const rules: ValidationRule[] = [{ type: 'minLength', value: 5 }]
      const result = validateField({ value: 'hello', type: 'short_text' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should pass when length exceeds minimum', () => {
      const rules: ValidationRule[] = [{ type: 'minLength', value: 5 }]
      const result = validateField({ value: 'hello world', type: 'short_text' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should fail when length is below minimum', () => {
      const rules: ValidationRule[] = [{ type: 'minLength', value: 5 }]
      const result = validateField({ value: 'hi', type: 'short_text' }, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Must be at least 5 characters')
    })

    it('should pass for empty string (use required rule for that)', () => {
      const rules: ValidationRule[] = [{ type: 'minLength', value: 5 }]
      const result = validateField({ value: '', type: 'short_text' }, rules)
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateField - maxLength rule', () => {
    it('should pass when length is within maximum', () => {
      const rules: ValidationRule[] = [{ type: 'maxLength', value: 10 }]
      const result = validateField({ value: 'hello', type: 'short_text' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should pass when length equals maximum', () => {
      const rules: ValidationRule[] = [{ type: 'maxLength', value: 5 }]
      const result = validateField({ value: 'hello', type: 'short_text' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should fail when length exceeds maximum', () => {
      const rules: ValidationRule[] = [{ type: 'maxLength', value: 5 }]
      const result = validateField({ value: 'hello world', type: 'short_text' }, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Must be no more than 5 characters')
    })
  })

  describe('validateField - min rule', () => {
    it('should pass when value meets minimum', () => {
      const rules: ValidationRule[] = [{ type: 'min', value: 10 }]
      const result = validateField({ value: 10, type: 'number' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should pass when value exceeds minimum', () => {
      const rules: ValidationRule[] = [{ type: 'min', value: 10 }]
      const result = validateField({ value: 15, type: 'number' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should fail when value is below minimum', () => {
      const rules: ValidationRule[] = [{ type: 'min', value: 10 }]
      const result = validateField({ value: 5, type: 'number' }, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Must be at least 10')
    })

    it('should handle string numbers', () => {
      const rules: ValidationRule[] = [{ type: 'min', value: 10 }]
      const result = validateField({ value: '15', type: 'number' }, rules)
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateField - max rule', () => {
    it('should pass when value is within maximum', () => {
      const rules: ValidationRule[] = [{ type: 'max', value: 10 }]
      const result = validateField({ value: 5, type: 'number' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should pass when value equals maximum', () => {
      const rules: ValidationRule[] = [{ type: 'max', value: 10 }]
      const result = validateField({ value: 10, type: 'number' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should fail when value exceeds maximum', () => {
      const rules: ValidationRule[] = [{ type: 'max', value: 10 }]
      const result = validateField({ value: 15, type: 'number' }, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Must be no more than 10')
    })
  })

  describe('validateField - pattern rule', () => {
    it('should pass when value matches pattern', () => {
      const rules: ValidationRule[] = [{ type: 'pattern', value: '^[A-Z0-9]+$' }]
      const result = validateField({ value: 'ABC123', type: 'short_text' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should fail when value does not match pattern', () => {
      const rules: ValidationRule[] = [{ type: 'pattern', value: '^[A-Z0-9]+$' }]
      const result = validateField({ value: 'abc123', type: 'short_text' }, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid format')
    })

    it('should allow custom error message', () => {
      const rules: ValidationRule[] = [
        { type: 'pattern', value: '^[A-Z]+$', message: 'Must be uppercase' },
      ]
      const result = validateField({ value: 'abc', type: 'short_text' }, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Must be uppercase')
    })
  })

  describe('validateField - email rule', () => {
    it('should pass for valid email', () => {
      const rules: ValidationRule[] = [{ type: 'email' }]
      const result = validateField({ value: 'test@example.com', type: 'email' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should pass for email with subdomain', () => {
      const rules: ValidationRule[] = [{ type: 'email' }]
      const result = validateField({ value: 'user@mail.example.com', type: 'email' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should pass for email with plus sign', () => {
      const rules: ValidationRule[] = [{ type: 'email' }]
      const result = validateField({ value: 'user+tag@example.com', type: 'email' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should fail for email without @', () => {
      const rules: ValidationRule[] = [{ type: 'email' }]
      const result = validateField({ value: 'testexample.com', type: 'email' }, rules)
      expect(result.isValid).toBe(false)
    })

    it('should fail for email without domain', () => {
      const rules: ValidationRule[] = [{ type: 'email' }]
      const result = validateField({ value: 'test@', type: 'email' }, rules)
      expect(result.isValid).toBe(false)
    })

    it('should pass for empty string (use required rule for that)', () => {
      const rules: ValidationRule[] = [{ type: 'email' }]
      const result = validateField({ value: '', type: 'email' }, rules)
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateField - url rule', () => {
    it('should pass for valid http URL', () => {
      const rules: ValidationRule[] = [{ type: 'url' }]
      const result = validateField({ value: 'http://example.com', type: 'url' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should pass for valid https URL', () => {
      const rules: ValidationRule[] = [{ type: 'url' }]
      const result = validateField({ value: 'https://example.com', type: 'url' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should pass for URL with path', () => {
      const rules: ValidationRule[] = [{ type: 'url' }]
      const result = validateField({ value: 'https://example.com/path/to/page', type: 'url' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should fail for URL without protocol', () => {
      const rules: ValidationRule[] = [{ type: 'url' }]
      const result = validateField({ value: 'example.com', type: 'url' }, rules)
      expect(result.isValid).toBe(false)
    })

    it('should fail for invalid URL', () => {
      const rules: ValidationRule[] = [{ type: 'url' }]
      const result = validateField({ value: 'not a url', type: 'url' }, rules)
      expect(result.isValid).toBe(false)
    })
  })

  describe('validateField - phone rule', () => {
    it('should pass for valid phone number', () => {
      const rules: ValidationRule[] = [{ type: 'phone' }]
      // Format: 10 digits with dots
      const result = validateField({ value: '555.123.4567', type: 'phone' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should pass for phone with parentheses', () => {
      const rules: ValidationRule[] = [{ type: 'phone' }]
      const result = validateField({ value: '(555) 123-4567', type: 'phone' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should pass for simple numeric phone', () => {
      const rules: ValidationRule[] = [{ type: 'phone' }]
      const result = validateField({ value: '5551234567', type: 'phone' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should pass for international format', () => {
      const rules: ValidationRule[] = [{ type: 'phone' }]
      // +X followed by groups
      const result = validateField({ value: '+1 555 1234567', type: 'phone' }, rules)
      expect(result.isValid).toBe(true)
    })

    it('should fail for phone with letters', () => {
      const rules: ValidationRule[] = [{ type: 'phone' }]
      const result = validateField({ value: '555-ABC-1234', type: 'phone' }, rules)
      expect(result.isValid).toBe(false)
    })

    it('should fail for text that is not a phone number', () => {
      const rules: ValidationRule[] = [{ type: 'phone' }]
      const result = validateField({ value: 'not a phone', type: 'phone' }, rules)
      expect(result.isValid).toBe(false)
    })
  })

  describe('validateField - multiple rules', () => {
    it('should validate required field', () => {
      const rules: ValidationRule[] = [{ type: 'required' }]
      const result = validateField({ value: '', type: 'short_text' }, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('This field is required')
    })

    it('should validate multiple rules', () => {
      const rules: ValidationRule[] = [
        { type: 'required' },
        { type: 'minLength', value: 5 },
        { type: 'maxLength', value: 10 },
      ]
      const result = validateField({ value: 'ab', type: 'short_text' }, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Must be at least 5 characters')
    })

    it('should pass all validations', () => {
      const rules: ValidationRule[] = [
        { type: 'required' },
        { type: 'minLength', value: 3 },
        { type: 'maxLength', value: 10 },
      ]
      const result = validateField({ value: 'hello', type: 'short_text' }, rules)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate email type', () => {
      const rules: ValidationRule[] = [{ type: 'required' }, { type: 'email' }]
      const result = validateField({ value: 'not-an-email', type: 'email' }, rules)
      expect(result.isValid).toBe(false)
    })

    it('should validate number type', () => {
      const rules: ValidationRule[] = [{ type: 'min', value: 10 }]
      const result = validateField({ value: 5, type: 'number' }, rules)
      expect(result.isValid).toBe(false)
    })
  })
})

describe('validateForm', () => {
  it('should validate multiple fields', () => {
    const fields = [
      {
        id: 'name',
        value: 'John',
        type: 'short_text',
        rules: [{ type: 'required' as const }],
      },
      {
        id: 'email',
        value: 'invalid',
        type: 'email',
        rules: [{ type: 'required' as const }, { type: 'email' as const }],
      },
    ]

    const results = validateForm(fields)

    expect(results['name'].isValid).toBe(true)
    expect(results['email'].isValid).toBe(false)
  })

  it('should return all field results', () => {
    const fields = [
      { id: 'field1', value: 'test', type: 'short_text', rules: [] },
      { id: 'field2', value: '', type: 'short_text', rules: [{ type: 'required' as const }] },
    ]

    const results = validateForm(fields)

    expect(Object.keys(results)).toHaveLength(2)
    expect(results['field1']).toBeDefined()
    expect(results['field2']).toBeDefined()
  })
})

describe('isFormValid', () => {
  it('should return true when all fields are valid', () => {
    const results: Record<string, ValidationResult> = {
      field1: { isValid: true, errors: [] },
      field2: { isValid: true, errors: [] },
    }

    expect(isFormValid(results)).toBe(true)
  })

  it('should return false when any field is invalid', () => {
    const results: Record<string, ValidationResult> = {
      field1: { isValid: true, errors: [] },
      field2: { isValid: false, errors: ['Error'] },
    }

    expect(isFormValid(results)).toBe(false)
  })

  it('should return true for empty results', () => {
    expect(isFormValid({})).toBe(true)
  })
})
