'use client'

import { useState } from 'react'
import { usePortalStore } from '@/stores/portal-store'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalNav } from '@/components/portal/PortalNav'
import { EpicCard } from '@/components/portal/EpicCard'
import { UNIVERSE_OPTIONS, Universe } from '@/config/epic-cards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Trophy,
  TrendingUp,
  Dumbbell,
  Award,
  Target,
  Settings,
  Shuffle,
  Calendar,
  Clock,
  Flame,
  Star,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react'

// Types
interface PersonalRecord {
  id: string
  exercise: string
  value: string
  unit: 'kg' | 'reps' | 'time' | 'm'
  date: string
  previous?: string
  improvement?: string
}

interface ProgressData {
  label: string
  current: number
  previous: number
  unit: string
}

// Mock PRs
const mockPRs: PersonalRecord[] = [
  { id: '1', exercise: 'Back Squat', value: '125', unit: 'kg', date: '2026-02-03', previous: '120', improvement: '+5kg' },
  { id: '2', exercise: 'Deadlift', value: '150', unit: 'kg', date: '2026-01-28', previous: '145', improvement: '+5kg' },
  { id: '3', exercise: 'Bench Press', value: '85', unit: 'kg', date: '2026-01-20', previous: '82.5', improvement: '+2.5kg' },
  { id: '4', exercise: 'Clean & Jerk', value: '90', unit: 'kg', date: '2026-01-15' },
  { id: '5', exercise: 'Snatch', value: '70', unit: 'kg', date: '2026-01-10' },
  { id: '6', exercise: 'Pull-ups', value: '18', unit: 'reps', date: '2026-02-01', previous: '15', improvement: '+3 reps' },
  { id: '7', exercise: 'Fran', value: '4:32', unit: 'time', date: '2026-01-25', previous: '5:15', improvement: '-43s' },
  { id: '8', exercise: 'Row 2K', value: '7:15', unit: 'time', date: '2026-01-18' }
]

// Mock progress data
const mockProgress: ProgressData[] = [
  { label: 'Seances/mois', current: 14, previous: 11, unit: '' },
  { label: 'Temps total', current: 18, previous: 14, unit: 'h' },
  { label: 'PRs ce mois', current: 3, previous: 1, unit: '' },
  { label: 'Streak', current: 5, previous: 3, unit: 'jours' }
]

