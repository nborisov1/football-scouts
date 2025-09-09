'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import Button from './Button'

const modalVariants = cva(
  "bg-background-surface backdrop-blur-lg rounded-xl shadow-xl border border-neutral-200/50 overflow-hidden",
  {
    variants: {
      size: {
        sm: "max-w-md w-full",
        md: "max-w-2xl w-full", 
        lg: "max-w-4xl w-full",
        xl: "max-w-7xl w-full",
        full: "max-w-full w-full h-full",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  closeOnBackdrop?: boolean
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size,
  className,
  closeOnBackdrop = true,
}) => {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={cn(modalVariants({ size, className }))}>
        {/* Header */}
        {title && (
          <div className="flex justify-between items-center p-6 border-b border-neutral-200">
            <div className="flex items-center space-x-3 space-x-reverse">
              <h2 className="text-xl font-display font-bold text-text-primary">{title}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 rounded-full hover:bg-neutral-100"
              icon="fas fa-times"
              aria-label="סגור"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

const ModalContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn("p-6", className)}>
    {children}
  </div>
)

const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn("flex justify-end space-x-4 space-x-reverse p-6 border-t border-neutral-200 bg-neutral-50/50", className)}>
    {children}
  </div>
)

export { Modal, ModalContent, ModalFooter }
