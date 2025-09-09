'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 text-neutral-800 border border-neutral-200",
        primary: "bg-primary-100 text-primary-800 border border-primary-200",
        secondary: "bg-accent-100 text-accent-800 border border-accent-200",
        success: "bg-success-100 text-success-800 border border-success-200",
        warning: "bg-warning-100 text-warning-800 border border-warning-200",
        error: "bg-error-100 text-error-800 border border-error-200",
        info: "bg-info-100 text-info-800 border border-info-200",
        outline: "border border-neutral-300 text-text-secondary bg-transparent",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode
  icon?: string
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, children, icon, ...props }, ref) => {
    return (
      <div
        className={cn(badgeVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon && <i className={`${icon} ml-1`} />}
        {children}
      </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
