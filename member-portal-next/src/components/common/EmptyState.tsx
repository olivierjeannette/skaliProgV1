'use client'

import { cn } from '@/lib/utils'
import {
  FileQuestion,
  Search,
  Target,
  Trophy,
  Camera,
  Dumbbell,
  BarChart3,
  type LucideIcon
} from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  iconName?: 'search' | 'performance' | 'goal' | 'trophy' | 'camera' | 'workout' | 'chart'
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const iconMap: Record<string, LucideIcon> = {
  search: Search,
  performance: Dumbbell,
  goal: Target,
  trophy: Trophy,
  camera: Camera,
  workout: Dumbbell,
  chart: BarChart3,
}

export function EmptyState({
  icon,
  iconName,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const IconComponent = icon || (iconName ? iconMap[iconName] : FileQuestion)

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
        <IconComponent className="w-8 h-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

      {description && (
        <p className="text-gray-400 text-sm max-w-sm mb-4">{description}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-skali-accent/20 hover:bg-skali-accent/30 text-skali-accent rounded-lg transition-colors text-sm font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// Preset empty states for common use cases
export function NoPerformances() {
  return (
    <EmptyState
      iconName="performance"
      title="Aucune performance enregistrée"
      description="Commencez à enregistrer vos performances pour générer votre carte Pokémon."
    />
  )
}

export function NoGoals() {
  return (
    <EmptyState
      iconName="goal"
      title="Aucun objectif défini"
      description="Définissez vos objectifs d'entraînement pour suivre votre progression."
    />
  )
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      iconName="search"
      title="Aucun résultat"
      description={`Aucun résultat trouvé pour "${query}". Essayez une autre recherche.`}
    />
  )
}

export function NoCards() {
  return (
    <EmptyState
      iconName="trophy"
      title="Aucune carte disponible"
      description="Les cartes Pokémon seront générées une fois les performances enregistrées."
    />
  )
}
