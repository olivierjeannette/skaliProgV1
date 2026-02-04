import { create } from 'zustand'

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
}

interface PokemonStats {
  atk: number // Force
  def: number // Endurance
  spd: number // Vitesse/Cardio
  end: number // Puissance
  tec: number // Technique/Gym
  level: number
  xp: number
  type: string
  rarity: string
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
  pokemonStats: PokemonStats | null
  isLoading: boolean
  error: string | null

  // Actions
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  setLinkedMember: (member: LinkedMember | null) => void
  setPokemonStats: (stats: PokemonStats | null) => void
  linkMemberToDiscord: (memberId: string) => Promise<boolean>
}

// Génère les stats Pokemon basées sur les performances du membre (depuis l'API)
const generatePokemonStats = (member: LinkedMember): PokemonStats => {
  // TODO: Récupérer les vraies stats depuis l'API /api/portal/stats
  // Pour l'instant, valeurs par défaut
  return {
    atk: 50,
    def: 50,
    spd: 50,
    end: 50,
    tec: 50,
    level: 1,
    xp: 0,
    type: 'Débutant',
    rarity: 'Commun'
  }
}

export const usePortalStore = create<PortalStore>((set) => ({
  currentUser: null,
  linkedMember: null,
  pokemonStats: null,
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
      pokemonStats: null,
      error: null
    })
  },

  checkSession: async () => {
    set({ isLoading: true })

    try {
      // Check OAuth session from API
      const response = await fetch('/api/auth/session')
      const data = await response.json()

      if (data.session) {
        const session: PortalSession = data.session

        const user: PortalUser = {
          discordId: session.discord_id,
          username: session.discord_username,
          avatar: session.discord_avatar
        }

        // Convert member format if exists
        let linkedMember: LinkedMember | null = null
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
        }

        set({
          currentUser: user,
          linkedMember,
          pokemonStats: linkedMember ? generatePokemonStats(linkedMember) : null,
          isLoading: false
        })
        return
      }

      // No OAuth session, user not logged in
      set({
        currentUser: null,
        linkedMember: null,
        pokemonStats: null,
        isLoading: false
      })
    } catch {
      set({ isLoading: false })
    }
  },

  setLinkedMember: (member) => {
    if (member) {
      const stats = generatePokemonStats(member)
      set({ linkedMember: member, pokemonStats: stats })
    } else {
      set({ linkedMember: null, pokemonStats: null })
    }
  },

  setPokemonStats: (stats) => set({ pokemonStats: stats }),

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
          const stats = generatePokemonStats(data.member)
          set({
            linkedMember: data.member,
            pokemonStats: stats
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

// Recherche de membres via l'API (plus de mocks)
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
