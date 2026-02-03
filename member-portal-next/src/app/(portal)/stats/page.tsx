'use client'

import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useMemberStore, usePokemonStore } from '@/store/member-store'
import {
  GlassCard,
  LoadingSpinner,
  EmptyState,
} from '@/components/common'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Activity,
  Award,
  Calendar,
  Zap,
  Dumbbell,
  Heart,
  Timer,
  Trophy,
  Flame,
  Star,
} from 'lucide-react'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

// Category colors
const CATEGORY_COLORS = {
  cardio: { bg: 'bg-red-500/20', text: 'text-red-400', chart: 'rgb(239, 68, 68)' },
  force: { bg: 'bg-blue-500/20', text: 'text-blue-400', chart: 'rgb(59, 130, 246)' },
  gym: { bg: 'bg-purple-500/20', text: 'text-purple-400', chart: 'rgb(168, 85, 247)' },
  puissance: { bg: 'bg-amber-500/20', text: 'text-amber-400', chart: 'rgb(245, 158, 11)' },
}

// Category icons
const CATEGORY_ICONS = {
  cardio: Heart,
  force: Dumbbell,
  gym: Activity,
  puissance: Zap,
}

export default function StatsPage() {
  const { currentMember, performances, goals, isLoadingPerformances, isLoadingGoals } = useMemberStore()
  const { currentCard, generateCurrentCard } = usePokemonStore()

  const categoryChartRef = useRef<HTMLCanvasElement>(null)
  const progressChartRef = useRef<HTMLCanvasElement>(null)
  const categoryChartInstance = useRef<Chart | null>(null)
  const progressChartInstance = useRef<Chart | null>(null)

  // Generate Pokemon card for stats
  useEffect(() => {
    if (currentMember && performances.length > 0 && !currentCard) {
      generateCurrentCard(currentMember, performances)
    }
  }, [currentMember, performances, currentCard, generateCurrentCard])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!performances || performances.length === 0) {
      return null
    }

    // Count by category
    const categoryCount = performances.reduce((acc, perf) => {
      const cat = perf.category || 'gym'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Recent performances (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentPerformances = performances.filter(
      (p) => new Date(p.date) >= thirtyDaysAgo
    )

    // Monthly performances (grouped by month)
    const monthlyData = performances.reduce((acc, perf) => {
      const month = new Date(perf.date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
      })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Goals stats
    const goalsStats = {
      total: goals.length,
      achieved: goals.filter((g) => g.status === 'achieved').length,
      inProgress: goals.filter((g) => g.status === 'in_progress').length,
      pending: goals.filter((g) => g.status === 'pending').length,
      failed: goals.filter((g) => g.status === 'failed').length,
    }

    // Calculate streak (consecutive days with performances)
    const sortedDates = [...new Set(performances.map((p) => p.date))].sort()
    let currentStreak = 0
    let maxStreak = 0
    let tempStreak = 1

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1])
      const currDate = new Date(sortedDates[i])
      const diffDays = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 1) {
        tempStreak++
      } else {
        maxStreak = Math.max(maxStreak, tempStreak)
        tempStreak = 1
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak)

    // Check current streak
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
      currentStreak = tempStreak
    }

    return {
      totalPerformances: performances.length,
      recentCount: recentPerformances.length,
      categoryCount,
      monthlyData,
      goalsStats,
      currentStreak,
      maxStreak,
      averagePerWeek: Math.round((recentPerformances.length / 4) * 10) / 10,
    }
  }, [performances, goals])

  // Initialize charts
  useEffect(() => {
    if (!stats) return

    // Category Distribution Chart (Doughnut)
    if (categoryChartRef.current) {
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy()
      }

      const ctx = categoryChartRef.current.getContext('2d')
      if (ctx) {
        categoryChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Cardio', 'Force', 'Gym', 'Puissance'],
            datasets: [
              {
                data: [
                  stats.categoryCount.cardio || 0,
                  stats.categoryCount.force || 0,
                  stats.categoryCount.gym || 0,
                  stats.categoryCount.puissance || 0,
                ],
                backgroundColor: [
                  'rgba(239, 68, 68, 0.8)',
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(168, 85, 247, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                ],
                borderColor: [
                  'rgba(239, 68, 68, 1)',
                  'rgba(59, 130, 246, 1)',
                  'rgba(168, 85, 247, 1)',
                  'rgba(245, 158, 11, 1)',
                ],
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: 'rgba(255, 255, 255, 0.8)',
                  padding: 20,
                  usePointStyle: true,
                },
              },
            },
            cutout: '65%',
          },
        })
      }
    }

    // Monthly Progress Chart (Bar)
    if (progressChartRef.current) {
      if (progressChartInstance.current) {
        progressChartInstance.current.destroy()
      }

      const ctx = progressChartRef.current.getContext('2d')
      if (ctx) {
        const months = Object.keys(stats.monthlyData).slice(-6)
        const values = months.map((m) => stats.monthlyData[m])

        progressChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: months,
            datasets: [
              {
                label: 'Performances',
                data: values,
                backgroundColor: 'rgba(82, 199, 89, 0.6)',
                borderColor: 'rgba(82, 199, 89, 1)',
                borderWidth: 2,
                borderRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.6)',
                },
              },
              y: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.6)',
                },
                beginAtZero: true,
              },
            },
          },
        })
      }
    }

    return () => {
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy()
      }
      if (progressChartInstance.current) {
        progressChartInstance.current.destroy()
      }
    }
  }, [stats])

  if (isLoadingPerformances || isLoadingGoals) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Chargement des statistiques..." />
      </div>
    )
  }

  if (!stats || stats.totalPerformances === 0) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Statistiques</h1>
          <p className="text-gray-400">Vue d'ensemble de vos performances</p>
        </motion.div>

        <EmptyState
          icon={Activity}
          title="Aucune donnee disponible"
          description="Commencez a enregistrer vos performances pour voir vos statistiques"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Statistiques</h1>
        <p className="text-gray-400">Vue d'ensemble de vos performances</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Total Performances */}
        <GlassCard padding="sm" variant="hover">
          <div className="text-center">
            <div className="w-12 h-12 bg-skali-green/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-skali-green" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalPerformances}</p>
            <p className="text-sm text-gray-400">Performances totales</p>
          </div>
        </GlassCard>

        {/* This Month */}
        <GlassCard padding="sm" variant="hover">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.recentCount}</p>
            <p className="text-sm text-gray-400">Ces 30 derniers jours</p>
          </div>
        </GlassCard>

        {/* Current Streak */}
        <GlassCard padding="sm" variant="hover">
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Flame className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.currentStreak}</p>
            <p className="text-sm text-gray-400">Serie actuelle (jours)</p>
          </div>
        </GlassCard>

        {/* Max Streak */}
        <GlassCard padding="sm" variant="hover">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.maxStreak}</p>
            <p className="text-sm text-gray-400">Meilleure serie</p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-skali-green" />
              Repartition par categorie
            </h3>
            <div className="h-64">
              <canvas ref={categoryChartRef} />
            </div>
          </GlassCard>
        </motion.div>

        {/* Monthly Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-skali-green" />
              Progression mensuelle
            </h3>
            <div className="h-64">
              <canvas ref={progressChartRef} />
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Goals Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-skali-green" />
            Progression des objectifs
          </h3>

          {stats.goalsStats.total > 0 ? (
            <>
              {/* Goals Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Taux de reussite</span>
                  <span className="text-white font-medium">
                    {Math.round(
                      (stats.goalsStats.achieved / stats.goalsStats.total) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full flex">
                    <div
                      className="bg-green-500 transition-all duration-500"
                      style={{
                        width: `${
                          (stats.goalsStats.achieved / stats.goalsStats.total) * 100
                        }%`,
                      }}
                    />
                    <div
                      className="bg-blue-500 transition-all duration-500"
                      style={{
                        width: `${
                          (stats.goalsStats.inProgress / stats.goalsStats.total) * 100
                        }%`,
                      }}
                    />
                    <div
                      className="bg-gray-500 transition-all duration-500"
                      style={{
                        width: `${
                          (stats.goalsStats.pending / stats.goalsStats.total) * 100
                        }%`,
                      }}
                    />
                    <div
                      className="bg-red-500 transition-all duration-500"
                      style={{
                        width: `${
                          (stats.goalsStats.failed / stats.goalsStats.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Goals Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-500/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {stats.goalsStats.achieved}
                  </p>
                  <p className="text-sm text-gray-400">Atteints</p>
                </div>
                <div className="bg-blue-500/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {stats.goalsStats.inProgress}
                  </p>
                  <p className="text-sm text-gray-400">En cours</p>
                </div>
                <div className="bg-gray-500/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-400">
                    {stats.goalsStats.pending}
                  </p>
                  <p className="text-sm text-gray-400">En attente</p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-400">
                    {stats.goalsStats.failed}
                  </p>
                  <p className="text-sm text-gray-400">Echoues</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun objectif defini</p>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-skali-green" />
            Detail par categorie
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(CATEGORY_COLORS) as Array<keyof typeof CATEGORY_COLORS>).map(
              (category) => {
                const count = stats.categoryCount[category] || 0
                const percentage =
                  stats.totalPerformances > 0
                    ? Math.round((count / stats.totalPerformances) * 100)
                    : 0
                const colors = CATEGORY_COLORS[category]
                const Icon = CATEGORY_ICONS[category]

                return (
                  <div
                    key={category}
                    className={`${colors.bg} rounded-xl p-4`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                      <span className="text-white font-medium capitalize">
                        {category}
                      </span>
                    </div>
                    <p className={`text-3xl font-bold ${colors.text}`}>{count}</p>
                    <p className="text-sm text-gray-400">{percentage}% du total</p>
                  </div>
                )
              }
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Pokemon Card Stats */}
      {currentCard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-skali-green" />
              Statistiques de votre carte
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(currentCard.stats).map(([stat, value]) => (
                <div key={stat} className="text-center">
                  <div className="h-2 bg-gray-700 rounded-full mb-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-skali-green to-skali-accent transition-all duration-500"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-xs text-gray-400 uppercase">{stat}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-glass-border flex flex-wrap gap-4 justify-center text-sm">
              <span className="px-3 py-1 bg-gray-800/50 rounded-full text-gray-300">
                Niveau {currentCard.level}
              </span>
              <span className="px-3 py-1 bg-gray-800/50 rounded-full text-gray-300 capitalize">
                {currentCard.evolution_stage}
              </span>
              <span className="px-3 py-1 bg-gray-800/50 rounded-full text-gray-300 capitalize">
                {currentCard.rarity}
              </span>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
