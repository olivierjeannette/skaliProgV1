'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePortalStore } from '@/stores/portal-store'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalNav } from '@/components/portal/PortalNav'
import { EpicCard } from '@/components/portal/EpicCard'
import { CLASS_CONFIG } from '@/config/epic-cards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy,
  TrendingUp,
  Dumbbell,
  Award,
  Target,
  Shuffle,
  Calendar,
  Flame,
  Star,
  ChevronUp,
  ChevronDown,
  Minus,
  Loader2
} from 'lucide-react'

// Types
interface PersonalRecord {
  id: string
  exercise: string
  value: string
  unit: string
  date: string
  category?: string
  improvement?: string | null
}

interface ProgressData {
  label: string
  current: number
  previous: number
  unit: string
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
          {pr.value} {pr.unit !== 'seconds' && pr.unit}
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
  const { linkedMember, epicCharacter, memberStats, refreshStats, rerollCharacter } = usePortalStore()
  const [prs, setPrs] = useState<PersonalRecord[]>([])
  const [progress, setProgress] = useState<ProgressData[]>([])
  const [activeTab, setActiveTab] = useState('card')
  const [isLoadingPRs, setIsLoadingPRs] = useState(true)

  // Fetch PRs from API
  const fetchPRs = useCallback(async () => {
    setIsLoadingPRs(true)
    try {
      const response = await fetch('/api/portal/prs?limit=20')
      if (response.ok) {
        const data = await response.json()
        setPrs(data.prs || [])
      }
    } catch (error) {
      console.error('Failed to fetch PRs:', error)
    } finally {
      setIsLoadingPRs(false)
    }
  }, [])

  // Compute progress data from stats
  useEffect(() => {
    if (memberStats) {
      // Calculate progress data based on current stats
      // These would ideally come from an API comparing current vs previous month
      setProgress([
        { label: 'Seances total', current: memberStats.sessionCount, previous: Math.max(0, memberStats.sessionCount - 4), unit: '' },
        { label: 'PRs', current: memberStats.prCount, previous: Math.max(0, memberStats.prCount - 2), unit: '' },
        { label: 'Niveau', current: memberStats.level, previous: Math.max(1, memberStats.level - 1), unit: '' },
        { label: 'Percentile', current: memberStats.percentile, previous: Math.max(1, memberStats.percentile - 5), unit: '%' }
      ])
    }
  }, [memberStats])

  useEffect(() => {
    if (linkedMember) {
      fetchPRs()
    }
  }, [linkedMember, fetchPRs])

  if (!linkedMember || !epicCharacter || !memberStats) {
    return null
  }

  const classConfig = CLASS_CONFIG[epicCharacter.cardClass]

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
              sessionCount={memberStats.sessionCount}
              prCount={memberStats.prCount}
              size="lg"
            />

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={refreshStats}
              >
                <Shuffle className="h-4 w-4" />
                Rafraichir
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                onClick={rerollCharacter}
              >
                <Dumbbell className="h-4 w-4" />
                Nouveau heros
              </Button>
            </div>

            {/* Character info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                  <span className="text-lg">{classConfig.icon}</span>
                  {epicCharacter.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-slate-400">{epicCharacter.title}</p>
                <p className="text-xs italic text-slate-500">{epicCharacter.quote}</p>
              </CardContent>
            </Card>

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

            {isLoadingPRs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
              </div>
            ) : prs.length === 0 ? (
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="py-8 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-500">Aucun PR enregistre</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Vos records seront affiches ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {prs.map((pr) => (
                  <PRCard key={pr.id} pr={pr} />
                ))}
              </div>
            )}

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
                Global
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
                      Top {100 - memberStats.percentile}%
                    </div>
                    <div className="text-[10px] text-slate-500">Classement</div>
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
