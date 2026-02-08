'use client'

import { HTMLAttributes, forwardRef } from 'react'

/**
 * Visually Hidden Component
 *
 * Hides content visually while keeping it accessible to screen readers.
 * Use for providing additional context to assistive technologies.
 */

interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  as?: 'span' | 'div' | 'label'
}

const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  ({ as: Component = 'span', children, className = '', ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={`sr-only ${className}`}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

VisuallyHidden.displayName = 'VisuallyHidden'

export default VisuallyHidden
