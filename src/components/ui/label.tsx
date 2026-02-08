import { LabelHTMLAttributes, forwardRef } from 'react'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, className = '', children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`
          block text-sm font-medium text-text-primary mb-1.5
          ${className}
        `}
        {...props}
      >
        {children}
        {required && <span className="text-error ml-1">*</span>}
      </label>
    )
  }
)

Label.displayName = 'Label'

export default Label
