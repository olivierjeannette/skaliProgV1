'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePortalStore } from '@/stores/portal-store'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalNav } from '@/components/portal/PortalNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Clock,
  Flame,
  Dumbbell,
  Heart,
  Zap,
  Timer,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Target,
  Activity,
  Loader2,
  Plus,
  X,
  Trash2,
  Save,
  User,
  Star
} from 'lucide-react'

// Types
interface WorkoutBlock {
  id: string
  type: 'warmup' | 'strength' | 'wod' | 'skill' | 'accessory' | 'cooldown'
  title: string
  content: string
  result?: string
}

interface Workout {
  id: string
  date: string
  title: string
  type: string
  duration: number
  coach?: string
  completed: boolean
  score?: string
  notes?: string
  blocks?: WorkoutBlock[]
  is_personal?: boolean
  feeling?: number
}

interface WorkoutStats {
  thisMonth: number
  totalTime: number
  totalSessions: number
}

// Helpers
const getTypeConfig = (type: string, isPersonal?: boolean) => {
  if (isPersonal) {
    return { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: User, label: 'Personnel' }
  }
  const configs: Record<string, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
    crossnfit: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Flame, label: 'CrossTraining' },
    crosstraining: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Flame, label: 'CrossTraining' },
    personal: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: User, label: 'Personnel' },
    power: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Dumbbell, label: 'Power' },
    build: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Dumbbell, label: 'Build' },
    musculation: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Dumbbell, label: 'Musculation' },
    cardio: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Heart, label: 'Cardio' },
    hyrox: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Zap, label: 'Hyrox' },
    hyrox_long: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Zap, label: 'Hyrox Long' },
    hyrox_team: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Zap, label: 'Hyrox Team' },
    tactical: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Zap, label: 'Tactical' },
    recuperation: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Heart, label: 'Recuperation' },
    open: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Timer, label: 'Open' }
  }
  return configs[type?.toLowerCase()] || { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Timer, label: type || 'WOD' }
}

const getBlockTypeConfig = (type: string) => {
  const configs: Record<string, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
    warmup: { color: 'text-yellow-400', icon: Activity, label: 'Echauffement' },
    strength: { color: 'text-blue-400', icon: Dumbbell, label: 'Force' },
    wod: { color: 'text-orange-400', icon: Flame, label: 'WOD' },
    skill: { color: 'text-purple-400', icon: Target, label: 'Skill' },
    accessory: { color: 'text-teal-400', icon: Dumbbell, label: 'Accessoire' },
    cooldown: { color: 'text-green-400', icon: Heart, label: 'Cooldown' }
  }
  return configs[type] || configs.wod
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (date.toDateString() === yesterday.toDateString()) return 'Hier'

  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

// Composant Workout Card
function WorkoutCard({ workout, onSelect }: { workout: Workout; onSelect: (w: Workout) => void }) {
  const typeConfig = getTypeConfig(workout.type, workout.is_personal)
  const Icon = typeConfig.icon

  return (
    <Card
      className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-800/70 transition-colors"
      onClick={() => onSelect(workout)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`text-[10px] ${typeConfig.color}`}>
                <Icon className="h-3 w-3 mr-1" />
                {typeConfig.label}
              </Badge>
              {workout.is_personal && (
                <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Perso
                </Badge>
              )}
              <span className="text-xs text-slate-500">{formatDate(workout.date)}</span>
            </div>
            <h3 className="font-medium text-white truncate">{workout.title}</h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {workout.duration} min
              </span>
              {workout.coach && <span>Coach {workout.coach}</span>}
              {workout.feeling && (
                <span className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i <= workout.feeling! ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                    />
                  ))}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {workout.completed && (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            )}
            {workout.score && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                {workout.score}
              </Badge>
            )}
            <ChevronRight className="h-4 w-4 text-slate-500 mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant Workout Detail
