'use client'

import { useState } from 'react'
import { usePortalStore } from '@/stores/portal-store'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalNav } from '@/components/portal/PortalNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Ruler,
  Weight,
  Edit,
  Save,
  X,
  Bell,
  Moon,
  Smartphone,
  Shield,
  LogOut,
  Trash2,
  Crown,
  Dumbbell,
  Trophy,
  Link2,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'

// Types
interface ProfileSettings {
  notifications: {
    sessionReminders: boolean
    prAlerts: boolean
    communityUpdates: boolean
  }
  display: {
    darkMode: boolean
    compactView: boolean
  }
  privacy: {
    showOnLeaderboard: boolean
    shareStats: boolean
  }
}

const defaultSettings: ProfileSettings = {
  notifications: {
    sessionReminders: true,
    prAlerts: true,
    communityUpdates: false
  },
  display: {
    darkMode: true,
    compactView: false
  },
  privacy: {
    showOnLeaderboard: true,
    shareStats: true
  }
}

export default function ProfilePage() {
  const { linkedMember, currentUser, memberStats, epicCharacter, logout } = usePortalStore()
  const [isEditing, setIsEditing] = useState(false)
  const [settings, setSettings] = useState<ProfileSettings>(defaultSettings)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const [formData, setFormData] = useState({
    weight: linkedMember?.weight?.toString() || '',
    height: linkedMember?.height?.toString() || '',
    phone: linkedMember?.phone || '',
    email: linkedMember?.email || ''
  })

  if (!linkedMember || !currentUser) {
    return null
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const age = calculateAge(linkedMember.birthDate)

  const handleSave = () => {
    // TODO: Sauvegarder dans Supabase
    toast.success('Profil mis a jour')
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    setShowLogoutDialog(false)
  }

  const updateNotificationSetting = (key: keyof ProfileSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }))
  }

  const updateDisplaySetting = (key: keyof ProfileSettings['display'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      display: { ...prev.display, [key]: value }
    }))
  }

  const updatePrivacySetting = (key: keyof ProfileSettings['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value }
    }))
  }

  return (
    <div className="min-h-screen pb-24">
      <PortalHeader title="Mon Profil" />

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Profile header card */}
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <div
            className="h-20 relative"
            style={{
              background: epicCharacter
                ? `linear-gradient(135deg, ${epicCharacter.colors.primary}, ${epicCharacter.colors.secondary}40)`
                : 'linear-gradient(135deg, #064e3b, #0d9488)'
            }}
          />
          <CardContent className="pt-0 pb-4 px-4 -mt-10">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                {currentUser.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${currentUser.discordId}/${currentUser.avatar}.png?size=128`}
                    alt={currentUser.username}
                    className="w-20 h-20 rounded-full border-4 border-slate-900 bg-slate-800"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-4 border-slate-900 bg-slate-700 flex items-center justify-center">
                    <User className="h-10 w-10 text-slate-400" />
                  </div>
                )}
                {memberStats && memberStats.level >= 10 && (
                  <div className="absolute -bottom-1 -right-1 p-1 bg-yellow-500 rounded-full">
                    <Crown className="h-4 w-4 text-yellow-900" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 pb-1">
                <h2 className="text-lg font-bold text-white">{linkedMember.name}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Link2 className="h-3 w-3" />
                  <span>@{currentUser.username}</span>
                </div>
              </div>

              {/* Edit button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="shrink-0"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
            </div>

            {/* Stats badges */}
            {memberStats && (
              <div className="flex gap-2 mt-4">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <Trophy className="h-3 w-3 mr-1" />
                  Niveau {memberStats.level}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Dumbbell className="h-3 w-3 mr-1" />
                  {memberStats.sessionCount} seances
                </Badge>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  <Trophy className="h-3 w-3 mr-1" />
                  {memberStats.prCount} PRs
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal info */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-300">Informations personnelles</CardTitle>
              {isEditing && (
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Sauvegarder
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs text-slate-400 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-900/50 border-slate-600"
                  />
                ) : (
                  <p className="text-white text-sm">{linkedMember.email || '-'}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs text-slate-400 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Telephone
                </Label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-slate-900/50 border-slate-600"
                  />
                ) : (
                  <p className="text-white text-sm">{linkedMember.phone || '-'}</p>
                )}
              </div>

              {/* Age */}
              {age && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Age
                  </Label>
                  <p className="text-white text-sm">{age} ans</p>
                </div>
              )}

              {/* Gender */}
              {linkedMember.gender && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Genre
                  </Label>
                  <p className="text-white text-sm">
                    {linkedMember.gender === 'M' ? 'Homme' : 'Femme'}
                  </p>
                </div>
              )}

              {/* Weight */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400 flex items-center gap-1">
                  <Weight className="h-3 w-3" />
                  Poids
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="bg-slate-900/50 border-slate-600"
                    placeholder="kg"
                  />
                ) : (
                  <p className="text-white text-sm">{linkedMember.weight ? `${linkedMember.weight} kg` : '-'}</p>
                )}
              </div>

              {/* Height */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400 flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  Taille
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="bg-slate-900/50 border-slate-600"
                    placeholder="cm"
                  />
                ) : (
                  <p className="text-white text-sm">{linkedMember.height ? `${linkedMember.height} cm` : '-'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-400" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm text-white">Rappels de seances</Label>
                <p className="text-xs text-slate-500">Notification 1h avant chaque seance</p>
              </div>
              <Switch
                checked={settings.notifications.sessionReminders}
                onCheckedChange={(v) => updateNotificationSetting('sessionReminders', v)}
              />
            </div>
            <Separator className="bg-slate-700" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm text-white">Alertes PRs</Label>
                <p className="text-xs text-slate-500">Quand vous battez un record</p>
              </div>
              <Switch
                checked={settings.notifications.prAlerts}
                onCheckedChange={(v) => updateNotificationSetting('prAlerts', v)}
              />
            </div>
            <Separator className="bg-slate-700" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm text-white">Actualites box</Label>
                <p className="text-xs text-slate-500">Nouveautes, evenements, etc.</p>
              </div>
              <Switch
                checked={settings.notifications.communityUpdates}
                onCheckedChange={(v) => updateNotificationSetting('communityUpdates', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Confidentialite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm text-white">Apparaitre au classement</Label>
                <p className="text-xs text-slate-500">Visible sur le leaderboard</p>
              </div>
              <Switch
                checked={settings.privacy.showOnLeaderboard}
                onCheckedChange={(v) => updatePrivacySetting('showOnLeaderboard', v)}
              />
            </div>
            <Separator className="bg-slate-700" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm text-white">Partager mes stats</Label>
                <p className="text-xs text-slate-500">Les coachs peuvent voir vos performances</p>
              </div>
              <Switch
                checked={settings.privacy.shareStats}
                onCheckedChange={(v) => updatePrivacySetting('shareStats', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* App info */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Version</span>
              <span className="text-slate-300">1.0.0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Membre depuis</span>
              <span className="text-slate-300">
                {linkedMember.created_at
                  ? new Date(linkedMember.created_at).toLocaleDateString('fr-FR')
                  : '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
              <LogOut className="h-4 w-4 mr-2" />
              Deconnexion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Confirmer la deconnexion
              </DialogTitle>
              <DialogDescription>
                Vous serez deconnecte de votre compte Discord. Vous devrez vous reconnecter pour acceder a votre profil.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Deconnexion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <PortalNav />
    </div>
  )
}
