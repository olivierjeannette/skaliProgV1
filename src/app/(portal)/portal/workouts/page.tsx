'use client'

import { useState } from 'react'
import { usePortalStore } from '@/stores/portal-store'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalNav } from '@/components/portal/PortalNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
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
  Activity
} from 'lucide-react'

// Types
interface Workout {
  id: string
  date: string
  title: string
  type: 'CrossTraining' | 'Musculation' | 'Cardio' | 'Hyrox' | 'Recuperation'
  duration: number
  coach: string
  completed: boolean
  score?: string
  notes?: string
  blocks?: WorkoutBlock[]
}

interface WorkoutBlock {
  id: string
  type: 'warmup' | 'strength' | 'wod' | 'skill' | 'accessory' | 'cooldown'
  title: string
  content: string
  result?: string
}

// Mock data
const mockWorkouts: Workout[] = [
  {
    id: '1',
    date: '2026-02-04',
    title: 'WOD - Murph Prep',
    type: 'CrossTraining',
    duration: 60,
    coach: 'Alex',
    completed: true,
    score: '32:45 Rx',
    blocks: [
      { id: 'b1', type: 'warmup', title: 'Echauffement', content: '800m Run + Mobility', result: 'OK' },
      { id: 'b2', type: 'wod', title: 'WOD', content: 'Half Murph: 800m Run, 50 Pull-ups, 100 Push-ups, 150 Squats, 800m Run', result: '32:45' },
      { id: 'b3', type: 'cooldown', title: 'Cooldown', content: 'Stretching 10min', result: 'OK' }
    ]
  },
  {
    id: '2',
    date: '2026-02-03',
    title: 'Force - Back Squat',
    type: 'Musculation',
    duration: 75,
    coach: 'Julie',
    completed: true,
    score: 'PR 125kg',
    blocks: [
      { id: 'b1', type: 'warmup', title: 'Echauffement', content: 'Rameur 1000m + Mobilite hanche', result: 'OK' },
      { id: 'b2', type: 'strength', title: 'Force', content: 'Back Squat 5x3 @85%', result: '3x120kg, 2x125kg (PR!)' },
      { id: 'b3', type: 'accessory', title: 'Accessoire', content: 'Romanian DL 3x10 + Leg Curl 3x12', result: '70kg / 40kg' }
    ]
  },
  {
    id: '3',
    date: '2026-02-02',
    title: 'AMRAP 20',
    type: 'CrossTraining',
    duration: 60,
    coach: 'Alex',
    completed: true,
    score: '8 rounds + 12 reps',
    blocks: [
      { id: 'b1', type: 'wod', title: 'AMRAP 20min', content: '5 Pull-ups, 10 Push-ups, 15 Air Squats', result: '8+12' }
    ]
  },
  {
    id: '4',
    date: '2026-01-31',
    title: 'Hyrox Simulation',
    type: 'Hyrox',
    duration: 90,
    coach: 'Marc',
    completed: true,
    score: '1:12:30'
  },
  {
    id: '5',
    date: '2026-01-29',
    title: 'Cardio - Intervals',
    type: 'Cardio',
    duration: 45,
    coach: 'Julie',
    completed: true,
    score: '8.2km'
  }
]

// Helpers
const getTypeConfig = (type: Workout['type']) => {
  const configs = {
    CrossTraining: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Flame, label: 'CrossTraining' },
    Musculation: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Dumbbell, label: 'Musculation' },
    Cardio: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Heart, label: 'Cardio' },
    Hyrox: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Zap, label: 'Hyrox' },
    Recuperation: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Heart, label: 'Recuperation' }
  }
  return configs[type] || configs.CrossTraining
}

const getBlockTypeConfig = (type: WorkoutBlock['type']) => {
  const configs = {
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
              <span>Coach {workout.coach}</span>
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
                {formatDate(workout.date)} - Coach {workout.coach}
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
              {workout.blocks.map((block) => {
                const blockConfig = getBlockTypeConfig(block.type)
                const BlockIcon = blockConfig.icon
                return (
                  <div
                    key={block.id}
                    className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <BlockIcon className={`h-4 w-4 ${blockConfig.color}`} />
                      <span className={`text-sm font-medium ${blockConfig.color}`}>
                        {block.title}
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
function QuickStats({ workouts }: { workouts: Workout[] }) {
  const thisMonth = new Date().getMonth()
  const thisMonthWorkouts = workouts.filter(w => new Date(w.date).getMonth() === thisMonth)
  const totalDuration = thisMonthWorkouts.reduce((acc, w) => acc + w.duration, 0)

  const typeCount = workouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostCommonType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="grid grid-cols-3 gap-2">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-3 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
          <div className="text-xl font-bold text-white">{thisMonthWorkouts.length}</div>
          <div className="text-[10px] text-slate-400">Ce mois</div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-3 text-center">
          <Clock className="h-5 w-5 mx-auto mb-1 text-blue-400" />
          <div className="text-xl font-bold text-white">{Math.round(totalDuration / 60)}h</div>
          <div className="text-[10px] text-slate-400">Entrainement</div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-3 text-center">
          <Flame className="h-5 w-5 mx-auto mb-1 text-orange-400" />
          <div className="text-xl font-bold text-white">{workouts.length}</div>
          <div className="text-[10px] text-slate-400">Total</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function WorkoutsPage() {
  const { linkedMember } = usePortalStore()
  const [workouts] = useState<Workout[]>(mockWorkouts)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  // Filter workouts
  const filteredWorkouts = workouts.filter(w => {
    if (activeTab === 'all') return true
    return w.type.toLowerCase().includes(activeTab.toLowerCase())
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
            <QuickStats workouts={workouts} />

            {/* Filter tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 bg-slate-800/50">
                <TabsTrigger value="all" className="text-xs">Tous</TabsTrigger>
                <TabsTrigger value="cross" className="text-xs">Cross</TabsTrigger>
                <TabsTrigger value="muscu" className="text-xs">Muscu</TabsTrigger>
                <TabsTrigger value="hyrox" className="text-xs">Hyrox</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Workout list */}
            <div className="space-y-3">
              {filteredWorkouts.length === 0 ? (
                <Card className="bg-slate-800/30 border-slate-700/50">
                  <CardContent className="py-8 text-center">
                    <Dumbbell className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-500">Aucun entrainement trouve</p>
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
          </>
        )}
      </main>

      <PortalNav />
    </div>
  )
}
