'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useMemberStore, useUIStore } from '@/store/member-store'
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassSelect,
  LoadingSpinner,
  NoPerformances,
} from '@/components/common'
import { cn, formatDate, groupBy } from '@/lib/utils'
import type { Performance, PerformanceCategory } from '@/types'
import {
  BarChart3,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Dumbbell,
  Heart,
  Zap,
  Target,
  Filter,
  X,
  Trash2,
} from 'lucide-react'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// ============================================
// CONSTANTS
// ============================================

const CATEGORY_CONFIG: Record<PerformanceCategory, { label: string; icon: typeof Heart; color: string; bgColor: string }> = {
  cardio: { label: 'Cardio', icon: Heart, color: '#ef4444', bgColor: 'bg-red-500/20' },
  force: { label: 'Force', icon: Dumbbell, color: '#3b82f6', bgColor: 'bg-blue-500/20' },
  gym: { label: 'Gym', icon: Target, color: '#22c55e', bgColor: 'bg-green-500/20' },
  puissance: { label: 'Puissance', icon: Zap, color: '#f59e0b', bgColor: 'bg-amber-500/20' },
}

const EXERCISE_PRESETS: Record<PerformanceCategory, { name: string; unit: string }[]> = {
  cardio: [
    { name: 'VO2 Max', unit: 'ml/kg/min' },
    { name: 'VMA', unit: 'km/h' },
    { name: 'FC repos', unit: 'bpm' },
    { name: '5km', unit: 'min' },
    { name: '10km', unit: 'min' },
  ],
  force: [
    { name: 'Squat', unit: 'kg' },
    { name: 'Deadlift', unit: 'kg' },
    { name: 'Bench Press', unit: 'kg' },
    { name: 'Pull-ups', unit: 'reps' },
  ],
  gym: [
    { name: 'Leg Press', unit: 'kg' },
    { name: 'Lat Pulldown', unit: 'kg' },
    { name: 'Shoulder Press', unit: 'kg' },
  ],
  puissance: [
    { name: 'Puissance max', unit: 'watts' },
    { name: 'Saut vertical', unit: 'cm' },
    { name: 'Sprint 100m', unit: 'sec' },
  ],
}

// ============================================
// PERFORMANCE CHART
// ============================================

interface PerformanceChartProps {
  performances: Performance[]
  exerciseName: string
}

