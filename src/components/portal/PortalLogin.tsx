'use client'

import { useState, useEffect } from 'react'
import { usePortalStore, searchMembers } from '@/stores/portal-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User,
  Search,
  ChevronRight,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Dumbbell,
} from 'lucide-react'

// Types
interface LinkedMember {
  id: string
  name: string
  discord_id?: string
}

// Discord icon SVG
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

export function PortalLogin() {
  const { linkMemberToDiscord, currentUser } = usePortalStore()
  const [step, setStep] = useState<'login' | 'link'>('login')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LinkedMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Check for OAuth errors in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      switch (errorParam) {
        case 'access_denied':
          setAuthError('Vous avez refusé l\'autorisation Discord')
          break
        case 'invalid_state':
          setAuthError('Erreur de sécurité. Veuillez réessayer.')
          break
        case 'auth_failed':
          setAuthError('Échec de l\'authentification Discord')
          break
        default:
          setAuthError('Erreur de connexion')
      }
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Check if user came back from OAuth but needs linking
  useEffect(() => {
    if (currentUser && !usePortalStore.getState().linkedMember) {
      setStep('link')
    }
  }, [currentUser])

  const handleDiscordLogin = () => {
    setIsLoading(true)
    setAuthError(null)
    // Redirect to Discord OAuth
    window.location.href = '/api/auth/discord'
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      setIsSearching(true)
      try {
        const results = await searchMembers(query)
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    } else {
      setSearchResults([])
    }
  }

  const handleLinkMember = async (memberId: string) => {
    if (!currentUser) return

    const success = await linkMemberToDiscord(memberId)

    if (success) {
      // Reload to show the portal
      window.location.reload()
    }
  }

  // Login screen with Discord OAuth
  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/80 border-slate-700 backdrop-blur-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#228B22] to-emerald-600 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <Dumbbell className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">Skali Prog</h1>
            <p className="text-emerald-100 mt-2">Espace Membre</p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Error display */}
            {authError && (
              <Alert className="bg-red-500/10 border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">{authError}</AlertDescription>
              </Alert>
            )}

            {/* Discord OAuth Button */}
            <Button
              onClick={handleDiscordLogin}
              disabled={isLoading}
              size="lg"
              className="w-full h-14 bg-[#5865F2] hover:bg-[#4752C4] text-white text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <DiscordIcon className="h-6 w-6 mr-3" />
                  Se connecter avec Discord
                </>
              )}
            </Button>

            {/* Info */}
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <p className="text-center text-sm text-slate-400">
                Connectez-vous avec votre compte Discord pour accéder à :
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Planning des séances</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Vos performances</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Carte Pokemon</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Notifications</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-600">
              Vous devez être membre du serveur Discord La Skali
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Link profile screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/80 border-slate-700 backdrop-blur-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#228B22] to-emerald-600 p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="h-12 w-12 rounded-full border-2 border-white/30"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">Bienvenue !</h1>
              <p className="text-emerald-100 text-sm">{currentUser?.username}</p>
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
            {isSearching ? (
              <div className="text-center py-6 text-slate-500">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm">Recherche...</p>
              </div>
            ) : searchQuery.length < 2 ? (
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
              // Logout and go back
              fetch('/api/auth/logout', { method: 'POST' })
              window.location.href = '/portal'
            }}
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
