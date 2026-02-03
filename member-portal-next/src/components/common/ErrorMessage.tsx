'use client'

import { cn } from '@/lib/utils'
import { AlertCircle, RefreshCw, X } from 'lucide-react'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'inline' | 'card' | 'fullscreen'
  className?: string
}

export function ErrorMessage({
  title = 'Erreur',
  message,
  onRetry,
  onDismiss,
  variant = 'card',
  className,
}: ErrorMessageProps) {
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-red-400 text-sm',
          className
        )}
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{message}</span>
      </div>
    )
  }

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-300">{message}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-skali-accent/20 hover:bg-skali-accent/30 text-skali-accent rounded-xl transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-1 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors font-medium"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default: card variant
  return (
    <div
      className={cn(
        'glass-card rounded-xl p-6 border border-red-500/30 bg-red-900/10',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-white mb-1">{title}</h4>
          <p className="text-gray-300 text-sm">{message}</p>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {onRetry && (
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 text-skali-accent hover:text-skali-accent/80 text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      )}
    </div>
  )
}

// Access denied specific error
export function AccessDenied({
  message = "Vous n'avez pas accès à cette page.",
  onBack,
}: {
  message?: string
  onBack?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Accès Refusé</h2>
      <p className="text-gray-400 text-center max-w-md mb-6">{message}</p>

      {onBack && (
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium"
        >
          Retour
        </button>
      )}
    </div>
  )
}

// Session expired error
export function SessionExpired({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-amber-500" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Session Expirée</h2>
      <p className="text-gray-400 text-center max-w-md mb-6">
        Votre session a expiré. Veuillez vous reconnecter pour continuer.
      </p>

      <button
        onClick={onLogin}
        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all font-medium"
      >
        Se reconnecter avec Discord
      </button>
    </div>
  )
}

// No profile linked error
export function NoProfileLinked() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-blue-500" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Profil Non Lié</h2>
      <p className="text-gray-400 text-center max-w-md mb-6">
        Aucun profil membre n'est lié à votre compte Discord.
        Contactez un administrateur pour lier votre profil.
      </p>
    </div>
  )
}