// Universe Selector
function UniverseSelector() {
  const { linkedMember, setPreferredUniverse, refreshStats } = usePortalStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (universe: Universe) => {
    setPreferredUniverse(universe)
    setIsOpen(false)
  }

  const handleRandomize = () => {
    refreshStats()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Changer d&apos;univers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choisir votre univers</DialogTitle>
          <DialogDescription>
            Selectionnez l&apos;univers qui vous correspond le mieux.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {UNIVERSE_OPTIONS.map((universe) => (
            <button
              key={universe.id}
              onClick={() => handleSelect(universe.id as Universe)}
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                linkedMember?.preferred_universe === universe.id
                  ? 'border-primary bg-primary/10'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <span className="text-3xl block mb-2">{universe.emoji}</span>
              <span className="text-sm font-medium">{universe.name}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-center pt-2">
          <Button variant="ghost" onClick={handleRandomize} className="gap-2">
            <Shuffle className="h-4 w-4" />
            Aleatoire
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// PR Card
function PRCard({ pr }: { pr: PersonalRecord }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-yellow-500/10">
          <Trophy className="h-4 w-4 text-yellow-400" />
        </div>
        <div>
          <div className="font-medium text-white">{pr.exercise}</div>
          <div className="text-xs text-slate-400">{formatDate(pr.date)}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-white">
          {pr.value} {pr.unit !== 'time' && pr.unit}
        </div>
        {pr.improvement && (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
            {pr.improvement}
          </Badge>
        )}
      </div>
    </div>
  )
}

// Progress Card
function ProgressCard({ data }: { data: ProgressData }) {
  const diff = data.current - data.previous
  const isPositive = diff > 0
  const isNeutral = diff === 0

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-3">
        <div className="text-xs text-slate-400 mb-1">{data.label}</div>
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-white">
            {data.current}{data.unit}
          </span>
          <div className={`flex items-center gap-0.5 text-xs ${
            isPositive ? 'text-emerald-400' : isNeutral ? 'text-slate-400' : 'text-red-400'
          }`}>
            {isPositive ? <ChevronUp className="h-3 w-3" /> :
             isNeutral ? <Minus className="h-3 w-3" /> :
             <ChevronDown className="h-3 w-3" />}
            <span>{isNeutral ? '0' : `${isPositive ? '+' : ''}${diff}`}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Stat Bar
function StatBar({ label, value, maxValue = 100, color }: { label: string; value: number; maxValue?: number; color: string }) {
  const percentage = (value / maxValue) * 100

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function PerformancePage() {
  const { linkedMember, epicCharacter, memberStats, refreshStats } = usePortalStore()
  const [prs] = useState<PersonalRecord[]>(mockPRs)
  const [progress] = useState<ProgressData[]>(mockProgress)
  const [activeTab, setActiveTab] = useState('card')

  if (!linkedMember || !epicCharacter || !memberStats) {
    return null
  }

  return (
    <div className="min-h-screen pb-24">
      <PortalHeader
        title="Performance"
        showRefresh
        onRefresh={refreshStats}
      />

      <main className="max-w-lg mx-auto p-4 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="card" className="text-xs gap-1">
              <Star className="h-3 w-3" />
              Ma Carte
            </TabsTrigger>
            <TabsTrigger value="prs" className="text-xs gap-1">
              <Trophy className="h-3 w-3" />
              PRs
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xs gap-1">
              <TrendingUp className="h-3 w-3" />
              Progres
            </TabsTrigger>
          </TabsList>

          {/* MA CARTE */}
          <TabsContent value="card" className="space-y-4 mt-4">
            <div className="text-center">
              <h2 className="text-lg font-bold text-white mb-1">Votre carte de heros</h2>
              <p className="text-sm text-slate-400">Touchez la carte pour la voir en 3D</p>
            </div>

            <EpicCard
              memberName={linkedMember.firstName || linkedMember.name}
              character={epicCharacter}
              level={memberStats.level}
              xp={memberStats.xp}
              xpToNextLevel={memberStats.xpToNextLevel}
              baseStats={{
                strength: memberStats.strength,
                endurance: memberStats.endurance,
                speed: memberStats.speed,
                technique: memberStats.technique,
                power: memberStats.power
              }}
              sessionCount={memberStats.sessionCount}
              prCount={memberStats.prCount}
            />

            <div className="flex justify-center">
              <UniverseSelector />
            </div>

            {/* Stats details */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300">Stats detaillees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatBar label="Force" value={memberStats.strength} color="bg-red-500" />
                <StatBar label="Endurance" value={memberStats.endurance} color="bg-green-500" />
                <StatBar label="Vitesse" value={memberStats.speed} color="bg-yellow-500" />
                <StatBar label="Technique" value={memberStats.technique} color="bg-blue-500" />
                <StatBar label="Puissance" value={memberStats.power} color="bg-orange-500" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRs */}
          <TabsContent value="prs" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Records Personnels</h2>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                {prs.length} PRs
              </Badge>
            </div>

            <div className="space-y-2">
              {prs.map((pr) => (
                <PRCard key={pr.id} pr={pr} />
              ))}
            </div>

            <Card className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="py-6 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm text-slate-500">
                  Vos PRs sont automatiquement enregistres
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Demandez a votre coach de valider vos performances
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROGRESS */}
          <TabsContent value="progress" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Vos progres</h2>
              <Badge variant="outline" className="text-slate-400 border-slate-600">
                Ce mois
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {progress.map((p, i) => (
                <ProgressCard key={i} data={p} />
              ))}
            </div>

            {/* Level Progress */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-400" />
                  Progression niveau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-2xl font-bold text-white">Niveau {memberStats.level}</span>
                    <p className="text-xs text-slate-400">
                      {memberStats.xp} / {memberStats.xpToNextLevel} XP
                    </p>
                  </div>
                  <span className="text-sm text-emerald-400">
                    {Math.round((memberStats.xp / memberStats.xpToNextLevel) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${(memberStats.xp / memberStats.xpToNextLevel) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Encore {memberStats.xpToNextLevel - memberStats.xp} XP pour le niveau {memberStats.level + 1}
                </p>
              </CardContent>
            </Card>

            {/* Activity summary */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  Resume d&apos;activite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Dumbbell className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                    <div className="text-lg font-bold text-white">{memberStats.sessionCount}</div>
                    <div className="text-[10px] text-slate-500">Seances</div>
                  </div>
                  <div>
                    <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
                    <div className="text-lg font-bold text-white">{memberStats.prCount}</div>
                    <div className="text-[10px] text-slate-500">PRs</div>
                  </div>
                  <div>
                    <Flame className="h-5 w-5 mx-auto mb-1 text-orange-400" />
                    <div className="text-lg font-bold text-white">
                      {Math.round(memberStats.sessionCount * 0.8)}h
                    </div>
                    <div className="text-[10px] text-slate-500">Temps total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <PortalNav />
    </div>
  )
}
