'use client'

import { InputHTMLAttributes, forwardRef, useState } from 'react'

export interface ColorPickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  onColorChange?: (color: string) => void
}

const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ label, error, onColorChange, className = '', id, onChange, defaultValue = '#000000', ...props }, ref) => {
    const [selectedColor, setSelectedColor] = useState<string>(defaultValue as string)
    const colorId = id || `color-picker-${Math.random().toString(36).substr(2, 9)}`

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSelectedColor(value)
      onColorChange?.(value)
      onChange?.(e)
    }

    const presetColors = [
      '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
      '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    ]

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={colorId} className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              ref={ref}
              type="color"
              id={colorId}
              value={selectedColor}
              onChange={handleChange}
              className="sr-only"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${colorId}-error` : undefined}
              {...props}
            />
            <label
              htmlFor={colorId}
              className={`
                block w-12 h-12 rounded-lg border-2 cursor-pointer
                transition-all hover:scale-105
                ${error ? 'border-error' : 'border-border hover:border-primary'}
              `}
              style={{ backgroundColor: selectedColor }}
              title={selectedColor}
            />
          </div>

          <div className="flex-1">
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => {
                const value = e.target.value
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  setSelectedColor(value)
                  if (value.length === 7) {
                    onColorChange?.(value)
                  }
                }
              }}
              className={`
                w-full px-3 py-2 text-base rounded-lg font-mono
                border border-border bg-background text-text-primary
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error ? 'border-error focus:ring-error' : ''}
              `}
              placeholder="#000000"
              maxLength={7}
            />
          </div>
        </div>

        {/* Preset Colors */}
        <div className="mt-3 flex flex-wrap gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                setSelectedColor(color)
                onColorChange?.(color)
              }}
              className={`
                w-8 h-8 rounded-md border-2 transition-all hover:scale-110
                ${selectedColor === color ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
              `}
              style={{ backgroundColor: color }}
              title={color}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        {error && (
          <p id={`${colorId}-error`} className="mt-2 text-sm text-error">
            {error}
          </p>
        )}
      </div>
    )
  }
)

ColorPicker.displayName = 'ColorPicker'

export default ColorPicker
