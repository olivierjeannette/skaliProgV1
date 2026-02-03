import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Member,
  Performance,
  Goal,
  PokemonCard,
  AuthSession,
  NotificationState,
  CardFilters,
  CardSortOption,
} from '@/types'
import * as queries from '@/lib/supabase/queries'
import { generatePokemonCard, resetAssignedPokemon } from '@/lib/utils/pokemon'

// ============================================
// AUTH STORE
// ============================================

interface AuthState {
  session: AuthSession | null
  isLoading: boolean
  error: string | null

  // Actions
  setSession: (session: AuthSession | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,
      error: null,

      setSession: (session) => set({ session, error: null }),
      logout: () => set({ session: null }),
    }),
    {
      name: 'skali-auth',
      partialize: (state) => ({ session: state.session }),
    }
  )
)

// ============================================
// MEMBER STORE
// ============================================

interface MemberState {
  // Current member (logged in)
  currentMember: Member | null

  // All members (for gallery/comparison)
  members: Member[]

  // Current member's performances
  performances: Performance[]

  // Current member's goals
  goals: Goal[]

  // Loading states
  isLoadingMember: boolean
  isLoadingPerformances: boolean
  isLoadingGoals: boolean

  // Error states
  error: string | null

  // Actions
  setCurrentMember: (member: Member | null) => void
  loadMemberByDiscordId: (discordId: string) => Promise<void>
  loadAllMembers: () => Promise<void>
  loadPerformances: (memberId: string) => Promise<void>
  loadGoals: (memberId: string) => Promise<void>
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>
  addPerformance: (performance: Omit<Performance, 'id' | 'created_at'>) => Promise<void>
  addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  deletePerformance: (id: string) => Promise<void>
  clearError: () => void
}

