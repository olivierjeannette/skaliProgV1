'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePortalStore } from '@/stores/portal-store'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalNav } from '@/components/portal/PortalNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Loader2
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
  coach: string
  completed: boolean
  score?: string
  notes?: string
  blocks?: WorkoutBlock[]
}

interface WorkoutStats {
  thisMonth: number
  totalTime: number
  totalSessions: number
}

// Helpers
const getTypeConfig = (type: string) => {
  const configs: Record<string, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
    crossnfit: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Flame, label: 'CrossTraining' },
    crosstraining: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Flame, label: 'CrossTraining' },
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
  const typeConfig = getTypeConfig(workout.type)
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
              <span className="text-xs text-slate-500">{formatDate(workout.date)}</span>
            </div>
            <h3 className="font-medium text-white truncate">{workout.title}</h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {workout.duration} min
              </span>
              {workout.coach && <span>Coach {workout.coach}</span>}
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
function WorkoutDetail({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const typeConfig = getTypeConfig(workout.type)
  const Icon = typeConfig.icon

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400">
        ← Retour a l&apos;historique
      </Button>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <Badge className={`text-xs ${typeConfig.color} mb-2`}>
                <Icon className="h-3 w-3 mr-1" />
                {typeConfig.label}
              </Badge>
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
          <div className="flex gap-4 text-sm">
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
          </div>

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

  // Filter workouts locally based on tab
  const filteredWorkouts = workouts.filter(w => {
    if (activeTab === 'all') return true
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
        {selectedWorkout ? (
          <WorkoutDetail
            workout={selectedWorkout}
            onClose={() => setSelectedWorkout(null)}
          />
        ) : (
          <>
            {/* Quick stats */}
            <QuickStats stats={stats} />

            {/* Filter tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 bg-slate-800/50">
                <TabsTrigger value="all" className="text-xs">Tous</TabsTrigger>
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
                        Inscrivez-vous a une seance pour commencer!
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
