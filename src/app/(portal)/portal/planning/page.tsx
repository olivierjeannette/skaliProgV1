'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { usePortalStore } from '@/stores/portal-store'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalNav } from '@/components/portal/PortalNav'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Flame,
  Dumbbell,
  Heart,
  Zap,
  Timer,
  Loader2
} from 'lucide-react'

// Types
interface Session {
  id: string
  date: string
  time: string
  title: string
  type: string
  coach: string
  spots: number
  max_spots: number
  duration: number
  is_booked?: boolean
  description?: string
}

// Helpers
const getTypeConfig = (type: string) => {
  const configs: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
    crossnfit: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Flame },
    crosstraining: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Flame },
    power: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Dumbbell },
    build: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Dumbbell },
    musculation: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Dumbbell },
    cardio: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Heart },
    hyrox: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Zap },
    hyrox_long: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Zap },
    hyrox_team: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Zap },
    tactical: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Zap },
    recuperation: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Heart },
    open: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Timer }
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

// Composant session card
function SessionCard({ session, onBook, isBooking }: {
  session: Session
  onBook: (id: string, action: 'book' | 'cancel') => void
  isBooking: string | null
}) {
  const typeConfig = getTypeConfig(session.type)
  const Icon = typeConfig.icon
  const spotsLeft = session.spots
  const isAlmostFull = spotsLeft <= 2
  const isFull = spotsLeft === 0
  const isLoading = isBooking === session.id

  return (
    <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {/* Time column */}
          <div className="w-20 flex-shrink-0 bg-slate-900/50 p-3 flex flex-col items-center justify-center border-r border-slate-700">
            <span className="text-lg font-bold text-white">{session.time}</span>
            <span className="text-xs text-slate-400">{session.duration} min</span>
          </div>

          {/* Content */}
          <div className="flex-1 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{session.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-[10px] ${typeConfig.color}`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {session.type}
                  </Badge>
                  {session.coach && (
                    <span className="text-xs text-slate-400">Coach {session.coach}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 text-xs">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span className={isAlmostFull ? 'text-orange-400' : 'text-slate-400'}>
                  {spotsLeft} place{spotsLeft > 1 ? 's' : ''} restante{spotsLeft > 1 ? 's' : ''}
                </span>
              </div>

              {session.is_booked ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => onBook(session.id, 'cancel')}
                  className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Inscrit'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={isFull || isLoading}
                  onClick={() => onBook(session.id, 'book')}
                  className={isFull ? 'bg-slate-700 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-700'}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isFull ? 'Complet' : 'Reserver'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant jour
function DayView({ date, sessions, onBook, isBooking }: {
  date: Date
  sessions: Session[]
  onBook: (id: string, action: 'book' | 'cancel') => void
  isBooking: string | null
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
            <SessionCard key={session.id} session={session} onBook={onBook} isBooking={isBooking} />
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
  const [isBooking, setIsBooking] = useState<string | null>(null)

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

  // Book/Cancel session
  const handleBook = async (sessionId: string, action: 'book' | 'cancel') => {
    if (!linkedMember) return

    setIsBooking(sessionId)
    try {
      const response = await fetch('/api/portal/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action })
      })

      if (response.ok) {
        // Refresh sessions to get updated data
        await fetchSessions()
      }
    } catch (error) {
      console.error('Failed to book/cancel session:', error)
    } finally {
      setIsBooking(null)
    }
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
                  onBook={handleBook}
                  isBooking={isBooking}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <PortalNav />
    </div>
  )
}
