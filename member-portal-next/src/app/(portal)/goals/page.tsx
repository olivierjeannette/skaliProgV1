'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemberStore, useUIStore } from '@/store/member-store'
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassSelect,
  LoadingSpinner,
  NoGoals,
} from '@/components/common'
import { cn } from '@/lib/utils'
import type { Goal, PerformanceCategory } from '@/types'
import {
  Target,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle,
  Trophy,
  TrendingUp,
  Dumbbell,
  Heart,
  Zap,
  Calendar,
  X,
  Filter,
} from 'lucide-react'

// ============================================
// CONSTANTS
// ============================================

const CATEGORY_OPTIONS = [
  { value: 'cardio', label: 'Cardio', icon: Heart, color: '#ef4444' },
  { value: 'force', label: 'Force', icon: Dumbbell, color: '#3b82f6' },
  { value: 'gym', label: 'Gym', icon: Target, color: '#22c55e' },
  { value: 'puissance', label: 'Puissance', icon: Zap, color: '#f59e0b' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'achieved', label: 'Atteint' },
  { value: 'failed', label: 'Échoué' },
]

const EXERCISE_PRESETS: Record<PerformanceCategory, { name: string; unit: string }[]> = {
  cardio: [
    { name: 'VO2 Max', unit: 'ml/kg/min' },
    { name: 'VMA', unit: 'km/h' },
    { name: '5km', unit: 'min' },
    { name: '10km', unit: 'min' },
    { name: 'Semi-marathon', unit: 'min' },
    { name: 'Marathon', unit: 'min' },
    { name: 'FC repos', unit: 'bpm' },
  ],
  force: [
    { name: 'Squat', unit: 'kg' },
    { name: 'Deadlift', unit: 'kg' },
    { name: 'Bench Press', unit: 'kg' },
    { name: 'Overhead Press', unit: 'kg' },
    { name: 'Rowing', unit: 'kg' },
    { name: 'Pull-ups', unit: 'reps' },
    { name: 'Dips', unit: 'reps' },
  ],
  gym: [
    { name: 'Curl biceps', unit: 'kg' },
    { name: 'Extension triceps', unit: 'kg' },
    { name: 'Leg press', unit: 'kg' },
    { name: 'Leg curl', unit: 'kg' },
    { name: 'Shoulder press', unit: 'kg' },
    { name: 'Lat pulldown', unit: 'kg' },
  ],
  puissance: [
    { name: 'Puissance max vélo', unit: 'watts' },
    { name: 'Saut vertical', unit: 'cm' },
    { name: 'Sprint 100m', unit: 'sec' },
    { name: 'Clean & Jerk', unit: 'kg' },
    { name: 'Snatch', unit: 'kg' },
    { name: 'Box Jump', unit: 'cm' },
  ],
}

// ============================================
// GOAL CARD COMPONENT
// ============================================

interface GoalCardProps {
  goal: Goal
  onEdit: () => void
  onDelete: () => void
}

