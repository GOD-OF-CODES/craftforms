'use client'

import { useState, useEffect } from 'react'
import ValidationError from './ValidationError'
import { validateField, ValidationRule, ValidationResult } from '@/lib/validations'
import { fieldComponents, FieldConfig } from './fields'
import { FieldValue } from '@/types/fields'

export type { FieldConfig }

interface FieldRendererProps {
  field: FieldConfig
  value: FieldValue
  onChange: (value: FieldValue) => void
  showValidation?: boolean
  onValidation?: (result: ValidationResult) => void
}

/**
 * Build validation rules from field config
 */
function buildValidationRules(field: FieldConfig): ValidationRule[] {
  const rules: ValidationRule[] = []
  const props = field.properties

  // Required validation
  if (field.isRequired) {
    rules.push({
      type: 'required',
      message: props.customErrorMessage || 'This field is required'
    })
  }

  // Type-specific validations
  switch (field.type) {
    case 'short_text':
    case 'long_text':
      if (props.minLength) {
        rules.push({
          type: 'minLength',
          value: props.minLength,
          message: props.customErrorMessage || `Must be at least ${props.minLength} characters`
        })
      }
      if (props.maxLength) {
        rules.push({
          type: 'maxLength',
          value: props.maxLength,
          message: props.customErrorMessage || `Must be no more than ${props.maxLength} characters`
        })
      }
      if (props.pattern) {
        rules.push({
          type: 'pattern',
          value: props.pattern,
          message: props.customErrorMessage || 'Invalid format'
        })
      }
      break

    case 'email':
      rules.push({
        type: 'email',
        message: props.customErrorMessage || 'Please enter a valid email address'
      })
      break

    case 'url':
      rules.push({
        type: 'url',
        message: props.customErrorMessage || 'Please enter a valid URL'
      })
      break

    case 'phone':
      rules.push({
        type: 'phone',
        message: props.customErrorMessage || 'Please enter a valid phone number'
      })
      break

    case 'number':
      if (props.min !== undefined) {
        rules.push({
          type: 'min',
          value: props.min,
          message: props.customErrorMessage || `Must be at least ${props.min}`
        })
      }
      if (props.max !== undefined) {
        rules.push({
          type: 'max',
          value: props.max,
          message: props.customErrorMessage || `Must be no more than ${props.max}`
        })
      }
      break

    case 'file_upload':
      if (props.maxSize) {
        rules.push({
          type: 'fileSize',
          value: props.maxSize,
          message: `File size must be less than ${props.maxSize}MB`
        })
      }
      if (props.fileTypes) {
        rules.push({
          type: 'fileType',
          value: props.fileTypes,
          message: `Only ${props.fileTypes} files are allowed`
        })
      }
      break
  }

  return rules
}

const FieldRenderer = ({
  field,
  value,
  onChange,
  showValidation = false,
  onValidation
}: FieldRendererProps) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: []
  })
  const [touched, setTouched] = useState(false)

  // Validate on value change when touched
  useEffect(() => {
    if (showValidation || touched) {
      const rules = buildValidationRules(field)
      const result = validateField({ value, type: field.type }, rules)
      setValidationResult(result)
      onValidation?.(result)
    }
  }, [value, showValidation, touched, field, onValidation])

  const handleBlur = () => {
    setTouched(true)
  }

  const showErrors = (showValidation || touched) && !validationResult.isValid

  const Component = fieldComponents[field.type]
  const input = Component ? (
    <Component
      field={field}
      value={value}
      onChange={onChange}
      onBlur={handleBlur}
      showErrors={showErrors}
      firstError={validationResult.errors[0]}
    />
  ) : (
    <div className="p-4 border border-border rounded-lg text-text-secondary text-sm">
      Field type &quot;{field.type}&quot; not yet supported
    </div>
  )

  return (
    <div className="space-y-2">
      {input}
      {showErrors && <ValidationError errors={validationResult.errors} />}
    </div>
  )
}

export default FieldRenderer
export { buildValidationRules }
