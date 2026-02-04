import { create } from 'zustand'
import {
  EpicCharacter,
  CardTheme,
  assignRandomCharacter,
  getRarityFromPercentile,
  RARITY_CONFIG,
  THEME_OPTIONS
} from '@/config/epic-cards'

interface PortalUser {
  discordId: string
  username: string
  avatar?: string | null
}

interface LinkedMember {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  gender?: 'M' | 'F'
  birthDate?: string
  weight?: number
  height?: number
  discord_id?: string
  discord_username?: string
  status?: 'active' | 'inactive'
  created_at?: string
  // Preferences utilisateur
  preferred_theme?: CardTheme
  // Dernier nombre de PRs (pour detecter les nouveaux PRs)
  lastPrCount?: number
}

// Systeme de stats pour les cartes epiques
interface MemberStats {
  // Stats de base (calculees depuis les performances)
  strength: number   // Force (1RM squats, deadlifts, etc.)
  endurance: number  // Endurance (cardio, AMRAP scores)
  speed: number      // Vitesse (temps sur WODs, sprints)
  technique: number  // Technique (mouvements gym, oly lifts)
  power: number      // Puissance (clean&jerk, thrusters)
  // Progression
  level: number
  xp: number
  xpToNextLevel: number
  percentile: number // Position dans le classement (0-100)
  // Compteurs
  sessionCount: number
  prCount: number
}

interface SessionMember {
  id: string
  first_name: string
  last_name: string
  email: string | null
}

interface PortalSession {
  discord_id: string
  discord_username: string
  discord_avatar: string | null
  member: SessionMember | null
  is_linked: boolean
}

interface PortalStore {
  currentUser: PortalUser | null
  linkedMember: LinkedMember | null
  memberStats: MemberStats | null
  epicCharacter: EpicCharacter | null
  isLoading: boolean
  error: string | null

  // Actions
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  setLinkedMember: (member: LinkedMember | null) => Promise<void>
  linkMemberToDiscord: (memberId: string) => Promise<boolean>
  setPreferredTheme: (theme: CardTheme) => void
  refreshStats: () => Promise<void>
  // Nouvelle action: force une nouvelle carte aleatoire
  rerollCharacter: () => void
}

// Recupere les stats du membre depuis l'API
const fetchMemberStats = async (): Promise<MemberStats | null> => {
  try {
    const response = await fetch('/api/portal/stats')
    if (response.ok) {
      const data = await response.json()
      return data.stats || null
    }
  } catch (error) {
    console.error('Failed to fetch member stats:', error)
  }
  return null
}

// Stats par defaut si API non disponible
const getDefaultStats = (): MemberStats => ({
  strength: 30,
  endurance: 30,
  speed: 30,
  technique: 30,
  power: 30,
  level: 1,
  xp: 0,
  xpToNextLevel: 600,
  percentile: 50,
  sessionCount: 0,
  prCount: 0
})