export const useMemberStore = create<MemberState>()((set, get) => ({
  currentMember: null,
  members: [],
  performances: [],
  goals: [],
  isLoadingMember: false,
  isLoadingPerformances: false,
  isLoadingGoals: false,
  error: null,

  setCurrentMember: (member) => set({ currentMember: member }),

  loadMemberByDiscordId: async (discordId) => {
    set({ isLoadingMember: true, error: null })
    try {
      const result = await queries.getMemberByDiscordId(discordId)
      if (result.success && result.data) {
        set({ currentMember: result.data })
        // Auto-load performances and goals
        await Promise.all([
          get().loadPerformances(result.data.id),
          get().loadGoals(result.data.id),
        ])
      }
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoadingMember: false })
    }
  },

  loadAllMembers: async () => {
    set({ isLoadingMember: true, error: null })
    try {
      const result = await queries.getMembers()
      if (result.success && result.data) {
        set({ members: result.data })
      }
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoadingMember: false })
    }
  },

  loadPerformances: async (memberId) => {
    set({ isLoadingPerformances: true })
    try {
      const result = await queries.getMemberPerformances(memberId)
      if (result.success && result.data) {
        set({ performances: result.data })
      }
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoadingPerformances: false })
    }
  },

  loadGoals: async (memberId) => {
    set({ isLoadingGoals: true })
    try {
      const result = await queries.getMemberGoals(memberId)
      if (result.success && result.data) {
        set({ goals: result.data })
      }
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoadingGoals: false })
    }
  },

  updateMember: async (id, updates) => {
    try {
      const result = await queries.updateMember(id, updates)
      if (result.success && result.data) {
        set({ currentMember: result.data })
      }
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  addPerformance: async (performance) => {
    try {
      const result = await queries.createPerformance(performance)
      if (result.success && result.data) {
        set((state) => ({
          performances: [result.data!, ...state.performances],
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  addGoal: async (goal) => {
    try {
      const result = await queries.createGoal(goal)
      if (result.success && result.data) {
        set((state) => ({
          goals: [result.data!, ...state.goals],
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  updateGoal: async (id, updates) => {
    try {
      const result = await queries.updateGoal(id, updates)
      if (result.success && result.data) {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? result.data! : g)),
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  deleteGoal: async (id) => {
    try {
      const result = await queries.deleteGoal(id)
      if (result.success) {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  deletePerformance: async (id) => {
    try {
      const result = await queries.deletePerformance(id)
      if (result.success) {
        set((state) => ({
          performances: state.performances.filter((p) => p.id !== id),
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  clearError: () => set({ error: null }),
}))

// ============================================
// POKEMON CARDS STORE
// ============================================

interface PokemonState {
  // All generated cards
  cards: Map<string, PokemonCard>

  // Current member's card
  currentCard: PokemonCard | null

  // Gallery state
  filters: CardFilters
  sortBy: CardSortOption

  // Loading
  isLoading: boolean

  // Actions
  generateCards: (members: Member[], performancesMap: Map<string, Performance[]>) => void
  generateCurrentCard: (member: Member, performances: Performance[]) => void
  setFilters: (filters: Partial<CardFilters>) => void
  setSortBy: (sort: CardSortOption) => void
  getFilteredCards: () => PokemonCard[]
  resetCards: () => void
}

export const usePokemonStore = create<PokemonState>()((set, get) => ({
  cards: new Map(),
  currentCard: null,
  filters: {
    type: 'all',
    level: 'all',
    search: '',
  },
  sortBy: 'level-desc',
  isLoading: false,

  generateCards: (members, performancesMap) => {
    set({ isLoading: true })
    resetAssignedPokemon()

    const cards = new Map<string, PokemonCard>()

    for (const member of members) {
      const performances = performancesMap.get(member.id) || []
      const card = generatePokemonCard(member, performances)
      cards.set(member.id, card)
    }

    set({ cards, isLoading: false })
  },

  generateCurrentCard: (member, performances) => {
    const card = generatePokemonCard(member, performances)
    set({ currentCard: card })
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  setSortBy: (sortBy) => set({ sortBy }),

  getFilteredCards: () => {
    const { cards, filters, sortBy } = get()
    let result = Array.from(cards.values())

    // Filter by type
    if (filters.type !== 'all') {
      result = result.filter((card) => card.type === filters.type)
    }

    // Filter by level/evolution
    if (filters.level !== 'all') {
      result = result.filter((card) => card.evolution_stage === filters.level)
    }

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(
        (card) =>
          card.member_name.toLowerCase().includes(search) ||
          card.pokemon_name.toLowerCase().includes(search)
      )
    }

    // Sort
    switch (sortBy) {
      case 'level-desc':
        result.sort((a, b) => b.level - a.level)
        break
      case 'level-asc':
        result.sort((a, b) => a.level - b.level)
        break
      case 'name-asc':
        result.sort((a, b) => a.member_name.localeCompare(b.member_name))
        break
      case 'name-desc':
        result.sort((a, b) => b.member_name.localeCompare(a.member_name))
        break
      case 'recent':
        result.sort((a, b) =>
          new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()
        )
        break
    }

    return result
  },

  resetCards: () => {
    resetAssignedPokemon()
    set({ cards: new Map(), currentCard: null })
  },
}))

// ============================================
// UI STORE (Notifications, Modals, etc.)
// ============================================

interface UIState {
  // Notifications
  notifications: NotificationState[]

  // Current view
  activeSection: 'home' | 'data-entry' | 'gallery' | 'goals' | 'morpho' | 'performances'

  // Mobile menu
  isMobileMenuOpen: boolean

  // Modal states
  isCardPreviewOpen: boolean
  previewCard: PokemonCard | null

  // Actions
  addNotification: (notification: Omit<NotificationState, 'id'>) => void
  removeNotification: (id: string) => void
  setActiveSection: (section: UIState['activeSection']) => void
  toggleMobileMenu: () => void
  openCardPreview: (card: PokemonCard) => void
  closeCardPreview: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  notifications: [],
  activeSection: 'home',
  isMobileMenuOpen: false,
  isCardPreviewOpen: false,
  previewCard: null,

  addNotification: (notification) => {
    const id = `notif-${Date.now()}`
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }))

    // Auto-remove after duration
    const duration = notification.duration || 3000
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    }, duration)
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  setActiveSection: (activeSection) => set({ activeSection }),

  toggleMobileMenu: () => {
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }))
  },

  openCardPreview: (card) => {
    set({ isCardPreviewOpen: true, previewCard: card })
  },

  closeCardPreview: () => {
    set({ isCardPreviewOpen: false, previewCard: null })
  },
}))
