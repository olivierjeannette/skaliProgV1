'use client'

import { useState, useMemo } from 'react'
import { usePortalStore } from '@/stores/portal-store'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalNav } from '@/components/portal/PortalNav'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  Flame,
  Dumbbell,
  Heart,
  Zap,
  Timer
} from 'lucide-react'

// Types
interface Session {
  id: string
  date: string
  time: string
  title: string
  type: 'CrossTraining' | 'Musculation' | 'Cardio' | 'Hyrox' | 'Recuperation' | 'Open'
  coach: string
  spots: number
  maxSpots: number
  duration: number
  location?: string
  isBooked?: boolean
}

// Mock data - sera remplace par API
const mockSessions: Session[] = [
  {
    id: '1',
    date: '2026-02-04',
    time: '06:30',
    title: 'CrossTraining - AMRAP 20',
    type: 'CrossTraining',
    coach: 'Alex',
    spots: 8,
    maxSpots: 12,
    duration: 60,
    isBooked: true
  },
  {
    id: '2',
    date: '2026-02-04',
    time: '12:00',
    title: 'Musculation - Upper Body',
    type: 'Musculation',
    coach: 'Julie',
    spots: 3,
    maxSpots: 10,
    duration: 75
  },
  {
    id: '3',
    date: '2026-02-04',
    time: '18:30',
    title: 'WOD - Murph Prep',
    type: 'CrossTraining',
    coach: 'Alex',
    spots: 10,
    maxSpots: 12,
    duration: 60,
    isBooked: false
  },
  {
    id: '4',
    date: '2026-02-05',
    time: '07:00',
    title: 'Hyrox Training',
    type: 'Hyrox',
    coach: 'Marc',
    spots: 6,
    maxSpots: 8,
    duration: 90
  },
  {
    id: '5',
    date: '2026-02-05',
    time: '19:00',
    title: 'Open Gym',
    type: 'Open',
    coach: 'Tous',
    spots: 15,
    maxSpots: 20,
    duration: 120
  },
  {
    id: '6',
    date: '2026-02-06',
    time: '12:15',
    title: 'Cardio Express',
    type: 'Cardio',
    coach: 'Julie',
    spots: 2,
    maxSpots: 10,
    duration: 30
  },
  {
    id: '7',
    date: '2026-02-06',
    time: '18:00',
    title: 'Stretching & Recovery',
    type: 'Recuperation',
    coach: 'Sophie',
    spots: 8,
    maxSpots: 15,
    duration: 45
  }
]

// Helpers
const getTypeConfig = (type: Session['type']) => {
  const configs = {
    CrossTraining: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Flame },
    Musculation: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Dumbbell },
    Cardio: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Heart },
    Hyrox: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Zap },
    Recuperation: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Heart },
    Open: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Timer }
  }
  return configs[type] || configs.Open
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
function SessionCard({ session, onBook }: { session: Session; onBook: (id: string) => void }) {
  const typeConfig = getTypeConfig(session.type)
  const Icon = typeConfig.icon
  const spotsLeft = session.maxSpots - session.spots
  const isAlmostFull = spotsLeft <= 2
  const isFull = spotsLeft === 0

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
                  <span className="text-xs text-slate-400">Coach {session.coach}</span>
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

              {session.isBooked ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Inscrit
                </Badge>
              ) : (
                <Button
                  size="sm"
                  disabled={isFull}
                  onClick={() => onBook(session.id)}
                  className={isFull ? 'bg-slate-700 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-700'}
                >
                  {isFull ? 'Complet' : 'Reserver'}
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
function DayView({ date, sessions, onBook }: { date: Date; sessions: Session[]; onBook: (id: string) => void }) {
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
            <SessionCard key={session.id} session={session} onBook={onBook} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PlanningPage() {
  const { linkedMember } = usePortalStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sessions] = useState<Session[]>(mockSessions)

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

  // Book session
  const handleBook = (sessionId: string) => {
    // TODO: Appeler API pour reserver
    console.log('Booking session:', sessionId)
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

        {/* Sessions by day */}
        <div className="space-y-6">
          {weekDates.map((date) => (
            <div key={date.toISOString()} id={`day-${date.toISOString().split('T')[0]}`}>
              <DayView
                date={date}
                sessions={getSessionsForDay(date)}
                onBook={handleBook}
              />
            </div>
          ))}
        </div>
      </main>

      <PortalNav />
    </div>
  )
}