function PerformanceChart({ performances, exerciseName }: PerformanceChartProps) {
  const sortedPerfs = [...performances]
    .filter((p) => p.exercise_name === exerciseName)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (sortedPerfs.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        Pas assez de données pour afficher un graphique
      </div>
    )
  }

  const data = {
    labels: sortedPerfs.map((p) => formatDate(p.date)),
    datasets: [
      {
        label: exerciseName,
        data: sortedPerfs.map((p) => p.value),
        borderColor: '#52c759',
        backgroundColor: 'rgba(82, 199, 89, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#52c759',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            const perf = sortedPerfs[context.dataIndex]
            return `${context.raw} ${perf.unit}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10,
          },
        },
      },
    },
  }

  return (
    <div className="h-48">
      <Line data={data} options={options} />
    </div>
  )
}

// ============================================
// ADD PERFORMANCE MODAL
// ============================================

interface PerformanceFormData {
  exercise_name: string
  value: string
  unit: string
  category: PerformanceCategory | ''
  date: string
  notes: string
}

interface AddPerformanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: PerformanceFormData) => void
  isSaving: boolean
}

function AddPerformanceModal({ isOpen, onClose, onSave, isSaving }: AddPerformanceModalProps) {
  const [formData, setFormData] = useState<PerformanceFormData>({
    exercise_name: '',
    value: '',
    unit: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const [errors, setErrors] = useState<Partial<PerformanceFormData>>({})

  const handleCategoryChange = (category: PerformanceCategory | '') => {
    setFormData((prev) => ({ ...prev, category, exercise_name: '', unit: '' }))
  }

  const handleExercisePreset = (preset: { name: string; unit: string }) => {
    setFormData((prev) => ({ ...prev, exercise_name: preset.name, unit: preset.unit }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<PerformanceFormData> = {}

    if (!formData.exercise_name.trim()) newErrors.exercise_name = 'Exercice requis'
    if (!formData.value || parseFloat(formData.value) <= 0) newErrors.value = 'Valeur invalide'
    if (!formData.unit.trim()) newErrors.unit = 'Unité requise'
    if (!formData.category) newErrors.category = 'Catégorie requise'
    if (!formData.date) newErrors.date = 'Date requise'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  if (!isOpen) return null

  const exercisePresets = formData.category ? EXERCISE_PRESETS[formData.category as PerformanceCategory] : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg"
      >
        <GlassCard padding="lg" className="border border-glass-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Nouvelle Performance</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassSelect
              label="Catégorie *"
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value as PerformanceCategory | '')}
              options={[
                { value: '', label: 'Sélectionner une catégorie' },
                ...Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
                  value: key,
                  label: config.label,
                })),
              ]}
              error={errors.category}
            />

            {exercisePresets.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Exercices suggérés
                </label>
                <div className="flex flex-wrap gap-2">
                  {exercisePresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleExercisePreset(preset)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        formData.exercise_name === preset.name
                          ? 'bg-skali-accent text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                      )}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <GlassInput
              label="Exercice / Métrique *"
              value={formData.exercise_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, exercise_name: e.target.value }))}
              placeholder="Ex: Squat, VO2 Max..."
              error={errors.exercise_name}
            />

            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Valeur *"
                type="number"
                step="0.1"
                value={formData.value}
                onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                placeholder="100"
                error={errors.value}
              />

              <GlassInput
                label="Unité *"
                value={formData.unit}
                onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                placeholder="kg, min, bpm..."
                error={errors.unit}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-skali-accent/50"
              />
              {errors.date && <p className="text-sm text-red-400">{errors.date}</p>}
            </div>

            <GlassInput
              label="Notes (optionnel)"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Conditions, ressenti..."
            />

            <div className="flex gap-3 pt-4">
              <GlassButton type="button" variant="ghost" onClick={onClose} className="flex-1">
                Annuler
              </GlassButton>
              <GlassButton type="submit" variant="primary" loading={isSaving} className="flex-1">
                Enregistrer
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  )
}

// ============================================
// PERFORMANCE CARD
// ============================================

interface PerformanceCardProps {
  performance: Performance
  previousValue?: number
  onDelete: () => void
}

function PerformanceCard({ performance, previousValue, onDelete }: PerformanceCardProps) {
  const categoryConfig = performance.category
    ? CATEGORY_CONFIG[performance.category]
    : { label: 'Autre', icon: Target, color: '#6b7280', bgColor: 'bg-gray-500/20' }

  const Icon = categoryConfig.icon

  const trend = previousValue
    ? performance.value > previousValue
      ? 'up'
      : performance.value < previousValue
      ? 'down'
      : 'same'
    : null

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors group">
        <div
          className={cn('w-10 h-10 rounded-xl flex items-center justify-center', categoryConfig.bgColor)}
        >
          <Icon className="w-5 h-5" style={{ color: categoryConfig.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-white truncate">{performance.exercise_name}</h4>
            {trend && (
              <TrendIcon
                className={cn(
                  'w-4 h-4',
                  trend === 'up' && 'text-green-400',
                  trend === 'down' && 'text-red-400',
                  trend === 'same' && 'text-gray-400'
                )}
              />
            )}
          </div>
          <p className="text-sm text-gray-400">
            {formatDate(performance.date)}
            {performance.notes && <span className="ml-2">• {performance.notes}</span>}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-skali-accent">
            {performance.value} <span className="text-sm text-gray-400">{performance.unit}</span>
          </p>
          {previousValue && (
            <p className="text-xs text-gray-500">
              Précédent: {previousValue} {performance.unit}
            </p>
          )}
        </div>

        <button
          onClick={onDelete}
          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </motion.div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function PerformancesPage() {
  const { currentMember, performances, isLoadingPerformances, addPerformance } = useMemberStore()
  const { addNotification } = useUIStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedExercise, setSelectedExercise] = useState<string>('')

  // Get unique exercises
  const uniqueExercises = useMemo(() => {
    const exercises = new Set<string>()
    performances.forEach((p) => exercises.add(p.exercise_name))
    return Array.from(exercises).sort()
  }, [performances])

  // Set default selected exercise
  useEffect(() => {
    if (uniqueExercises.length > 0 && !selectedExercise) {
      setSelectedExercise(uniqueExercises[0])
    }
  }, [uniqueExercises, selectedExercise])

  // Filter performances
  const filteredPerformances = useMemo(() => {
    return performances.filter((p) => {
      if (filterCategory !== 'all' && p.category !== filterCategory) return false
      return true
    })
  }, [performances, filterCategory])

  // Group by exercise for previous value comparison
  const performancesByExercise = useMemo(() => {
    return groupBy(
      [...performances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      'exercise_name'
    )
  }, [performances])

  // Stats
  const stats = useMemo(() => {
    const total = performances.length
    const thisMonth = performances.filter((p) => {
      const date = new Date(p.date)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length

    const categories = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      ...config,
      category: key as PerformanceCategory,
      count: performances.filter((p) => p.category === key).length,
    }))

    return { total, thisMonth, categories }
  }, [performances])

  const handleSavePerformance = async (formData: PerformanceFormData) => {
    if (!currentMember) return

    setIsSaving(true)

    try {
      await addPerformance({
        member_id: currentMember.id,
        exercise_name: formData.exercise_name.trim(),
        value: parseFloat(formData.value),
        unit: formData.unit.trim(),
        category: formData.category as PerformanceCategory,
        date: formData.date,
        notes: formData.notes.trim() || undefined,
      })

      addNotification({ type: 'success', message: 'Performance enregistrée !' })
      setIsModalOpen(false)
    } catch (error) {
      addNotification({ type: 'error', message: 'Erreur lors de l\'enregistrement' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePerformance = async (perfId: string) => {
    if (!confirm('Supprimer cette performance ?')) return

    // Note: deletePerformance not in store yet, would need to add
    addNotification({ type: 'info', message: 'Fonction de suppression à implémenter' })
  }

  if (isLoadingPerformances) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Chargement des performances..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Mes Performances</h1>
          <p className="text-gray-400">Suivez l'évolution de vos performances</p>
        </div>

        <GlassButton variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Nouvelle performance
        </GlassButton>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <GlassCard padding="md" className="text-center">
          <BarChart3 className="w-6 h-6 text-skali-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </GlassCard>

        <GlassCard padding="md" className="text-center">
          <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-400">{stats.thisMonth}</p>
          <p className="text-xs text-gray-400">Ce mois</p>
        </GlassCard>

        <GlassCard padding="md" className="text-center">
          <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-400">{uniqueExercises.length}</p>
          <p className="text-xs text-gray-400">Exercices</p>
        </GlassCard>

        <GlassCard padding="md" className="text-center">
          <Target className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-400">
            {stats.categories.filter((c) => c.count > 0).length}
          </p>
          <p className="text-xs text-gray-400">Catégories</p>
        </GlassCard>
      </motion.div>

      {performances.length === 0 ? (
        <NoPerformances />
      ) : (
        <>
          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-skali-accent" />
                  Évolution
                </h2>

                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="bg-gray-800/50 border border-glass-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-skali-accent/50"
                >
                  {uniqueExercises.map((exercise) => (
                    <option key={exercise} value={exercise} className="bg-gray-800">
                      {exercise}
                    </option>
                  ))}
                </select>
              </div>

              {selectedExercise && (
                <PerformanceChart performances={performances} exerciseName={selectedExercise} />
              )}
            </GlassCard>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard padding="sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Catégorie:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      filterCategory === 'all'
                        ? 'bg-skali-accent text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    )}
                  >
                    Tous
                  </button>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setFilterCategory(key)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        filterCategory === key
                          ? 'text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                      )}
                      style={filterCategory === key ? { backgroundColor: config.color } : undefined}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Performance List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-skali-accent" />
                Historique
                <span className="text-sm font-normal text-gray-400">
                  ({filteredPerformances.length} entrée{filteredPerformances.length !== 1 ? 's' : ''})
                </span>
              </h2>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                  {filteredPerformances
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((perf, index) => {
                      const exercisePerfs = performancesByExercise[perf.exercise_name] || []
                      const currentIndex = exercisePerfs.findIndex((p) => p.id === perf.id)
                      const previousValue =
                        currentIndex < exercisePerfs.length - 1
                          ? exercisePerfs[currentIndex + 1]?.value
                          : undefined

                      return (
                        <PerformanceCard
                          key={perf.id}
                          performance={perf}
                          previousValue={previousValue}
                          onDelete={() => handleDeletePerformance(perf.id)}
                        />
                      )
                    })}
                </AnimatePresence>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AddPerformanceModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSavePerformance}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