export const usePortalStore = create<PortalStore>((set, get) => ({
  currentUser: null,
  linkedMember: null,
  memberStats: null,
  epicCharacter: null,
  isLoading: true,
  error: null,

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore errors
    }
    set({
      currentUser: null,
      linkedMember: null,
      memberStats: null,
      epicCharacter: null,
      error: null
    })
  },

  checkSession: async () => {
    set({ isLoading: true })

    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()

      if (data.session) {
        const session: PortalSession = data.session

        const user: PortalUser = {
          discordId: session.discord_id,
          username: session.discord_username,
          avatar: session.discord_avatar
        }

        let linkedMember: LinkedMember | null = null
        let memberStats: MemberStats | null = null
        let epicCharacter: EpicCharacter | null = null

        if (session.member) {
          linkedMember = {
            id: session.member.id,
            name: `${session.member.first_name} ${session.member.last_name}`,
            firstName: session.member.first_name,
            lastName: session.member.last_name,
            email: session.member.email || undefined,
            discord_id: session.discord_id,
            discord_username: session.discord_username,
          }

          // Recuperer les vraies stats depuis l'API
          memberStats = await fetchMemberStats() || getDefaultStats()

          // Assigner un personnage aleatoire selon le percentile
          epicCharacter = assignRandomCharacter(memberStats.percentile)

          // Stocker le nombre de PRs actuel
          linkedMember.lastPrCount = memberStats.prCount
        }

        set({
          currentUser: user,
          linkedMember,
          memberStats,
          epicCharacter,
          isLoading: false
        })
        return
      }

      set({
        currentUser: null,
        linkedMember: null,
        memberStats: null,
        epicCharacter: null,
        isLoading: false
      })
    } catch {
      set({ isLoading: false })
    }
  },

  setLinkedMember: async (member) => {
    if (member) {
      set({ linkedMember: member })
      // Recuperer les vraies stats depuis l'API
      const stats = await fetchMemberStats() || getDefaultStats()
      // Assigner un personnage aleatoire selon le percentile
      const character = assignRandomCharacter(stats.percentile)
      set({
        memberStats: stats,
        epicCharacter: character,
        linkedMember: { ...member, lastPrCount: stats.prCount }
      })
    } else {
      set({
        linkedMember: null,
        memberStats: null,
        epicCharacter: null
      })
    }
  },

  setPreferredTheme: (theme) => {
    const { linkedMember, memberStats } = get()
    if (linkedMember && memberStats) {
      const updatedMember = { ...linkedMember, preferred_theme: theme }
      // Nouvelle carte aleatoire quand on change de theme
      const character = assignRandomCharacter(memberStats.percentile)
      set({
        linkedMember: updatedMember,
        epicCharacter: character
      })
      // TODO: Sauvegarder preference dans Supabase
    }
  },

  refreshStats: async () => {
    const { linkedMember } = get()
    if (!linkedMember) return

    try {
      // Appeler /api/portal/stats pour recuperer les vraies stats
      const stats = await fetchMemberStats()
      if (stats) {
        const previousPrCount = linkedMember.lastPrCount || 0
        const hasNewPr = stats.prCount > previousPrCount

        // Si nouveau PR detecte, nouvelle carte aleatoire!
        const character = hasNewPr
          ? assignRandomCharacter(stats.percentile)
          : get().epicCharacter || assignRandomCharacter(stats.percentile)

        set({
          memberStats: stats,
          epicCharacter: character,
          linkedMember: { ...linkedMember, lastPrCount: stats.prCount }
        })
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    }
  },

  // Force une nouvelle carte aleatoire (bouton "Reroll")
  rerollCharacter: () => {
    const { memberStats } = get()
    if (memberStats) {
      const character = assignRandomCharacter(memberStats.percentile)
      set({ epicCharacter: character })
    }
  },

  linkMemberToDiscord: async (memberId) => {
    try {
      const response = await fetch('/api/members/link-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.member) {
          set({ linkedMember: data.member })
          // Recuperer les vraies stats depuis l'API
          const stats = await fetchMemberStats() || getDefaultStats()
          // Assigner un personnage aleatoire selon le percentile
          const character = assignRandomCharacter(stats.percentile)
          set({
            memberStats: stats,
            epicCharacter: character,
            linkedMember: { ...data.member, lastPrCount: stats.prCount }
          })
          return true
        }
      }

      return false
    } catch {
      return false
    }
  }
}))

// Recherche de membres via l'API
export const searchMembers = async (query: string): Promise<LinkedMember[]> => {
  try {
    const response = await fetch(`/api/members/search?q=${encodeURIComponent(query)}`)
    if (response.ok) {
      const data = await response.json()
      return data.members || []
    }
  } catch {
    // Ignore errors
  }
  return []
}

export const getMemberById = async (id: string): Promise<LinkedMember | null> => {
  try {
    const response = await fetch(`/api/members/${id}`)
    if (response.ok) {
      const data = await response.json()
      return data.member || null
    }
  } catch {
    // Ignore errors
  }
  return null
}

// Export des options de theme pour les selecteurs
export { THEME_OPTIONS, RARITY_CONFIG, getRarityFromPercentile }
