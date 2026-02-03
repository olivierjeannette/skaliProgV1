'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard, LoadingSpinner } from '@/components/common'
import { Shield, Smartphone } from 'lucide-react'

export function DiscordLoginScreen() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    // Redirect to Discord OAuth - this will be handled by the API route
    window.location.href = '/api/auth/discord'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-skali-darker via-skali-dark to-skali-darker">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="max-w-md w-full text-center" padding="lg" rounded="2xl">
          {/* Discord Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mb-6 flex justify-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow">
              <i className="fab fa-discord text-5xl text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white mb-3">
              Portail Adhérent
            </h2>
            <p className="text-gray-300 mb-8">
              Connectez-vous une seule fois avec Discord
            </p>
          </motion.div>

          {/* Login Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg mb-6 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Connexion en cours...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="fab fa-discord text-xl" />
                Se connecter avec Discord
              </span>
            )}
          </motion.button>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            {/* Persistence Info */}
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p className="font-semibold text-white mb-1">
                    📱 Connexion sauvegardée
                  </p>
                  <p>
                    Vous restez connecté pendant{' '}
                    <strong className="text-green-400">90 jours</strong> - plus
                    besoin de vous reconnecter à chaque visite !
                  </p>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p className="font-semibold text-white mb-1">
                    Pourquoi Discord ?
                  </p>
                  <p>
                    Pour protéger vos données et garantir que seul vous puissiez
                    accéder à vos performances.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
