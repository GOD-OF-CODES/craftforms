'use client'

import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { motion } from 'framer-motion'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  onCheckedChange?: (checked: boolean) => void
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className = '', id, checked, defaultChecked, onCheckedChange, onChange, disabled, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(defaultChecked || checked || false)
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked
      setIsChecked(newChecked)
      onCheckedChange?.(newChecked)
      onChange?.(e)
    }

    const currentChecked = checked !== undefined ? checked : isChecked

    return (
      <div className={`flex items-center ${className}`}>
        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            checked={currentChecked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <label
            htmlFor={switchId}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer
              ${currentChecked ? 'bg-primary' : 'bg-border'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <motion.span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
              `}
              animate={{
                x: currentChecked ? 24 : 4,
              }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
            />
          </label>
        </div>
        {label && (
          <span className="ml-3 text-sm font-medium text-text-primary">
            {label}
          </span>
        )}
      </div>
    )
  }
)

Switch.displayName = 'Switch'

export default Switch
