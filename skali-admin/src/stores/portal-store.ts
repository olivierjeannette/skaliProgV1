import { create } from 'zustand'

interface PortalUser {
  discordId: string
  username: string
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

interface PortalStore {
  currentUser: PortalUser | null
  linkedMember: LinkedMember | null
  pokemonStats: PokemonStats | null
  isLoading: boolean
  error: string | null

  // Actions
  login: (discordId: string) => Promise<boolean>
  logout: () => void
  checkSession: () => void
  setLinkedMember: (member: LinkedMember | null) => void
  setPokemonStats: (stats: PokemonStats | null) => void
  linkMemberToDiscord: (memberId: string, discordId: string, username: string) => Promise<boolean>
}

// Mock données pour la démo
const mockMembers: LinkedMember[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@example.com',
    phone: '0612345678',
    gender: 'M',
    birthDate: '1990-05-15',
    weight: 80,
    height: 180,
    discord_id: '123456789012345678',
    discord_username: 'JeanD',
    status: 'active',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    name: 'Marie Martin',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie@example.com',
    phone: '0687654321',
    gender: 'F',
    birthDate: '1995-08-22',
    weight: 60,
    height: 165,
    status: 'active',
    created_at: '2024-02-01'
  },
  {
    id: '3',
    name: 'Pierre Bernard',
    firstName: 'Pierre',
    lastName: 'Bernard',
    email: 'pierre@example.com',
    gender: 'M',
    weight: 85,
    height: 175,
    status: 'active',
    created_at: '2024-03-10'
  }
]

// Simuler les stats Pokémon basées sur le membre
const generatePokemonStats = (member: LinkedMember): PokemonStats => {
  // Calcul basé sur des performances fictives
  const baseLevel = Math.floor(Math.random() * 30) + 20
  return {
    atk: Math.floor(Math.random() * 40) + 60, // 60-100
    def: Math.floor(Math.random() * 40) + 60,
    spd: Math.floor(Math.random() * 40) + 60,
    end: Math.floor(Math.random() * 40) + 60,
    tec: Math.floor(Math.random() * 40) + 60,
    level: baseLevel,
    xp: Math.floor(Math.random() * 1000),
    type: ['Force', 'Cardio', 'Hybrid', 'Endurance', 'Technique'][Math.floor(Math.random() * 5)],
    rarity: baseLevel > 40 ? 'Rare' : baseLevel > 25 ? 'Peu Commun' : 'Commun'
  }
}

export const usePortalStore = create<PortalStore>((set, get) => ({
  currentUser: null,
  linkedMember: null,
  pokemonStats: null,
  isLoading: true,
  error: null,

  login: async (discordId: string) => {
    set({ isLoading: true, error: null })

    try {
      // Simuler vérification Discord (dans la vraie app: vérifier via API Discord)
      if (!/^[0-9]{17,19}$/.test(discordId)) {
        set({ error: 'Discord ID invalide (17-19 chiffres)', isLoading: false })
        return false
      }

      // Chercher si ce Discord ID est déjà lié
      const linkedMember = mockMembers.find(m => m.discord_id === discordId)

      if (linkedMember) {
        // Discord déjà lié -> connexion directe
        const user: PortalUser = {
          discordId,
          username: linkedMember.discord_username || `User${discordId.slice(-4)}`
        }

        const stats = generatePokemonStats(linkedMember)

        set({
          currentUser: user,
          linkedMember,
          pokemonStats: stats,
          isLoading: false
        })

        // Sauvegarder session (sessionStorage pour éviter multi-users)
        sessionStorage.setItem('portal_session', JSON.stringify({ discordId, username: user.username }))

        return true
      }

      // Discord non lié -> demander liaison
      const user: PortalUser = {
        discordId,
        username: `User${discordId.slice(-4)}`
      }

      set({
        currentUser: user,
        linkedMember: null,
        pokemonStats: null,
        isLoading: false
      })

      sessionStorage.setItem('portal_session', JSON.stringify({ discordId, username: user.username }))

      return true
    } catch (error) {
      set({ error: 'Erreur de connexion', isLoading: false })
      return false
    }
  },

  logout: () => {
    sessionStorage.removeItem('portal_session')
    set({
      currentUser: null,
      linkedMember: null,
      pokemonStats: null,
      error: null
    })
  },

  checkSession: () => {
    const saved = sessionStorage.getItem('portal_session')
    if (saved) {
      try {
        const { discordId, username } = JSON.parse(saved)
        const linkedMember = mockMembers.find(m => m.discord_id === discordId)

        set({
          currentUser: { discordId, username },
          linkedMember: linkedMember || null,
          pokemonStats: linkedMember ? generatePokemonStats(linkedMember) : null,
          isLoading: false
        })
      } catch {
        set({ isLoading: false })
      }
    } else {
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

  linkMemberToDiscord: async (memberId, discordId, username) => {
    // Simuler la liaison (dans la vraie app: update Supabase)
    const member = mockMembers.find(m => m.id === memberId)

    if (member) {
      member.discord_id = discordId
      member.discord_username = username

      const stats = generatePokemonStats(member)

      set({
        linkedMember: member,
        pokemonStats: stats
      })

      return true
    }

    return false
  }
}))

// Export des mock members pour la recherche
export const searchMembers = (query: string): LinkedMember[] => {
  const searchLower = query.toLowerCase()
  return mockMembers.filter(m =>
    m.name.toLowerCase().includes(searchLower) ||
    m.firstName?.toLowerCase().includes(searchLower) ||
    m.lastName?.toLowerCase().includes(searchLower)
  )
}

export const getMemberById = (id: string): LinkedMember | undefined => {
  return mockMembers.find(m => m.id === id)
}
