'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const inputVariants = cva(
  "w-full rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "border-neutral-300 bg-background-surface text-text-primary focus:border-primary-500 focus:ring-primary-500/20",
        error: "border-error-500 bg-background-surface text-text-primary focus:border-error-500 focus:ring-error-500/20",
        success: "border-success-500 bg-background-surface text-text-primary focus:border-success-500 focus:ring-success-500/20",
      },
      size: {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-3 text-base",
        lg: "px-4 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  icon?: string
  hint?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, icon, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-display font-semibold text-text-secondary">
            {icon && <i className={`${icon} ml-2 text-primary-500`} />}
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(inputVariants({ variant: error ? "error" : variant, size, className }))}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-error-600 flex items-center space-x-1 space-x-reverse">
            <i className="fas fa-exclamation-triangle" />
            <span>{error}</span>
          </p>
        )}
        {hint && !error && (
          <p className="text-sm text-text-muted">{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
