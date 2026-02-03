'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMemberStore, usePokemonStore } from '@/store/member-store'
import { PokemonCard } from '@/components/pokemon'
import { GlassCard, LoadingSpinner, NoPerformances } from '@/components/common'
import { Trophy, Target, TrendingUp, Calendar } from 'lucide-react'

export default function HomePage() {
  const { currentMember, performances } = useMemberStore()
  const { currentCard, generateCurrentCard, isLoading } = usePokemonStore()

  // Generate card when performances are loaded
  useEffect(() => {
    if (currentMember && performances.length > 0 && !currentCard) {
      generateCurrentCard(currentMember, performances)
    }
  }, [currentMember, performances, currentCard, generateCurrentCard])

  if (!currentMember) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Chargement du profil..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Bienvenue, {currentMember.name} ! 👋
        </h1>
        <p className="text-gray-400">
          Votre tableau de bord personnalisé
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pokemon Card Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="h-full">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Votre Carte Pokémon
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" message="Génération de la carte..." />
              </div>
            ) : currentCard ? (
              <div className="flex justify-center">
                <PokemonCard card={currentCard} variant="fullscreen" />
              </div>
            ) : performances.length === 0 ? (
              <NoPerformances />
            ) : (
              <div className="text-center py-12 text-gray-400">
                Carte en cours de génération...
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard variant="hover" padding="md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {performances.length}
                  </p>
                  <p className="text-sm text-gray-400">Performances</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard variant="hover" padding="md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {currentCard?.level || '-'}
                  </p>
                  <p className="text-sm text-gray-400">Niveau</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Recent Activity */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-skali-accent" />
              Activité Récente
            </h3>

            {performances.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                Aucune activité récente
              </p>
            ) : (
              <div className="space-y-3">
                {performances.slice(0, 5).map((perf) => (
                  <div
                    key={perf.id}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {perf.exercise_name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(perf.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-skali-accent">
                        {perf.value} {perf.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Member Info */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">
              Informations
            </h3>
            <div className="space-y-2 text-sm">
              {currentMember.weight && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Poids</span>
                  <span className="text-white font-medium">
                    {currentMember.weight} kg
                  </span>
                </div>
              )}
              {currentMember.height && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Taille</span>
                  <span className="text-white font-medium">
                    {currentMember.height} cm
                  </span>
                </div>
              )}
              {currentCard && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type Pokémon</span>
                    <span className="text-white font-medium capitalize">
                      {currentCard.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Évolution</span>
                    <span className="text-white font-medium capitalize">
                      {currentCard.evolution_stage}
                    </span>
                  </div>
                </>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
