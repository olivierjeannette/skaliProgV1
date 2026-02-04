'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { usePortalStore } from '@/stores/portal-store'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalNav } from '@/components/portal/PortalNav'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BLOCK_TYPE_CONFIG, BlockType } from '@/types'
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Dumbbell,
  Heart,
  Zap,
  Timer,
  Loader2,
  Tv,
  X,
  Clock,
  Activity
} from 'lucide-react'

// Types
interface SessionBlock {
  id: string
  type: BlockType
  title: string
  content: string
  order: number
}

interface Session {
  id: string
  date: string
  time: string
  title: string
  type: string
  coach: string
  duration: number
  description?: string
  blocks?: SessionBlock[]
}

// Helpers
const getTypeConfig = (type: string) => {
  const configs: Record<string, { color: string; icon: React.ComponentType<{ className?: string }>; bg: string }> = {
    crossnfit: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Flame },
    crosstraining: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Flame },
    power: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Dumbbell },
    build: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Dumbbell },
    musculation: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Dumbbell },
    cardio: { color: 'text-red-400', bg: 'bg-red-500/20', icon: Heart },
    hyrox: { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Zap },
    hyrox_long: { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Zap },
    hyrox_team: { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Zap },
    tactical: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Zap },
    recuperation: { color: 'text-green-400', bg: 'bg-green-500/20', icon: Heart },
    open: { color: 'text-slate-400', bg: 'bg-slate-500/20', icon: Timer }
  }
  return configs[type?.toLowerCase()] || configs.open
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
}

// Block component for session detail
function BlockItem({ block }: { block: SessionBlock }) {
  const config = BLOCK_TYPE_CONFIG[block.type] || BLOCK_TYPE_CONFIG.custom

  return (
    <div className={`rounded-lg p-3 ${config.color} border border-current/20`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.icon}</span>
        <span className="font-medium text-sm">{block.title || config.name}</span>
      </div>
      <p className="text-sm whitespace-pre-line opacity-90">{block.content}</p>
    </div>
  )
}

