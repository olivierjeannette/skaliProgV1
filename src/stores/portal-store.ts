import { create } from 'zustand'
import {
  EpicCharacter,
  CardTheme,
  assignCharacter,
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
  setLinkedMember: (member: LinkedMember | null) => void
  linkMemberToDiscord: (memberId: string) => Promise<boolean>
  setPreferredTheme: (theme: CardTheme) => void
  refreshStats: () => Promise<void>
}

// Genere les stats du membre (sera remplace par API)
const generateMemberStats = (member: LinkedMember): MemberStats => {
  // TODO: Recuperer depuis /api/portal/stats
  // Pour demo, valeurs basees sur l'anciennete du membre
  const daysSinceJoin = member.created_at
    ? Math.floor((Date.now() - new Date(member.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 30

  // Simuler une progression basee sur l'anciennete
  const baseLevel = Math.min(Math.floor(daysSinceJoin / 7) + 1, 50)
  const baseXp = (daysSinceJoin * 15) % 1000

  return {
    strength: 40 + Math.floor(Math.random() * 30),
    endurance: 40 + Math.floor(Math.random() * 30),
    speed: 40 + Math.floor(Math.random() * 30),
    technique: 40 + Math.floor(Math.random() * 30),
    power: 40 + Math.floor(Math.random() * 30),
    level: baseLevel,
    xp: baseXp,
    xpToNextLevel: 1000,
    percentile: Math.min(40 + Math.floor(daysSinceJoin / 3), 99), // Plus ancien = meilleur percentile
    sessionCount: Math.floor(daysSinceJoin * 0.4),
    prCount: Math.floor(daysSinceJoin * 0.1)
  }
}

// Trouve la stat principale du membre
type StatKey = 'strength' | 'endurance' | 'speed' | 'technique' | 'power'

const getPrimaryStat = (stats: MemberStats): StatKey => {
  const statValues: { key: StatKey; value: number }[] = [
    { key: 'strength', value: stats.strength },
    { key: 'endurance', value: stats.endurance },
    { key: 'speed', value: stats.speed },
    { key: 'technique', value: stats.technique },
    { key: 'power', value: stats.power }
  ]
  statValues.sort((a, b) => b.value - a.value)
  return statValues[0].key
}

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

          // Generer stats et assigner personnage
          memberStats = generateMemberStats(linkedMember)
          const primaryStat = getPrimaryStat(memberStats)
          epicCharacter = assignCharacter(memberStats.percentile, primaryStat)
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

  setLinkedMember: (member) => {
    if (member) {
      const stats = generateMemberStats(member)
      const primaryStat = getPrimaryStat(stats)
      const character = assignCharacter(stats.percentile, primaryStat)
      set({
        linkedMember: member,
        memberStats: stats,
        epicCharacter: character
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
      const primaryStat = getPrimaryStat(memberStats)
      const character = assignCharacter(memberStats.percentile, primaryStat)
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
      // TODO: Appeler /api/portal/stats pour recuperer les vraies stats
      const stats = generateMemberStats(linkedMember)
      const primaryStat = getPrimaryStat(stats)
      const character = assignCharacter(stats.percentile, primaryStat)
      set({
        memberStats: stats,
        epicCharacter: character
      })
    } catch {
      // Ignore errors
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
          const stats = generateMemberStats(data.member)
          const primaryStat = getPrimaryStat(stats)
          const character = assignCharacter(stats.percentile, primaryStat)
          set({
            linkedMember: data.member,
            memberStats: stats,
            epicCharacter: character
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
