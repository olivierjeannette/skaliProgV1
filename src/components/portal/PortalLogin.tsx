'use client'

import { useState } from 'react'
import { usePortalStore, searchMembers } from '@/stores/portal-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User,
  Search,
  ChevronRight,
  Lock,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft,
  Loader2,
  Dumbbell
} from 'lucide-react'

// Discord icon SVG
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

export function PortalLogin() {
  const { login, linkMemberToDiscord, currentUser, error } = usePortalStore()
  const [step, setStep] = useState<'login' | 'link'>('login')
  const [discordId, setDiscordId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchMembers>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsLoading(true)

    const success = await login(discordId)

    setIsLoading(false)

    if (success) {
      // Si pas de membre lié, passer à l'étape de liaison
      const store = usePortalStore.getState()
      if (!store.linkedMember) {
        setStep('link')
      }
    } else {
      setLoginError(error || 'Erreur de connexion')
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      setSearchResults(searchMembers(query))
    } else {
      setSearchResults([])
    }
  }

  const handleLinkMember = async (memberId: string) => {
    if (!currentUser) return

    const success = await linkMemberToDiscord(
      memberId,
      currentUser.discordId,
      currentUser.username
    )

    if (success) {
      // La page se rechargera automatiquement avec le nouveau state
      window.location.reload()
    }
  }

  // Écran de connexion Discord
  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/80 border-slate-700 backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-10 w-10 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Skàli Portal</h1>
                <p className="text-emerald-100 text-sm">Espace Membre</p>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Info box */}
            <Alert className="bg-indigo-500/10 border-indigo-500/30">
              <Info className="h-4 w-4 text-indigo-400" />
              <AlertDescription className="text-slate-300 text-sm">
                <p className="font-semibold mb-2">Comment trouver mon Discord ID ?</p>
                <ol className="list-decimal list-inside text-xs space-y-1 text-slate-400">
                  <li>Ouvrir Discord</li>
                  <li>Paramètres → Avancés</li>
                  <li>Activer &quot;Mode développeur&quot;</li>
                  <li>Clic droit sur votre nom → &quot;Copier l&apos;ID&quot;</li>
                </ol>
              </AlertDescription>
            </Alert>

            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <DiscordIcon className="h-4 w-4 text-indigo-400" />
                  Votre Discord ID
                </label>
                <Input
                  type="text"
                  placeholder="123456789012345678"
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                  pattern="[0-9]{17,19}"
                  required
                  className="bg-slate-900/50 border-slate-600 text-white font-mono text-lg"
                />
                <p className="text-xs text-slate-500 mt-1">17-19 chiffres uniquement</p>
              </div>

              {loginError && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">{loginError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <DiscordIcon className="h-4 w-4 mr-2" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-slate-500">
              Vous devez être membre du serveur Discord Skàli
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Écran de liaison profil
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/80 border-slate-700 backdrop-blur-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <User className="h-10 w-10 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Lier votre profil</h1>
              <p className="text-emerald-100 text-sm">Discord: {currentUser?.username}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Info */}
          <Alert className="bg-yellow-500/10 border-yellow-500/30">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-slate-300 text-sm">
              <p className="font-semibold">Première connexion</p>
              <p className="text-slate-400 text-xs">
                Recherchez et sélectionnez votre profil adhérent pour le lier à votre Discord.
              </p>
            </AlertDescription>
          </Alert>

          {/* Search */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Search className="h-4 w-4 text-emerald-400" />
              Rechercher votre nom
            </label>
            <Input
              type="text"
              placeholder="Nom ou prénom..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchQuery.length < 2 ? (
              <div className="text-center py-6 text-slate-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tapez au moins 2 caractères...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Aucun adhérent trouvé</p>
                <p className="text-xs">Vérifiez l&apos;orthographe</p>
              </div>
            ) : (
              searchResults.map((member) => {
                const isLinked = !!member.discord_id && member.discord_id !== currentUser?.discordId
                const canSelect = !isLinked

                return (
                  <button
                    key={member.id}
                    onClick={() => canSelect && handleLinkMember(member.id)}
                    disabled={!canSelect}
                    className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 text-left ${
                      canSelect
                        ? 'bg-slate-900/50 border-slate-600 hover:border-emerald-500 hover:bg-slate-800 cursor-pointer'
                        : 'bg-slate-900/30 border-red-500/30 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      canSelect
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                        : 'bg-gradient-to-br from-red-500 to-rose-500'
                    }`}>
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{member.name}</h4>
                      {isLinked ? (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Déjà lié à un autre Discord
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Disponible
                        </p>
                      )}
                    </div>
                    {canSelect ? (
                      <ChevronRight className="h-5 w-5 text-slate-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-red-400" />
                    )}
                  </button>
                )
              })
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setStep('login')
              setSearchQuery('')
              setSearchResults([])
            }}
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