function WorkoutDetail({ workout, onClose, onDelete }: { workout: Workout; onClose: () => void; onDelete?: () => void }) {
  const typeConfig = getTypeConfig(workout.type, workout.is_personal)
  const Icon = typeConfig.icon

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400">
          ← Retour
        </Button>
        {workout.is_personal && onDelete && (
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-400 hover:text-red-300">
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        )}
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`text-xs ${typeConfig.color}`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {typeConfig.label}
                </Badge>
                {workout.is_personal && (
                  <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Seance perso
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg text-white">{workout.title}</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                {formatDate(workout.date)} {workout.coach && `- Coach ${workout.coach}`}
              </p>
            </div>
            {workout.score && (
              <div className="text-right">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-sm">
                  {workout.score}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="h-4 w-4" />
              <span>{workout.duration} min</span>
            </div>
            {workout.completed && (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete</span>
              </div>
            )}
            {workout.feeling && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i <= workout.feeling! ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {workout.notes && (
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <p className="text-sm text-slate-300">{workout.notes}</p>
            </div>
          )}

          {/* Blocks */}
          {workout.blocks && workout.blocks.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium text-slate-300">Detail de la seance</h4>
              {workout.blocks.map((block, index) => {
                const blockConfig = getBlockTypeConfig(block.type)
                const BlockIcon = blockConfig.icon
                return (
                  <div
                    key={block.id || index}
                    className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <BlockIcon className={`h-4 w-4 ${blockConfig.color}`} />
                      <span className={`text-sm font-medium ${blockConfig.color}`}>
                        {block.title || blockConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-line">
                      {block.content}
                    </p>
                    {block.result && (
                      <div className="mt-2 pt-2 border-t border-slate-700/50">
                        <span className="text-xs text-slate-500">Resultat: </span>
                        <span className="text-sm text-emerald-400">{block.result}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Formulaire creation seance
function CreateWorkoutForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'personal',
    duration: 60,
    score: '',
    notes: '',
    feeling: 0,
    blocks: [] as { type: string; title: string; content: string; result: string }[]
  })

  const addBlock = () => {
    setForm(f => ({
      ...f,
      blocks: [...f.blocks, { type: 'wod', title: '', content: '', result: '' }]
    }))
  }

  const updateBlock = (index: number, field: string, value: string) => {
    setForm(f => ({
      ...f,
      blocks: f.blocks.map((b, i) => i === index ? { ...b, [field]: value } : b)
    }))
  }

  const removeBlock = (index: number) => {
    setForm(f => ({
      ...f,
      blocks: f.blocks.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/portal/personal-workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          feeling: form.feeling || null,
          blocks: form.blocks.filter(b => b.content.trim())
        })
      })

      if (response.ok) {
        onCreated()
        onClose()
      }
    } catch (error) {
      console.error('Failed to create workout:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    { value: 'personal', label: 'Personnel' },
    { value: 'crosstraining', label: 'CrossTraining' },
    { value: 'musculation', label: 'Musculation' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'hyrox', label: 'Hyrox' },
    { value: 'recuperation', label: 'Recuperation' }
  ]

  const blockTypes = [
    { value: 'warmup', label: 'Echauffement' },
    { value: 'strength', label: 'Force' },
    { value: 'wod', label: 'WOD' },
    { value: 'skill', label: 'Skill' },
    { value: 'accessory', label: 'Accessoire' },
    { value: 'cooldown', label: 'Cooldown' }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Nouvelle seance</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4 space-y-4">
          {/* Titre */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Titre *</label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Seance force du matin"
              className="bg-slate-900/50 border-slate-700"
            />
          </div>

          {/* Date et Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date</label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="bg-slate-900/50 border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Type</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duree et Score */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Duree (min)</label>
              <Input
                type="number"
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 60 }))}
                className="bg-slate-900/50 border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Score/Temps</label>
              <Input
                value={form.score}
                onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                placeholder="Ex: 15:30 Rx"
                className="bg-slate-900/50 border-slate-700"
              />
            </div>
          </div>

          {/* Ressenti */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Ressenti</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, feeling: f.feeling === i ? 0 : i }))}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      i <= form.feeling ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 hover:text-slate-500'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Notes</label>
            <Textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notes personnelles..."
              className="bg-slate-900/50 border-slate-700 min-h-[60px]"
            />
          </div>

          {/* Blocs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400">Blocs de la seance</label>
              <Button variant="ghost" size="sm" onClick={addBlock} className="text-emerald-400 h-7">
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>

            {form.blocks.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-sm border border-dashed border-slate-700 rounded-lg">
                Aucun bloc. Cliquez sur Ajouter pour detailler votre seance.
              </div>
            ) : (
              <div className="space-y-3">
                {form.blocks.map((block, index) => {
                  const blockConfig = getBlockTypeConfig(block.type)
                  return (
                    <div key={index} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <Select value={block.type} onValueChange={v => updateBlock(index, 'type', v)}>
                          <SelectTrigger className={`w-[140px] h-8 text-xs ${blockConfig.color} bg-transparent border-0`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {blockTypes.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeBlock(index)}>
                          <Trash2 className="h-4 w-4 text-slate-500" />
                        </Button>
                      </div>
                      <Textarea
                        value={block.content}
                        onChange={e => updateBlock(index, 'content', e.target.value)}
                        placeholder="Contenu du bloc (ex: 5x5 Back Squat @80%)..."
                        className="bg-slate-800/50 border-slate-700 min-h-[60px] text-sm"
                      />
                      <Input
                        value={block.result}
                        onChange={e => updateBlock(index, 'result', e.target.value)}
                        placeholder="Resultat (optionnel)"
                        className="bg-slate-800/50 border-slate-700 mt-2 text-sm"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Annuler
        </Button>
        <Button
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          onClick={handleSubmit}
          disabled={!form.title.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enregistrer
        </Button>
      </div>
    </div>
  )
}

// Stats rapides
function QuickStats({ stats }: { stats: WorkoutStats }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-3 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
          <div className="text-xl font-bold text-white">{stats.thisMonth}</div>
          <div className="text-[10px] text-slate-400">Ce mois</div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-3 text-center">
          <Clock className="h-5 w-5 mx-auto mb-1 text-blue-400" />
          <div className="text-xl font-bold text-white">{stats.totalTime}h</div>
          <div className="text-[10px] text-slate-400">Entrainement</div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-3 text-center">
          <Flame className="h-5 w-5 mx-auto mb-1 text-orange-400" />
          <div className="text-xl font-bold text-white">{stats.totalSessions}</div>
          <div className="text-[10px] text-slate-400">Total</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function WorkoutsPage() {
  const { linkedMember } = usePortalStore()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [stats, setStats] = useState<WorkoutStats>({ thisMonth: 0, totalTime: 0, totalSessions: 0 })
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Fetch workouts
  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true)
    try {
      const typeFilter = activeTab === 'all' ? '' : `&type=${activeTab}`
      const response = await fetch(`/api/portal/workouts?limit=50${typeFilter}`)
      if (response.ok) {
        const data = await response.json()
        setWorkouts(data.workouts || [])
        setStats(data.stats || { thisMonth: 0, totalTime: 0, totalSessions: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch workouts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    if (linkedMember) {
      fetchWorkouts()
    }
  }, [linkedMember, fetchWorkouts])

  // Delete personal workout
  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Supprimer cette seance ?')) return

    try {
      const response = await fetch(`/api/portal/personal-workouts?id=${workoutId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setSelectedWorkout(null)
        fetchWorkouts()
      }
    } catch (error) {
      console.error('Failed to delete workout:', error)
    }
  }

  // Filter workouts locally based on tab
  const filteredWorkouts = workouts.filter(w => {
    if (activeTab === 'all') return true
    if (activeTab === 'perso') return w.is_personal
    const typeLower = (w.type || '').toLowerCase()
    if (activeTab === 'cross') return typeLower.includes('cross') || typeLower.includes('nfit')
    if (activeTab === 'muscu') return typeLower.includes('power') || typeLower.includes('build') || typeLower.includes('muscu')
    if (activeTab === 'hyrox') return typeLower.includes('hyrox')
    return true
  })

  if (!linkedMember) {
    return null
  }

  return (
    <div className="min-h-screen pb-24">
      <PortalHeader title="Mes WODs" />

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {showCreateForm ? (
          <CreateWorkoutForm
            onClose={() => setShowCreateForm(false)}
            onCreated={fetchWorkouts}
          />
        ) : selectedWorkout ? (
          <WorkoutDetail
            workout={selectedWorkout}
            onClose={() => setSelectedWorkout(null)}
            onDelete={selectedWorkout.is_personal ? () => handleDeleteWorkout(selectedWorkout.id) : undefined}
          />
        ) : (
          <>
            {/* Quick stats */}
            <QuickStats stats={stats} />

            {/* Bouton creer seance */}
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Creer une seance perso
            </Button>

            {/* Filter tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 bg-slate-800/50">
                <TabsTrigger value="all" className="text-xs">Tous</TabsTrigger>
                <TabsTrigger value="perso" className="text-xs">Perso</TabsTrigger>
                <TabsTrigger value="cross" className="text-xs">Cross</TabsTrigger>
                <TabsTrigger value="muscu" className="text-xs">Muscu</TabsTrigger>
                <TabsTrigger value="hyrox" className="text-xs">Hyrox</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Loading state */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : (
              /* Workout list */
              <div className="space-y-3">
                {filteredWorkouts.length === 0 ? (
                  <Card className="bg-slate-800/30 border-slate-700/50">
                    <CardContent className="py-8 text-center">
                      <Dumbbell className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                      <p className="text-slate-500">Aucun entrainement trouve</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Creez votre premiere seance perso!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredWorkouts.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      onSelect={setSelectedWorkout}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      <PortalNav />
    </div>
  )
}
