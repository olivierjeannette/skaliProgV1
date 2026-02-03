'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMemberStore, usePokemonStore } from '@/store/member-store'
import { CardGallery } from '@/components/pokemon'
import { LoadingSpinner } from '@/components/common'
import * as queries from '@/lib/supabase/queries'
import type { Performance } from '@/types'

export default function GalleryPage() {
  const { members, loadAllMembers, isLoadingMember } = useMemberStore()
  const { cards, generateCards, isLoading: cardsLoading } = usePokemonStore()

  // Load all members and their performances
  useEffect(() => {
    async function loadData() {
      // Load members if not already loaded
      if (members.length === 0) {
        await loadAllMembers()
      }
    }
    loadData()
  }, [members.length, loadAllMembers])

  // Generate cards when members are loaded
  useEffect(() => {
    async function generateAllCards() {
      if (members.length > 0 && cards.size === 0) {
        // Load all performances
        const result = await queries.getPerformances()
        if (result.success && result.data) {
          // Group performances by member
          const performancesMap = new Map<string, Performance[]>()
          for (const perf of result.data) {
            const existing = performancesMap.get(perf.member_id) || []
            performancesMap.set(perf.member_id, [...existing, perf])
          }

          // Generate cards
          generateCards(members, performancesMap)
        }
      }
    }
    generateAllCards()
  }, [members, cards.size, generateCards])

  if (isLoadingMember || cardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Chargement de la galerie..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">
          Galerie des Cartes
        </h1>
        <p className="text-gray-400">
          Découvrez les cartes Pokémon de tous les athlètes
        </p>
      </motion.div>

      {/* Card Gallery */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <CardGallery />
      </motion.div>
    </div>
  )
}
