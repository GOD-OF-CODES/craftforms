'use client'

import { InputHTMLAttributes, forwardRef, useState } from 'react'

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  onDateChange?: (date: Date | null) => void
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, onDateChange, className = '', id, onChange, ...props }, ref) => {
    const [selectedDate, setSelectedDate] = useState<string>('')
    const dateId = id || `date-picker-${Math.random().toString(36).substr(2, 9)}`

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSelectedDate(value)

      if (value) {
        const date = new Date(value)
        onDateChange?.(date)
      } else {
        onDateChange?.(null)
      }

      onChange?.(e)
    }

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={dateId} className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="date"
            id={dateId}
            value={selectedDate}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 text-base rounded-lg
              border border-border bg-background text-text-primary
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              cursor-pointer
              ${error ? 'border-error focus:ring-error' : ''}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${dateId}-error` : undefined}
            {...props}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p id={`${dateId}-error`} className="mt-1 text-sm text-error">
            {error}
          </p>
        )}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'

export default DatePicker
