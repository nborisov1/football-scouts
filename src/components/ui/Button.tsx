'use client'

import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: string
  children: React.ReactNode
}

/**
 * Unified Button component that ensures consistent styling
 * across all pages using the centralized design system
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-display font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'btn-page-primary',
    secondary: 'btn-page-secondary', 
    outline: 'btn-outline',
    gradient: 'btn-gradient',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-transparent border-none'
  }
  
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'px-6 py-3 text-base',
    lg: 'btn-lg'
  }
  
  const stateClasses = {
    disabled: disabled || loading ? 'btn-disabled' : '',
    loading: loading ? 'btn-loading' : ''
  }
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    stateClasses.disabled,
    stateClasses.loading,
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          טוען...
        </>
      ) : (
        <>
          {icon && <i className={icon}></i>}
          {children}
        </>
      )}
    </button>
  )
}

// Additional utility components for common button patterns
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
)

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
)

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
)

export const GradientButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="gradient" {...props} />
)