function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const categoryConfig = CATEGORY_OPTIONS.find((c) => c.value === goal.category)
  const Icon = categoryConfig?.icon || Target

  const getStatusConfig = (status: Goal['status']) => {
    switch (status) {
      case 'achieved':
        return { label: 'Atteint', color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle }
      case 'in_progress':
        return { label: 'En cours', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: TrendingUp }
      case 'failed':
        return { label: 'Échoué', color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertCircle }
      default:
        return { label: 'En attente', color: 'text-gray-400', bg: 'bg-gray-500/20', icon: Clock }
    }
  }

  const statusConfig = getStatusConfig(goal.status)
  const StatusIcon = statusConfig.icon

  const progressPercentage = Math.min(goal.progress_percentage || 0, 100)
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.status !== 'achieved'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard variant="hover" className="relative overflow-hidden">
        {/* Category color indicator */}
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: categoryConfig?.color }}
        />

        <div className="pl-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${categoryConfig?.color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: categoryConfig?.color }} />
              </div>
              <div>
                <h3 className="font-bold text-white">{goal.exercise_name}</h3>
                <p className="text-sm text-gray-400 capitalize">{goal.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          {/* Target & Progress */}
          <div className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-sm text-gray-400">Objectif</p>
                <p className="text-2xl font-bold text-white">
                  {goal.target_value} <span className="text-sm text-gray-400">{goal.unit}</span>
                </p>
              </div>
              {goal.current_value !== undefined && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Actuel</p>
                  <p className="text-lg font-bold text-skali-accent">
                    {goal.current_value} {goal.unit}
                  </p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
                className={cn(
                  'h-full rounded-full',
                  goal.status === 'achieved' ? 'bg-green-500' : 'bg-skali-accent'
                )}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{progressPercentage}% complété</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-glass-border">
            <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full', statusConfig.bg)}>
              <StatusIcon className={cn('w-3 h-3', statusConfig.color)} />
              <span className={cn('text-xs font-medium', statusConfig.color)}>
                {statusConfig.label}
              </span>
            </div>

            {goal.deadline && (
              <div className={cn('flex items-center gap-1 text-xs', isOverdue ? 'text-red-400' : 'text-gray-400')}>
                <Calendar className="w-3 h-3" />
                {new Date(goal.deadline).toLocaleDateString('fr-FR')}
                {isOverdue && <span className="ml-1">(dépassé)</span>}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// ============================================
// ADD/EDIT GOAL MODAL
// ============================================

interface GoalFormData {
  exercise_name: string
  target_value: string
  current_value: string
  unit: string
  category: PerformanceCategory | ''
  deadline: string
}

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: GoalFormData) => void
  initialData?: Goal
  isSaving: boolean
}

function GoalModal({ isOpen, onClose, onSave, initialData, isSaving }: GoalModalProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    exercise_name: initialData?.exercise_name || '',
    target_value: initialData?.target_value?.toString() || '',
    current_value: initialData?.current_value?.toString() || '',
    unit: initialData?.unit || '',
    category: initialData?.category || '',
    deadline: initialData?.deadline || '',
  })

  const [errors, setErrors] = useState<Partial<GoalFormData>>({})

  const handleCategoryChange = (category: PerformanceCategory | '') => {
    setFormData((prev) => ({ ...prev, category, exercise_name: '', unit: '' }))
  }

  const handleExercisePreset = (preset: { name: string; unit: string }) => {
    setFormData((prev) => ({ ...prev, exercise_name: preset.name, unit: preset.unit }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<GoalFormData> = {}

    if (!formData.exercise_name.trim()) {
      newErrors.exercise_name = 'Exercice requis'
    }
    if (!formData.target_value || parseFloat(formData.target_value) <= 0) {
      newErrors.target_value = 'Valeur cible invalide'
    }
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unité requise'
    }
    if (!formData.category) {
      newErrors.category = 'Catégorie requise'
    }

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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {initialData ? 'Modifier l\'objectif' : 'Nouvel objectif'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <GlassSelect
              label="Catégorie *"
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value as PerformanceCategory | '')}
              options={[
                { value: '', label: 'Sélectionner une catégorie' },
                ...CATEGORY_OPTIONS.map((c) => ({ value: c.value, label: c.label })),
              ]}
              error={errors.category}
            />

            {/* Exercise presets */}
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

            {/* Exercise name */}
            <GlassInput
              label="Exercice / Métrique *"
              value={formData.exercise_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, exercise_name: e.target.value }))}
              placeholder="Ex: Squat, VO2 Max, 10km..."
              error={errors.exercise_name}
            />

            {/* Target & Unit */}
            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Objectif *"
                type="number"
                step="0.1"
                value={formData.target_value}
                onChange={(e) => setFormData((prev) => ({ ...prev, target_value: e.target.value }))}
                placeholder="100"
                error={errors.target_value}
              />

              <GlassInput
                label="Unité *"
                value={formData.unit}
                onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                placeholder="kg, min, km/h..."
                error={errors.unit}
              />
            </div>

            {/* Current value */}
            <GlassInput
              label="Valeur actuelle (optionnel)"
              type="number"
              step="0.1"
              value={formData.current_value}
              onChange={(e) => setFormData((prev) => ({ ...prev, current_value: e.target.value }))}
              placeholder="Votre valeur actuelle"
            />

            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">
                Date limite (optionnel)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                className="w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-skali-accent/50"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <GlassButton type="button" variant="ghost" onClick={onClose} className="flex-1">
                Annuler
              </GlassButton>
              <GlassButton type="submit" variant="primary" loading={isSaving} className="flex-1">
                {initialData ? 'Mettre à jour' : 'Créer l\'objectif'}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function GoalsPage() {
  const { currentMember, goals, isLoadingGoals, addGoal, updateGoal, deleteGoal } = useMemberStore()
  const { addNotification } = useUIStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Filter goals
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      if (filterStatus !== 'all' && goal.status !== filterStatus) return false
      if (filterCategory !== 'all' && goal.category !== filterCategory) return false
      return true
    })
  }, [goals, filterStatus, filterCategory])

  // Stats
  const stats = useMemo(() => {
    const total = goals.length
    const achieved = goals.filter((g) => g.status === 'achieved').length
    const inProgress = goals.filter((g) => g.status === 'in_progress').length
    const pending = goals.filter((g) => g.status === 'pending').length

    return { total, achieved, inProgress, pending }
  }, [goals])

  const handleSaveGoal = async (formData: GoalFormData) => {
    if (!currentMember) return

    setIsSaving(true)

    try {
      const goalData = {
        member_id: currentMember.id,
        exercise_name: formData.exercise_name.trim(),
        target_value: parseFloat(formData.target_value),
        current_value: formData.current_value ? parseFloat(formData.current_value) : undefined,
        unit: formData.unit.trim(),
        category: formData.category as PerformanceCategory,
        deadline: formData.deadline || undefined,
        status: editingGoal?.status || ('pending' as const),
        progress_percentage: formData.current_value && formData.target_value
          ? Math.round((parseFloat(formData.current_value) / parseFloat(formData.target_value)) * 100)
          : 0,
      }

      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData)
        addNotification({ type: 'success', message: 'Objectif mis à jour !' })
      } else {
        await addGoal(goalData)
        addNotification({ type: 'success', message: 'Objectif créé !' })
      }

      setIsModalOpen(false)
      setEditingGoal(null)
    } catch (error) {
      addNotification({ type: 'error', message: 'Erreur lors de la sauvegarde' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteGoal = async (goal: Goal) => {
    if (!confirm(`Supprimer l'objectif "${goal.exercise_name}" ?`)) return

    try {
      await deleteGoal(goal.id)
      addNotification({ type: 'success', message: 'Objectif supprimé' })
    } catch (error) {
      addNotification({ type: 'error', message: 'Erreur lors de la suppression' })
    }
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setIsModalOpen(true)
  }

  const openNewGoalModal = () => {
    setEditingGoal(null)
    setIsModalOpen(true)
  }

  if (isLoadingGoals) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Chargement des objectifs..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Mes Objectifs</h1>
          <p className="text-gray-400">Définissez et suivez vos objectifs d'entraînement</p>
        </div>

        <GlassButton variant="primary" onClick={openNewGoalModal}>
          <Plus className="w-4 h-4" />
          Nouvel objectif
        </GlassButton>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <GlassCard padding="md" className="text-center">
          <Target className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </GlassCard>

        <GlassCard padding="md" className="text-center">
          <Trophy className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-400">{stats.achieved}</p>
          <p className="text-xs text-gray-400">Atteints</p>
        </GlassCard>

        <GlassCard padding="md" className="text-center">
          <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
          <p className="text-xs text-gray-400">En cours</p>
        </GlassCard>

        <GlassCard padding="md" className="text-center">
          <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.pending}</p>
          <p className="text-xs text-gray-400">En attente</p>
        </GlassCard>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard padding="sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filtrer:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-800/50 border border-glass-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-skali-accent/50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-800">
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-gray-800/50 border border-glass-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-skali-accent/50"
              >
                <option value="all" className="bg-gray-800">Toutes catégories</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-gray-800">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {(filterStatus !== 'all' || filterCategory !== 'all') && (
              <button
                onClick={() => {
                  setFilterStatus('all')
                  setFilterCategory('all')
                }}
                className="text-sm text-skali-accent hover:underline"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        goals.length === 0 ? (
          <NoGoals />
        ) : (
          <GlassCard className="text-center py-12">
            <p className="text-gray-400">Aucun objectif ne correspond aux filtres sélectionnés.</p>
          </GlassCard>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => handleEditGoal(goal)}
                onDelete={() => handleDeleteGoal(goal)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <GoalModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setEditingGoal(null)
            }}
            onSave={handleSaveGoal}
            initialData={editingGoal || undefined}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
