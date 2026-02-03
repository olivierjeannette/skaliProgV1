'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePokemonStore, useUIStore } from '@/store/member-store'
import { POKEMON_TYPES, EVOLUTION_STAGES } from '@/lib/utils/pokemon'
import { PokemonCard } from './PokemonCard'
import { CardPreviewModal } from './CardPreviewModal'
import { GlassCard, GlassInput, NoCards, NoSearchResults, LoadingSpinner } from '@/components/common'
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import type { PokemonType, EvolutionStage, CardSortOption } from '@/types'

// ============================================
// FILTER BUTTON
// ============================================

interface FilterButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
  color?: string
}

function FilterButton({ label, isActive, onClick, color }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
        isActive
          ? 'text-white shadow-lg'
          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
      )}
      style={isActive ? { backgroundColor: color || '#52c759' } : undefined}
    >
      {label}
    </button>
  )
}

// ============================================
// SORT DROPDOWN
// ============================================

const SORT_OPTIONS: { value: CardSortOption; label: string }[] = [
  { value: 'level-desc', label: 'Niveau (décroissant)' },
  { value: 'level-asc', label: 'Niveau (croissant)' },
  { value: 'name-asc', label: 'Nom (A-Z)' },
  { value: 'name-desc', label: 'Nom (Z-A)' },
  { value: 'recent', label: 'Plus récent' },
]

// ============================================
// MAIN COMPONENT
// ============================================

export function CardGallery() {
  const [showFilters, setShowFilters] = useState(false)

  const {
    filters,
    sortBy,
    isLoading,
    setFilters,
    setSortBy,
    getFilteredCards,
  } = usePokemonStore()

  const { openCardPreview } = useUIStore()

  const filteredCards = useMemo(() => getFilteredCards(), [
    filters,
    sortBy,
    getFilteredCards,
  ])

  // Type filters
  const typeOptions: { value: PokemonType | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'Tous', color: '#6b7280' },
    ...Object.entries(POKEMON_TYPES).map(([type, config]) => ({
      value: type as PokemonType,
      label: config.name,
      color: config.color,
    })),
  ]

  // Level filters
  const levelOptions: { value: EvolutionStage | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous niveaux' },
    ...Object.entries(EVOLUTION_STAGES).map(([stage, config]) => ({
      value: stage as EvolutionStage,
      label: config.label,
    })),
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" message="Chargement des cartes..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <GlassCard padding="sm" className="sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un athlète ou Pokémon..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full bg-glass-bg border border-glass-border rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-skali-accent/50"
            />
          </div>

          {/* Toggle Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              showFilters
                ? 'bg-skali-accent/20 text-skali-accent'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filtres</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CardSortOption)}
              className="appearance-none bg-gray-800/50 border border-glass-border rounded-lg px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-skali-accent/50 cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-glass-border space-y-4">
                {/* Type Filters */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map((option) => (
                      <FilterButton
                        key={option.value}
                        label={option.label}
                        isActive={filters.type === option.value}
                        onClick={() => setFilters({ type: option.value })}
                        color={option.color}
                      />
                    ))}
                  </div>
                </div>

                {/* Level Filters */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Niveau
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {levelOptions.map((option) => (
                      <FilterButton
                        key={option.value}
                        label={option.label}
                        isActive={filters.level === option.value}
                        onClick={() => setFilters({ level: option.value })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {filteredCards.length} carte{filteredCards.length !== 1 ? 's' : ''} trouvée{filteredCards.length !== 1 ? 's' : ''}
        </span>
        {(filters.type !== 'all' || filters.level !== 'all' || filters.search) && (
          <button
            onClick={() => setFilters({ type: 'all', level: 'all', search: '' })}
            className="text-skali-accent hover:underline"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        filters.search ? (
          <NoSearchResults query={filters.search} />
        ) : (
          <NoCards />
        )
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
        >
          {filteredCards.map((card) => (
            <motion.div
              key={card.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <PokemonCard
                card={card}
                variant="mini"
                onClick={() => openCardPreview(card)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Preview Modal */}
      <CardPreviewModal />
    </div>
  )
}
