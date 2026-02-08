'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Checkbox from '@/components/ui/checkbox'
import Button from '@/components/ui/button'
import ValidationError from './ValidationError'
import { validateField, ValidationRule, ValidationResult } from '@/lib/validations'

export interface FieldConfig {
  id: string
  type: string
  title: string
  description?: string
  isRequired: boolean
  properties: Record<string, any>
}

interface FieldRendererProps {
  field: FieldConfig
  value: any
  onChange: (value: any) => void
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

  const renderInput = () => {
    switch (field.type) {
      case 'short_text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.properties.placeholder || 'Type your answer here...'}
            maxLength={field.properties.maxLength}
            error={showErrors ? validationResult.errors[0] : undefined}
          />
        )

      case 'long_text':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.properties.placeholder || 'Type your answer here...'}
            maxLength={field.properties.maxLength}
            rows={4}
            error={showErrors ? validationResult.errors[0] : undefined}
          />
        )

      case 'email':
        return (
          <Input
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.properties.placeholder || 'name@example.com'}
            error={showErrors ? validationResult.errors[0] : undefined}
          />
        )

      case 'url':
        return (
          <Input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.properties.placeholder || 'https://example.com'}
            error={showErrors ? validationResult.errors[0] : undefined}
          />
        )

      case 'phone':
        return (
          <Input
            type="tel"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.properties.placeholder || '+1 (555) 000-0000'}
            error={showErrors ? validationResult.errors[0] : undefined}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            onBlur={handleBlur}
            placeholder={field.properties.placeholder || '0'}
            min={field.properties.min}
            max={field.properties.max}
            step={field.properties.decimalPlaces ? Math.pow(10, -field.properties.decimalPlaces) : 1}
            error={showErrors ? validationResult.errors[0] : undefined}
          />
        )

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {(field.properties.options || []).map((option: string, idx: number) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onChange(option)}
                className={`
                  w-full flex items-center gap-3 p-4 border-2 rounded-lg text-left transition-all
                  ${value === option
                    ? 'border-primary bg-primary/10 text-text-primary'
                    : 'border-border hover:border-primary/50 text-text-primary'
                  }
                `}
              >
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${value === option ? 'border-primary bg-primary' : 'border-border'}
                  `}
                >
                  {value === option && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="flex-1">{option}</span>
              </motion.button>
            ))}
          </div>
        )

      case 'checkboxes':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-3">
            {(field.properties.options || []).map((option: string, idx: number) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  const newValue = selectedValues.includes(option)
                    ? selectedValues.filter((v: string) => v !== option)
                    : [...selectedValues, option]
                  onChange(newValue)
                }}
                className={`
                  w-full flex items-center gap-3 p-4 border-2 rounded-lg text-left transition-all
                  ${selectedValues.includes(option)
                    ? 'border-primary bg-primary/10 text-text-primary'
                    : 'border-border hover:border-primary/50 text-text-primary'
                  }
                `}
              >
                <Checkbox
                  checked={selectedValues.includes(option)}
                  onChange={() => {}}
                />
                <span className="flex-1">{option}</span>
              </motion.button>
            ))}
            {field.properties.minSelections || field.properties.maxSelections ? (
              <p className="text-xs text-text-secondary">
                {field.properties.minSelections && `Select at least ${field.properties.minSelections}`}
                {field.properties.minSelections && field.properties.maxSelections && ', '}
                {field.properties.maxSelections && `at most ${field.properties.maxSelections}`}
              </p>
            ) : null}
          </div>
        )

      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            className="w-full px-4 py-3 text-base rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select an option...</option>
            {(field.properties.options || []).map((option: string, idx: number) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'yes_no':
        return (
          <div className="flex gap-4">
            <Button
              variant={value === true ? 'primary' : 'secondary'}
              size="lg"
              className="flex-1"
              onClick={() => onChange(true)}
            >
              {field.properties.yesLabel || 'Yes'}
            </Button>
            <Button
              variant={value === false ? 'primary' : 'secondary'}
              size="lg"
              className="flex-1"
              onClick={() => onChange(false)}
            >
              {field.properties.noLabel || 'No'}
            </Button>
          </div>
        )

      case 'rating':
        const maxRating = field.properties.ratingMax || 5
        return (
          <div className="flex gap-2 justify-center">
            {Array.from({ length: maxRating }).map((_, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onChange(idx + 1)}
                className={`
                  w-12 h-12 flex items-center justify-center transition-colors
                  ${(value || 0) > idx ? 'text-warning' : 'text-text-secondary hover:text-warning/50'}
                `}
              >
                <svg
                  className="w-10 h-10"
                  fill={(value || 0) > idx ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </motion.button>
            ))}
          </div>
        )

      case 'opinion_scale':
        const scaleMin = field.properties.scaleMin || 0
        const scaleMax = field.properties.scaleMax || 10
        return (
          <div>
            <div className="flex items-center justify-between gap-1">
              {Array.from({ length: scaleMax - scaleMin + 1 }).map((_, idx) => {
                const scaleValue = scaleMin + idx
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onChange(scaleValue)}
                    className={`
                      w-10 h-10 rounded-lg border-2 transition-all text-sm font-medium
                      ${value === scaleValue
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary text-text-primary'
                      }
                    `}
                  >
                    {scaleValue}
                  </motion.button>
                )
              })}
            </div>
            {(field.properties.scaleMinLabel || field.properties.scaleMaxLabel) && (
              <div className="flex justify-between text-xs text-text-secondary mt-2">
                <span>{field.properties.scaleMinLabel || ''}</span>
                <span>{field.properties.scaleMaxLabel || ''}</span>
              </div>
            )}
          </div>
        )

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            min={field.properties.minDate}
            max={field.properties.maxDate}
            error={showErrors ? validationResult.errors[0] : undefined}
          />
        )

      case 'legal':
        return (
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={() => onChange(!value)}
            className={`
              w-full flex items-start gap-4 p-4 border-2 rounded-lg text-left transition-all
              ${value
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <Checkbox
              checked={value || false}
              onChange={() => onChange(!value)}
            />
            <p className="text-sm text-text-primary flex-1">
              {field.properties.legalText || 'I agree to the terms and conditions'}
            </p>
          </motion.button>
        )

      case 'file_upload':
        return (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${value ? 'border-success bg-success/10' : 'border-border hover:border-primary'}
            `}
          >
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onChange(file)
              }}
              onBlur={handleBlur}
              accept={field.properties.fileTypes}
              className="hidden"
              id={`file-${field.id}`}
            />
            <label htmlFor={`file-${field.id}`} className="cursor-pointer">
              {value ? (
                <>
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-text-primary mb-1">
                    {value instanceof File ? value.name : 'File uploaded'}
                  </p>
                  <p className="text-xs text-text-secondary">Click to change file</p>
                </>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm font-medium text-text-primary mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-text-secondary">
                    {field.properties.fileTypes || 'All file types'} • Max{' '}
                    {field.properties.maxSize || '10'}MB
                  </p>
                </>
              )}
            </label>
          </div>
        )

      case 'ranking':
        // Get items from properties (settings panel uses 'items' array of strings)
        const items = field.properties.items || ['Item 1', 'Item 2', 'Item 3']
        const rankedItems = value || [...items]
        return (
          <div className="space-y-2">
            <p className="text-sm text-text-secondary mb-3">Drag to reorder</p>
            {rankedItems.map((item: string, index: number) => (
              <motion.div
                key={`${item}-${index}`}
                layout
                className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg cursor-move hover:border-primary transition-colors"
                draggable
                onDragStart={(e) => {
                  (e as unknown as DragEvent).dataTransfer?.setData('text/plain', String(index))
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const draggedIndex = parseInt((e as unknown as DragEvent).dataTransfer?.getData('text/plain') || '-1')
                  if (draggedIndex < 0 || draggedIndex === index) return
                  const newOrder = [...rankedItems]
                  const [removed] = newOrder.splice(draggedIndex, 1)
                  newOrder.splice(index, 0, removed)
                  onChange(newOrder)
                }}
              >
                <span className="text-sm font-medium text-primary w-6 text-center">
                  {index + 1}
                </span>
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                <span className="text-text-primary">{item}</span>
              </motion.div>
            ))}
          </div>
        )

      case 'matrix':
        const matrixValue = value || {}
        // Settings panel uses string arrays for rows and columns
        const rows = field.properties.rows || ['Row 1', 'Row 2']
        const columns = field.properties.columns || ['Column 1', 'Column 2']
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-text-secondary"></th>
                  {columns.map((col: string, colIndex: number) => (
                    <th key={colIndex} className="p-3 text-center text-sm font-medium text-text-secondary">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: string, rowIndex: number) => (
                  <tr key={rowIndex} className="border-t border-border">
                    <td className="p-3 text-sm text-text-primary">{row}</td>
                    {columns.map((col: string, colIndex: number) => (
                      <td key={colIndex} className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            onChange({ ...matrixValue, [row]: col })
                          }}
                          className={`w-5 h-5 rounded-full border-2 transition-colors ${
                            matrixValue[row] === col
                              ? 'bg-primary border-primary'
                              : 'border-border hover:border-primary'
                          }`}
                        >
                          {matrixValue[row] === col && (
                            <svg className="w-full h-full text-white p-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'payment':
        return (
          <div className="p-6 border border-border rounded-lg bg-surface text-center">
            <svg className="w-12 h-12 mx-auto text-text-secondary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="text-text-primary font-medium mb-1">Payment Collection</p>
            <p className="text-sm text-text-secondary">
              Payment integration coming soon. Connect with Stripe to collect payments.
            </p>
          </div>
        )

      default:
        return (
          <div className="p-4 border border-border rounded-lg text-text-secondary text-sm">
            Field type &quot;{field.type}&quot; not yet supported
          </div>
        )
    }
  }

  return (
    <div className="space-y-2">
      {renderInput()}
      {showErrors && <ValidationError errors={validationResult.errors} />}
    </div>
  )
}

export default FieldRenderer
export { buildValidationRules }
