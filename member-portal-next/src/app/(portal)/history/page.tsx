'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemberStore } from '@/store/member-store'
import {
  GlassCard,
  GlassButton,
  GlassInput,
  LoadingSpinner,
  EmptyState,
} from '@/components/common'
import {
  History,
  Calendar,
  Activity,
  Target,
  Camera,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Dumbbell,
  Heart,
  Zap,
  Trophy,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import * as queries from '@/lib/supabase/queries'
import type { Performance, Goal, MorphoAnalysis } from '@/types'

// Activity types
type ActivityType = 'all' | 'performance' | 'goal' | 'morpho'

interface ActivityItem {
  id: string
  type: 'performance' | 'goal' | 'morpho'
  date: string
  title: string
  description: string
  category?: string
  status?: string
  value?: number
  unit?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

// Category config
const CATEGORY_CONFIG = {
  cardio: { icon: Heart, color: 'text-red-400', bg: 'bg-red-500/20' },
  force: { icon: Dumbbell, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  gym: { icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  puissance: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/20' },
}

// Status config for goals
const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-gray-400', label: 'En attente' },
  in_progress: { icon: Activity, color: 'text-blue-400', label: 'En cours' },
  achieved: { icon: CheckCircle, color: 'text-green-400', label: 'Atteint' },
  failed: { icon: XCircle, color: 'text-red-400', label: 'Echoue' },
}

export default function HistoryPage() {
  const { currentMember, performances, goals, isLoadingPerformances, isLoadingGoals } = useMemberStore()

  const [morphoAnalyses, setMorphoAnalyses] = useState<MorphoAnalysis[]>([])
  const [isLoadingMorpho, setIsLoadingMorpho] = useState(true)

  const [filterType, setFilterType] = useState<ActivityType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Load morpho analyses
  useEffect(() => {
    async function loadMorphoAnalyses() {
      if (!currentMember) return

      setIsLoadingMorpho(true)
      try {
        const result = await queries.getMorphoAnalyses(currentMember.id)
        if (result.success && result.data) {
          setMorphoAnalyses(result.data)
        }
      } catch (error) {
        console.error('Error loading morpho analyses:', error)
      } finally {
        setIsLoadingMorpho(false)
      }
    }

    loadMorphoAnalyses()
  }, [currentMember])

  // Convert all activities to unified format
  const activities = useMemo(() => {
    const items: ActivityItem[] = []

    // Add performances
    performances.forEach((perf) => {
      const categoryConfig = CATEGORY_CONFIG[perf.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.gym
      items.push({
        id: `perf-${perf.id}`,
        type: 'performance',
        date: perf.date,
        title: perf.exercise_name,
        description: `${perf.value} ${perf.unit}`,
        category: perf.category,
        value: perf.value,
        unit: perf.unit,
        icon: categoryConfig.icon,
        color: categoryConfig.color,
      })
    })

    // Add goals
    goals.forEach((goal) => {
      const statusConfig = STATUS_CONFIG[goal.status] || STATUS_CONFIG.pending
      items.push({
        id: `goal-${goal.id}`,
        type: 'goal',
        date: goal.updated_at || goal.created_at,
        title: goal.exercise_name,
        description: `Objectif: ${goal.target_value} ${goal.unit} (${goal.progress_percentage}%)`,
        category: goal.category,
        status: goal.status,
        value: goal.target_value,
        unit: goal.unit,
        icon: Target,
        color: statusConfig.color,
      })
    })

    // Add morpho analyses
    morphoAnalyses.forEach((morpho) => {
      items.push({
        id: `morpho-${morpho.id}`,
        type: 'morpho',
        date: morpho.created_at,
        title: 'Analyse morphologique',
        description: morpho.ai_analysis ? morpho.ai_analysis.substring(0, 100) + '...' : 'Analyse effectuee',
        icon: Camera,
        color: 'text-cyan-400',
      })
    })

    return items
  }, [performances, goals, morphoAnalyses])

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = [...activities]

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.type === filterType)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
      )
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [activities, filterType, searchQuery, sortOrder])

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {}

    filteredActivities.forEach((item) => {
      const dateKey = new Date(item.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(item)
    })

    return groups
  }, [filteredActivities])

  // Toggle item expansion
  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Get type label
  const getTypeLabel = (type: ActivityType) => {
    switch (type) {
      case 'all':
        return 'Tout'
      case 'performance':
        return 'Performances'
      case 'goal':
        return 'Objectifs'
      case 'morpho':
        return 'Analyses'
      default:
        return type
    }
  }

  // Get type icon
  const getTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'performance':
        return Activity
      case 'goal':
        return Target
      case 'morpho':
        return Camera
      default:
        return History
    }
  }

  const isLoading = isLoadingPerformances || isLoadingGoals || isLoadingMorpho

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Chargement de l'historique..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Historique</h1>
        <p className="text-gray-400">
          Retrouvez toutes vos activites
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <GlassCard padding="sm" variant="hover">
          <div className="text-center">
            <Activity className="w-6 h-6 text-skali-green mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{performances.length}</p>
            <p className="text-xs text-gray-400">Performances</p>
          </div>
        </GlassCard>
        <GlassCard padding="sm" variant="hover">
          <div className="text-center">
            <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{goals.length}</p>
            <p className="text-xs text-gray-400">Objectifs</p>
          </div>
        </GlassCard>
        <GlassCard padding="sm" variant="hover">
          <div className="text-center">
            <Camera className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{morphoAnalyses.length}</p>
            <p className="text-xs text-gray-400">Analyses</p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard padding="sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <GlassInput
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              {(['all', 'performance', 'goal', 'morpho'] as ActivityType[]).map((type) => {
                const Icon = getTypeIcon(type)
                const isActive = filterType === type

                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      isActive
                        ? 'bg-skali-green/20 text-skali-green border border-skali-green/30'
                        : 'bg-glass-bg text-gray-400 border border-glass-border hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{getTypeLabel(type)}</span>
                  </button>
                )
              })}
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 px-3 py-2 bg-glass-bg border border-glass-border rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              {sortOrder === 'desc' ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {sortOrder === 'desc' ? 'Recent' : 'Ancien'}
              </span>
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Activities Timeline */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          icon={History}
          title="Aucune activite trouvee"
          description={
            searchQuery
              ? 'Aucun resultat pour votre recherche'
              : 'Commencez a enregistrer vos performances et objectifs'
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <AnimatePresence>
            {Object.entries(groupedActivities).map(([date, items], groupIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
              >
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-skali-green/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-skali-green" />
                  </div>
                  <h3 className="text-lg font-medium text-white capitalize">{date}</h3>
                  <span className="text-sm text-gray-500">({items.length})</span>
                </div>

                {/* Activities for this date */}
                <div className="space-y-3 ml-5 border-l-2 border-glass-border pl-8">
                  {items.map((item, itemIndex) => {
                    const Icon = item.icon
                    const isExpanded = expandedItems.has(item.id)

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndex * 0.02 }}
                      >
                        <GlassCard
                          padding="sm"
                          variant="hover"
                          className="relative cursor-pointer"
                          onClick={() => toggleExpand(item.id)}
                        >
                          {/* Timeline dot */}
                          <div
                            className={`absolute -left-[2.85rem] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${
                              item.type === 'performance'
                                ? 'bg-skali-green'
                                : item.type === 'goal'
                                ? 'bg-blue-500'
                                : 'bg-cyan-500'
                            }`}
                          />

                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  item.type === 'performance'
                                    ? 'bg-skali-green/20'
                                    : item.type === 'goal'
                                    ? 'bg-blue-500/20'
                                    : 'bg-cyan-500/20'
                                }`}
                              >
                                <Icon className={`w-5 h-5 ${item.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">
                                  {item.title}
                                </p>
                                <p className="text-sm text-gray-400 truncate">
                                  {item.description}
                                </p>
                                {item.category && (
                                  <span
                                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs capitalize ${
                                      CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG]?.bg ||
                                      'bg-gray-500/20'
                                    } ${
                                      CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG]?.color ||
                                      'text-gray-400'
                                    }`}
                                  >
                                    {item.category}
                                  </span>
                                )}
                                {item.status && (
                                  <span
                                    className={`inline-block mt-1 ml-2 px-2 py-0.5 rounded-full text-xs ${
                                      STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]?.color ||
                                      'text-gray-400'
                                    }`}
                                  >
                                    {STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]?.label ||
                                      item.status}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {new Date(item.date).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 pt-4 border-t border-glass-border">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-400">Type</p>
                                      <p className="text-white capitalize">{item.type}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400">Date</p>
                                      <p className="text-white">
                                        {new Date(item.date).toLocaleDateString('fr-FR')}
                                      </p>
                                    </div>
                                    {item.value !== undefined && (
                                      <div>
                                        <p className="text-gray-400">Valeur</p>
                                        <p className="text-white">
                                          {item.value} {item.unit}
                                        </p>
                                      </div>
                                    )}
                                    {item.category && (
                                      <div>
                                        <p className="text-gray-400">Categorie</p>
                                        <p className="text-white capitalize">{item.category}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </GlassCard>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Results count */}
      {filteredActivities.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-500"
        >
          {filteredActivities.length} activite{filteredActivities.length > 1 ? 's' : ''} trouvee
          {filteredActivities.length > 1 ? 's' : ''}
        </motion.p>
      )}
    </div>
  )
}