// Session card with detail view
function SessionCard({ session, onOpenTV }: {
  session: Session
  onOpenTV: (session: Session) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const typeConfig = getTypeConfig(session.type)
  const Icon = typeConfig.icon
  const hasBlocks = session.blocks && session.blocks.length > 0

  return (
    <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
      <CardContent className="p-0">
        {/* Header - clickable to expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
        >
          <div className="flex">
            {/* Time column */}
            <div className="w-20 shrink-0 bg-slate-900/50 p-3 flex flex-col items-center justify-center border-r border-slate-700">
              <span className="text-lg font-bold text-white">{session.time}</span>
              <span className="text-xs text-slate-400">{session.duration} min</span>
            </div>

            {/* Content */}
            <div className="flex-1 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{session.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-[10px] ${typeConfig.bg} ${typeConfig.color} border-current/30`}>
                      <Icon className="h-3 w-3 mr-1" />
                      {session.type}
                    </Badge>
                    {session.coach && (
                      <span className="text-xs text-slate-400">Coach {session.coach}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </div>
            </div>
          </div>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-slate-700 p-4 space-y-4 bg-slate-900/30">
            {/* Description if any */}
            {session.description && (
              <p className="text-sm text-slate-300">{session.description}</p>
            )}

            {/* Blocks */}
            {hasBlocks ? (
              <div className="space-y-3">
                {session.blocks!
                  .sort((a, b) => a.order - b.order)
                  .map((block) => (
                    <BlockItem key={block.id} block={block} />
                  ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                Pas de detail disponible pour cette seance
              </p>
            )}

            {/* TV Mode button */}
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onOpenTV(session)
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              <Tv className="h-4 w-4" />
              Mode TV
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// TV Mode - Full screen session display
function TVMode({ session, onClose }: { session: Session; onClose: () => void }) {
  const typeConfig = getTypeConfig(session.type)
  const Icon = typeConfig.icon
  const blocks = session.blocks?.sort((a, b) => a.order - b.order) || []

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-auto">
      {/* Header */}
      <div className={`sticky top-0 ${typeConfig.bg} border-b border-current/20 p-4 backdrop-blur-sm`}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-black/20`}>
              <Icon className={`h-6 w-6 ${typeConfig.color}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{session.title}</h1>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {session.time}
                </span>
                <span>{session.duration} min</span>
                {session.coach && <span>Coach {session.coach}</span>}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Description */}
        {session.description && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-300 text-lg">{session.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Blocks */}
        {blocks.length > 0 ? (
          <div className="space-y-4">
            {blocks.map((block, index) => {
              const config = BLOCK_TYPE_CONFIG[block.type] || BLOCK_TYPE_CONFIG.custom
              return (
                <Card key={block.id} className={`border-2 ${config.color.replace('text-', 'border-').replace('/20', '/50')}`}>
                  <CardContent className="p-0">
                    {/* Block header */}
                    <div className={`${config.color} p-4 border-b border-current/20`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.icon}</span>
                        <div>
                          <div className="text-xs text-current/70 uppercase tracking-wide">
                            Bloc {index + 1}
                          </div>
                          <h2 className="text-xl font-bold">
                            {block.title || config.name}
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Block content */}
                    <div className="p-4 bg-slate-900/50">
                      <p className="text-lg text-white whitespace-pre-line leading-relaxed">
                        {block.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-slate-800/30 border-slate-700">
            <CardContent className="py-12 text-center">
              <Activity className="h-12 w-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-500">Detail de la seance non disponible</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer spacer for safe area */}
      <div className="h-8" />
    </div>
  )
}

// Day view
function DayView({ date, sessions, onOpenTV }: {
  date: Date
  sessions: Session[]
  onOpenTV: (session: Session) => void
}) {
  const isToday = isSameDay(date, new Date())

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-white capitalize">
          {formatDate(date)}
        </h2>
        {isToday && (
          <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
            Aujourd&apos;hui
          </Badge>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="py-8 text-center">
            <p className="text-slate-500 text-sm">Aucune seance ce jour</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} onOpenTV={onOpenTV} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PlanningPage() {
  const { linkedMember } = usePortalStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tvSession, setTvSession] = useState<Session | null>(null)

  // Get week dates
  const weekDates = useMemo(() => {
    const dates: Date[] = []
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay() + 1) // Start Monday

    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      dates.push(d)
    }
    return dates
  }, [currentDate])

  // Fetch sessions for the week
  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    try {
      const from = weekDates[0].toISOString().split('T')[0]
      const to = weekDates[6].toISOString().split('T')[0]

      const response = await fetch(`/api/portal/sessions?from=${from}&to=${to}`)
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [weekDates])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Filter sessions for each day
  const getSessionsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return sessions.filter(s => s.date === dateStr).sort((a, b) => a.time.localeCompare(b.time))
  }

  // Navigation
  const goToPrevWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Week range label
  const weekLabel = useMemo(() => {
    const start = weekDates[0]
    const end = weekDates[6]
    const startMonth = start.toLocaleDateString('fr-FR', { month: 'short' })
    const endMonth = end.toLocaleDateString('fr-FR', { month: 'short' })

    if (startMonth === endMonth) {
      return `${start.getDate()} - ${end.getDate()} ${startMonth}`
    }
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}`
  }, [weekDates])

  if (!linkedMember) {
    return null
  }

  return (
    <>
      {/* TV Mode overlay */}
      {tvSession && (
        <TVMode session={tvSession} onClose={() => setTvSession(null)} />
      )}

      <div className="min-h-screen pb-24">
        <PortalHeader title="Planning" />

        <main className="max-w-lg mx-auto p-4 space-y-4">
          {/* Week navigation */}
          <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2">
            <Button variant="ghost" size="icon" onClick={goToPrevWeek}>
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="text-center">
              <button
                onClick={goToToday}
                className="text-sm font-medium text-white hover:text-emerald-400 transition-colors"
              >
                {weekLabel}
              </button>
            </div>

            <Button variant="ghost" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Mini calendar - days of week */}
          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((date, i) => {
              const isToday = isSameDay(date, new Date())
              const hasSessions = getSessionsForDay(date).length > 0
              const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

              return (
                <button
                  key={i}
                  onClick={() => {
                    const element = document.getElementById(`day-${date.toISOString().split('T')[0]}`)
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    isToday
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-[10px]">{dayNames[i]}</span>
                  <span className={`text-sm font-medium ${isToday ? 'text-white' : ''}`}>
                    {date.getDate()}
                  </span>
                  {hasSessions && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isToday ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            /* Sessions by day */
            <div className="space-y-6">
              {weekDates.map((date) => (
                <div key={date.toISOString()} id={`day-${date.toISOString().split('T')[0]}`}>
                  <DayView
                    date={date}
                    sessions={getSessionsForDay(date)}
                    onOpenTV={setTvSession}
                  />
                </div>
              ))}
            </div>
          )}
        </main>

        <PortalNav />
      </div>
    </>
  )
}
