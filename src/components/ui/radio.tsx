import { InputHTMLAttributes, forwardRef } from 'react'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className={`
            w-4 h-4 text-primary bg-background border-border
            focus:ring-2 focus:ring-primary focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
            ${className}
          `}
          {...props}
        />
        {label && (
          <label
            htmlFor={radioId}
            className="ml-2 text-sm font-medium text-text-primary cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'

export default Radio
