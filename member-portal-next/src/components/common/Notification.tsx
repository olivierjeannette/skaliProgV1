'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/member-store'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import type { NotificationState } from '@/types'

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap = {
  success: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    icon: 'text-green-500',
    text: 'text-green-100',
  },
  error: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    icon: 'text-red-500',
    text: 'text-red-100',
  },
  warning: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    icon: 'text-amber-500',
    text: 'text-amber-100',
  },
  info: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-500',
    text: 'text-blue-100',
  },
}

interface NotificationItemProps {
  notification: NotificationState
  onRemove: (id: string) => void
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const Icon = iconMap[notification.type]
  const colors = colorMap[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border backdrop-blur-lg shadow-lg',
        colors.bg,
        colors.border
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', colors.icon)} />

      <p className={cn('flex-1 text-sm font-medium', colors.text)}>
        {notification.message}
      </p>

      <button
        onClick={() => onRemove(notification.id)}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </motion.div>
  )
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useUIStore()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onRemove={removeNotification}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for easy notification usage
export function useNotification() {
  const addNotification = useUIStore((state) => state.addNotification)

  return {
    success: (message: string, duration?: number) =>
      addNotification({ type: 'success', message, duration }),
    error: (message: string, duration?: number) =>
      addNotification({ type: 'error', message, duration: duration || 5000 }),
    warning: (message: string, duration?: number) =>
      addNotification({ type: 'warning', message, duration }),
    info: (message: string, duration?: number) =>
      addNotification({ type: 'info', message, duration }),
  }
}
