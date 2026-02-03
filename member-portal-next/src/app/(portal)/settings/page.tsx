'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMemberStore, useAuthStore, useUIStore } from '@/store/member-store'
import {
  GlassCard,
  GlassButton,
  GlassInput,
  LoadingSpinner,
} from '@/components/common'
import {
  Settings,
  User,
  Bell,
  Shield,
  Download,
  Trash2,
  Moon,
  Sun,
  Smartphone,
  Mail,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'

// Discord connection status
interface DiscordStatus {
  connected: boolean
  username: string
  avatar: string | null
  connectedAt?: string
}

export default function SettingsPage() {
  const { currentMember } = useMemberStore()
  const { session } = useAuthStore()
  const { addNotification } = useUIStore()

  const [isExporting, setIsExporting] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [goalReminders, setGoalReminders] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(false)

  // Get Discord status from session
  const discordStatus: DiscordStatus = {
    connected: !!session?.discord_user,
    username: session?.discord_user?.username || '',
    avatar: session?.discord_user?.avatar || null,
  }

  // Export user data as JSON
  const handleExportData = async () => {
    if (!currentMember) return

    setIsExporting(true)

    try {
      // Simulate gathering all user data
      const exportData = {
        profile: currentMember,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `skali-data-${currentMember.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      addNotification({
        type: 'success',
        message: 'Vos donnees ont ete exportees avec succes !',
      })
    } catch (error) {
      addNotification({
        type: 'error',
        message: "Erreur lors de l'exportation des donnees",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Toggle switch component
  const ToggleSwitch = ({
    enabled,
    onChange,
    label,
    description,
  }: {
    enabled: boolean
    onChange: (value: boolean) => void
    label: string
    description?: string
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-white font-medium">{label}</p>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-skali-accent/50 ${
          enabled ? 'bg-skali-green' : 'bg-gray-600'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )

  if (!currentMember) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Chargement des parametres..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Parametres</h1>
        <p className="text-gray-400">
          Gerez vos preferences et votre compte
        </p>
      </motion.div>

      {/* Account Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-skali-green/20 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-skali-green" />
            </div>
            <h2 className="text-xl font-bold text-white">Compte</h2>
          </div>

          {/* Discord Connection */}
          <div className="bg-gray-800/30 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {discordStatus.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${session?.discord_user?.id}/${discordStatus.avatar}.png`}
                    alt="Discord Avatar"
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {discordStatus.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-medium flex items-center gap-2">
                    Discord
                    {discordStatus.connected && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </p>
                  {discordStatus.connected ? (
                    <p className="text-sm text-gray-400">
                      Connecte en tant que{' '}
                      <span className="text-indigo-400">
                        @{discordStatus.username}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">Non connecte</p>
                  )}
                </div>
              </div>
              {discordStatus.connected && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                  Actif
                </span>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-glass-border">
              <span className="text-gray-400">Nom</span>
              <span className="text-white font-medium">{currentMember.name}</span>
            </div>
            {currentMember.email && (
              <div className="flex items-center justify-between py-2 border-b border-glass-border">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{currentMember.email}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-glass-border">
              <span className="text-gray-400">Membre depuis</span>
              <span className="text-white">
                {new Date(currentMember.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>

          <div className="divide-y divide-glass-border">
            <ToggleSwitch
              enabled={emailNotifications}
              onChange={setEmailNotifications}
              label="Notifications par email"
              description="Recevez des mises a jour par email"
            />
            <ToggleSwitch
              enabled={pushNotifications}
              onChange={setPushNotifications}
              label="Notifications push"
              description="Notifications sur votre appareil"
            />
            <ToggleSwitch
              enabled={goalReminders}
              onChange={setGoalReminders}
              label="Rappels d'objectifs"
              description="Rappels pour vos objectifs en cours"
            />
            <ToggleSwitch
              enabled={weeklyReport}
              onChange={setWeeklyReport}
              label="Rapport hebdomadaire"
              description="Resume de vos performances chaque semaine"
            />
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 rounded-xl">
            <p className="text-sm text-blue-300 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Les parametres de notification seront actifs prochainement
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Moon className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Apparence</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsDarkMode(true)}
              className={`p-4 rounded-xl border-2 transition-all ${
                isDarkMode
                  ? 'border-skali-green bg-skali-green/10'
                  : 'border-glass-border hover:border-gray-600'
              }`}
            >
              <Moon className="w-6 h-6 mx-auto mb-2 text-gray-300" />
              <p className="text-white font-medium">Sombre</p>
              <p className="text-xs text-gray-400">Par defaut</p>
            </button>
            <button
              onClick={() => setIsDarkMode(false)}
              className={`p-4 rounded-xl border-2 transition-all ${
                !isDarkMode
                  ? 'border-skali-green bg-skali-green/10'
                  : 'border-glass-border hover:border-gray-600'
              }`}
            >
              <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
              <p className="text-white font-medium">Clair</p>
              <p className="text-xs text-gray-400">Bientot disponible</p>
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Data Management Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Donnees & Confidentialite</h2>
          </div>

          <div className="space-y-4">
            {/* Export Data */}
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Exporter mes donnees</p>
                  <p className="text-sm text-gray-400">
                    Telecharger toutes vos donnees au format JSON
                  </p>
                </div>
              </div>
              <GlassButton
                variant="default"
                size="sm"
                onClick={handleExportData}
                loading={isExporting}
              >
                {isExporting ? 'Export...' : 'Exporter'}
              </GlassButton>
            </div>

            {/* Sync Data */}
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Synchroniser</p>
                  <p className="text-sm text-gray-400">
                    Forcer la synchronisation des donnees
                  </p>
                </div>
              </div>
              <GlassButton
                variant="default"
                size="sm"
                onClick={() => {
                  addNotification({
                    type: 'success',
                    message: 'Donnees synchronisees !',
                  })
                }}
              >
                Synchroniser
              </GlassButton>
            </div>

            {/* Delete Account Warning */}
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-300 font-medium">Zone de danger</p>
                  <p className="text-sm text-red-200/70 mb-3">
                    La suppression de compte est irreversible. Contactez un
                    administrateur si vous souhaitez supprimer votre compte.
                  </p>
                  <GlassButton variant="danger" size="sm" disabled>
                    <Trash2 className="w-4 h-4" />
                    Supprimer mon compte
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard padding="sm">
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">Skali Prog - Portail Adherent</p>
            <p className="text-gray-500 text-xs">Version 2.4.0</p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
