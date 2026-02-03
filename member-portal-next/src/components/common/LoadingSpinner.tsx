'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  fullScreen?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
}

export function LoadingSpinner({
  size = 'md',
  message,
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-skali-accent border-t-transparent',
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="text-gray-300 text-sm animate-pulse">{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass-card rounded-2xl p-8">
          {spinner}
        </div>
      </div>
    )
  }

  return spinner
}

// Skeleton loader for content placeholders
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-700/50'

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{
        width: width ?? (variant === 'text' ? '100%' : undefined),
        height: height ?? (variant === 'circular' ? width : undefined),
      }}
    />
  )
}

// Card skeleton for loading states
export function CardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={100} />
      <div className="flex gap-2">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="30%" />
      </div>
    </div>
  )
}
