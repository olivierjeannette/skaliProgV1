'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'hover' | 'interactive' | 'solid'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4 md:p-6',
  lg: 'p-6 md:p-8',
}

const roundedClasses = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  '2xl': 'rounded-[2rem]',
}

const variantClasses = {
  default: 'bg-glass-bg border border-glass-border backdrop-blur-glass shadow-glass',
  hover: 'bg-glass-bg border border-glass-border backdrop-blur-glass shadow-glass hover:bg-white/[0.08] hover:shadow-card-hover transition-all duration-300',
  interactive: 'bg-glass-bg border border-glass-border backdrop-blur-glass shadow-glass hover:bg-white/[0.08] hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer',
  solid: 'bg-gray-800/80 border border-gray-700/50 shadow-card',
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      rounded = 'xl',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          paddingClasses[padding],
          roundedClasses[rounded],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

// Glass Button component
interface GlassButtonProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const buttonVariants = {
  default: 'bg-glass-bg border border-glass-border hover:bg-white/[0.1] text-white',
  primary: 'bg-gradient-to-r from-skali-green to-skali-accent hover:from-skali-accent hover:to-skali-green text-white border-0',
  danger: 'bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-100',
  ghost: 'bg-transparent hover:bg-white/[0.05] text-gray-300 border-0',
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
}

export function GlassButton({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  className,
  ...props
}: GlassButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}

// Glass Input component
interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-2.5',
              'text-white placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-skali-accent/50 focus:border-skali-accent',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    )
  }
)

GlassInput.displayName = 'GlassInput'

// Glass Select component
interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-2.5',
            'text-white',
            'focus:outline-none focus:ring-2 focus:ring-skali-accent/50 focus:border-skali-accent',
            'transition-all duration-200',
            'appearance-none cursor-pointer',
            error && 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-800">
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    )
  }
)

GlassSelect.displayName = 'GlassSelect'
