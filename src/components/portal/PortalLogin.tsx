'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePortalStore, searchMembers } from '@/stores/portal-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  UserCheck,
  Info,
} from 'lucide-react'

// Types
interface SearchMember {
  id: string
  name: string
  first_name?: string
  last_name?: string
  email?: string
  discord_id?: string
  is_linked?: boolean
}

// Discord icon SVG
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

export function PortalLogin() {
  const { linkMemberToDiscord, currentUser, logout } = usePortalStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)

  // Check for OAuth errors in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      switch (errorParam) {
        case 'access_denied':
          setAuthError('Vous avez refus\u00e9 l\'autorisation Discord')
          break
        case 'invalid_state':
          setAuthError('Erreur de s\u00e9curit\u00e9. Veuillez r\u00e9essayer.')
          break
        case 'auth_failed':
          setAuthError('\u00c9chec de l\'authentification Discord')
          break
        case 'not_guild_member':
          setAuthError('Vous devez \u00eatre membre du serveur Discord La Sk\u00e0li')
          break
        default:
          setAuthError('Erreur de connexion')
      }
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Debounced search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    setLinkError(null)

    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchMembers(query)
      setSearchResults(results)
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleDiscordLogin = () => {
    setIsLoading(true)
    setAuthError(null)
    window.location.href = '/api/auth/discord'
  }

  const handleLinkMember = async (member: SearchMember) => {
    if (!currentUser) return

    setIsLinking(true)
    setLinkError(null)

    try {
      const success = await linkMemberToDiscord(member.id)

      if (success) {
        // Reload to show the portal
        window.location.reload()
      } else {
        setLinkError('Impossible de lier ce profil. Veuillez r\u00e9essayer.')
      }
    } catch {
      setLinkError('Erreur lors de la liaison. Veuillez r\u00e9essayer.')
    } finally {
      setIsLinking(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/portal'
  }

  // Si l'utilisateur est connect\u00e9 avec Discord mais pas li\u00e9 -> Afficher l'\u00e9tape de liaison
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/80 border-slate-700 backdrop-blur-xl">
          {/* Header with Discord user */}
          <div className="bg-gradient-to-r from-[#228B22] to-emerald-600 p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="h-14 w-14 rounded-full border-3 border-white/30 shadow-lg"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-7 w-7 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">Bienvenue !</h1>
                <p className="text-emerald-100 text-sm flex items-center gap-1">
                  <DiscordIcon className="h-4 w-4" />
                  {currentUser.username}
                </p>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-xs text-white font-medium">\u00c9tape 2/2</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-5">
            {/* Info box */}
            <Alert className="bg-emerald-500/10 border-emerald-500/30">
              <Info className="h-4 w-4 text-emerald-400" />
              <AlertDescription className="text-slate-300 text-sm">
                <p className="font-semibold mb-1">Derni\u00e8re \u00e9tape !</p>
                <p className="text-slate-400 text-xs">
                  Recherchez votre nom pour lier votre profil adh\u00e9rent \u00e0 votre compte Discord.
                  Ceci permet d&apos;acc\u00e9der \u00e0 vos donn\u00e9es et performances.
                </p>
              </AlertDescription>
            </Alert>

            {/* Link error */}
            {linkError && (
              <Alert className="bg-red-500/10 border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300 text-sm">{linkError}</AlertDescription>
              </Alert>
            )}

            {/* Search */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Search className="h-4 w-4 text-emerald-400" />
                Rechercher votre nom
              </label>
              <Input
                type="text"
                placeholder="Pr\u00e9nom ou nom de famille..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 h-12 text-base"
                autoFocus
                disabled={isLinking}
              />
            </div>

            {/* Results */}
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                {isSearching ? (
                  <div className="text-center py-10 text-slate-500">
                    <Loader2 className="h-10 w-10 mx-auto mb-3 animate-spin text-emerald-500" />
                    <p className="text-sm">Recherche en cours...</p>
                  </div>
                ) : searchQuery.length < 2 ? (
                  <div className="text-center py-10 text-slate-500">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Tapez au moins 2 caract\u00e8res</p>
                    <p className="text-xs text-slate-600 mt-1">pour rechercher votre profil</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Aucun adh\u00e9rent trouv\u00e9</p>
                    <p className="text-xs text-slate-600 mt-1">
                      V\u00e9rifiez l&apos;orthographe ou contactez un coach
                    </p>
                  </div>
                ) : (
                  searchResults.map((member) => {
                    const isLinkedToOther = member.discord_id && member.discord_id !== currentUser.discordId
                    const isLinkedToMe = member.discord_id === currentUser.discordId
                    const canSelect = !isLinkedToOther && !isLinking

                    return (
                      <button
                        key={member.id}
                        onClick={() => canSelect && handleLinkMember(member)}
                        disabled={!canSelect}
                        className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 text-left ${
                          isLinkedToMe
                            ? 'bg-emerald-500/10 border-emerald-500/50 cursor-pointer'
                            : canSelect
                            ? 'bg-slate-900/50 border-slate-600 hover:border-emerald-500 hover:bg-slate-800 cursor-pointer'
                            : 'bg-slate-900/30 border-red-500/30 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isLinkedToMe
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                            : canSelect
                            ? 'bg-gradient-to-br from-slate-600 to-slate-700'
                            : 'bg-gradient-to-br from-red-500/50 to-rose-500/50'
                        }`}>
                          {isLinkedToMe ? (
                            <UserCheck className="h-6 w-6 text-white" />
                          ) : (
                            <User className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate text-base">
                            {member.name}
                          </h4>
                          {member.email && (
                            <p className="text-xs text-slate-500 truncate">{member.email}</p>
                          )}
                          {isLinkedToOther ? (
                            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                              <Lock className="h-3 w-3" />
                              D\u00e9j\u00e0 li\u00e9 \u00e0 un autre compte
                            </p>
                          ) : isLinkedToMe ? (
                            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                              <CheckCircle className="h-3 w-3" />
                              Votre profil (cliquez pour confirmer)
                            </p>
                          ) : (
                            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                              <CheckCircle className="h-3 w-3" />
                              Disponible
                            </p>
                          )}
                        </div>
                        {canSelect ? (
                          isLinking ? (
                            <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-slate-500" />
                          )
                        ) : (
                          <Lock className="h-5 w-5 text-red-400" />
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </ScrollArea>

            {/* Logout button */}
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLinking}
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Utiliser un autre compte Discord
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Login screen with Discord OAuth (Step 1)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/80 border-slate-700 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#228B22] to-emerald-600 p-8 text-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white rounded-full" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-2 border-white rounded-full" />
            <div className="absolute top-1/2 right-8 w-8 h-8 border-2 border-white rounded-full" />
          </div>

          <div className="relative">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-xl">
                <Dumbbell className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">Sk\u00e0li Prog</h1>
            <p className="text-emerald-100 mt-2">Espace Membre</p>
            <div className="mt-3 bg-white/20 px-3 py-1 rounded-full inline-block">
              <span className="text-xs text-white font-medium">\u00c9tape 1/2</span>
            </div>
          </div>
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
            className="w-full h-14 bg-[#5865F2] hover:bg-[#4752C4] text-white text-lg font-semibold shadow-lg shadow-indigo-500/20"
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
              Connectez-vous pour acc\u00e9der \u00e0 :
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2 bg-slate-900/50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Planning des s\u00e9ances</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Vos performances</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Carte Pok\u00e9mon</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Notifications</span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600">
            Vous devez \u00eatre membre du serveur Discord La Sk\u00e0li
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
