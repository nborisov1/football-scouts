'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const loadingVariants = cva(
  "inline-flex items-center",
  {
    variants: {
      variant: {
        spinner: "",
        dots: "space-x-1 space-x-reverse",
        skeleton: "",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    defaultVariants: {
      variant: "spinner",
      size: "md",
    },
  }
)

export interface LoadingProps extends VariantProps<typeof loadingVariants> {
  text?: string
  className?: string
}

const Loading: React.FC<LoadingProps> = ({
  variant,
  size,
  text,
  className,
}) => {
  const sizeClasses = {
    sm: { spinner: "h-4 w-4", dot: "h-2 w-2", text: "text-sm" },
    md: { spinner: "h-6 w-6", dot: "h-3 w-3", text: "text-base" },
    lg: { spinner: "h-8 w-8", dot: "h-4 w-4", text: "text-lg" },
  }

  const currentSize = sizeClasses[size || 'md']

  if (variant === 'dots') {
    return (
      <div className={cn(loadingVariants({ variant, size, className }))}>
        <div className={cn("bg-primary-500 rounded-full animate-pulse", currentSize.dot)} />
        <div className={cn("bg-primary-400 rounded-full animate-pulse", currentSize.dot)} style={{ animationDelay: '0.2s' }} />
        <div className={cn("bg-primary-300 rounded-full animate-pulse", currentSize.dot)} style={{ animationDelay: '0.4s' }} />
        {text && <span className={cn("mr-3 text-text-muted", currentSize.text)}>{text}</span>}
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
      </div>
    )
  }

  // Default spinner
  return (
    <div className={cn(loadingVariants({ variant, size, className }))}>
      <div className={cn("animate-spin rounded-full border-2 border-primary-200 border-t-primary-500", currentSize.spinner)} />
      {text && <span className={cn("mr-3 text-text-muted", currentSize.text)}>{text}</span>}
    </div>
  )
}

const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("animate-pulse", className)}>
    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
  </div>
)

export { Loading, LoadingSkeleton }
