'use client'

import { useRouter } from 'next/navigation'
import { usePortalStore, THEME_OPTIONS } from '@/stores/portal-store'
import { EpicCard } from '@/components/portal/EpicCard'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalNav } from '@/components/portal/PortalNav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Calendar,
  Dumbbell,
  Trophy,
  TrendingUp,
  ChevronRight,
  Clock,
  Flame,
  Shuffle
} from 'lucide-react'

// Quick action card
function QuickAction({
  icon: Icon,
  label,
  description,
  href,
  badge
}: {
  icon: React.ElementType
  label: string
  description: string
  href: string
  badge?: string
}) {
  const router = useRouter()

  return (
    <Card
      className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-800/70 transition-colors active:scale-[0.98]"
      onClick={() => router.push(href)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 rounded-lg bg-emerald-500/10">
          <Icon className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-white">{label}</h3>
            {badge && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-500" />
      </CardContent>
    </Card>
  )
}

// Today's session preview
function TodaySession() {
  const router = useRouter()

  // Mock - sera remplace par API
  const todaySession = {
    time: '18:30',
    title: 'WOD - Murph Prep',
    type: 'CrossTraining',
    coach: 'Alex',
    duration: 60,
    isBooked: true
  }

  return (
    <Card
      className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 cursor-pointer hover:from-emerald-500/30 hover:to-teal-500/30 transition-colors active:scale-[0.98]"
      onClick={() => router.push('/portal/planning')}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-emerald-400 font-medium">Prochaine seance</span>
          <Badge className="bg-emerald-500/30 text-emerald-300 border-emerald-500/50 text-xs">
            Aujourd&apos;hui
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center min-w-[50px]">
            <Clock className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
            <span className="text-lg font-bold text-white">{todaySession.time}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white">{todaySession.title}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{todaySession.duration} min</span>
              <span>•</span>
              <span>Coach {todaySession.coach}</span>
            </div>
          </div>
          {todaySession.isBooked && (
            <Badge className="bg-white/10 text-white border-white/20">
              Inscrit
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PortalPage() {
  const { linkedMember, epicCharacter, memberStats, refreshStats } = usePortalStore()

  if (!linkedMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-slate-800/80 border-slate-700 p-6">
          <div className="text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-slate-500" />
            <h2 className="text-xl font-bold text-white mb-2">Profil non lie</h2>
            <p className="text-slate-400">Veuillez lier votre profil</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <PortalHeader showRefresh onRefresh={refreshStats} />

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {/* Welcome */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1">
            Bienvenue, {linkedMember.firstName || linkedMember.name} !
          </h1>
          <p className="text-slate-400 text-sm">Voici votre carte de heros</p>
        </div>

        {/* Epic Card */}
        {epicCharacter && memberStats && (
          <EpicCard
            memberName={linkedMember.firstName || linkedMember.name}
            character={epicCharacter}
            level={memberStats.level}
            xp={memberStats.xp}
            xpToNextLevel={memberStats.xpToNextLevel}
            sessionCount={memberStats.sessionCount}
            prCount={memberStats.prCount}
          />
        )}

        {/* Refresh button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={refreshStats}
          >
            <Shuffle className="h-4 w-4" />
            Nouvelle carte
          </Button>
        </div>

        {/* Today's session */}
        <TodaySession />

        {/* Quick actions */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-slate-400">Acces rapide</h2>
          <QuickAction
            icon={Calendar}
            label="Planning"
            description="Voir les prochaines seances"
            href="/portal/planning"
          />
          <QuickAction
            icon={Dumbbell}
            label="Mes WODs"
            description="Historique de vos entrainements"
            href="/portal/workouts"
            badge={memberStats ? `${memberStats.sessionCount}` : undefined}
          />
          <QuickAction
            icon={Trophy}
            label="Performance"
            description="Vos stats et records personnels"
            href="/portal/performance"
            badge={memberStats ? `${memberStats.prCount} PRs` : undefined}
          />
          <QuickAction
            icon={User}
            label="Mon Profil"
            description="Parametres et informations"
            href="/portal/profile"
          />
        </div>

        {/* Stats summary */}
        {memberStats && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
                <div className="text-lg font-bold text-white">{memberStats.level}</div>
                <div className="text-[10px] text-slate-400">Niveau</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3 text-center">
                <Dumbbell className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                <div className="text-lg font-bold text-white">{memberStats.sessionCount}</div>
                <div className="text-[10px] text-slate-400">Seances</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3 text-center">
                <Flame className="h-5 w-5 mx-auto mb-1 text-orange-400" />
                <div className="text-lg font-bold text-white">{memberStats.prCount}</div>
                <div className="text-[10px] text-slate-400">PRs</div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <PortalNav />
    </div>
  )
}
