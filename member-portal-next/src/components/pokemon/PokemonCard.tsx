'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getTypeConfig, getRarityInfo, POKEMON_TYPES } from '@/lib/utils/pokemon'
import type { PokemonCard as PokemonCardType } from '@/types'
import { Download, RefreshCw, Maximize2 } from 'lucide-react'

// ============================================
// TYPES
// ============================================

interface PokemonCardProps {
  card: PokemonCardType
  variant?: 'mini' | 'medium' | 'fullscreen' | 'export'
  onClick?: () => void
  onRefresh?: () => void
  onDownload?: () => void
  className?: string
}

// ============================================
// STAT BAR COMPONENT
// ============================================

function StatBar({
  label,
  value,
  maxValue = 100,
  color,
}: {
  label: string
  value: number
  maxValue?: number
  color: string
}) {
  const percentage = Math.min((value / maxValue) * 100, 100)

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-gray-400 w-8">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-bold text-white w-6 text-right">
        {value}
      </span>
    </div>
  )
}

// ============================================
// MINI CARD (Gallery View)
// ============================================

function MiniCard({
  card,
  onClick,
  className,
}: {
  card: PokemonCardType
  onClick?: () => void
  className?: string
}) {
  const typeConfig = getTypeConfig(card.type)
  const rarityInfo = getRarityInfo(card.level)

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative cursor-pointer rounded-xl overflow-hidden',
        'bg-gradient-to-br from-gray-800 to-gray-900',
        'border border-glass-border shadow-card',
        'transition-shadow hover:shadow-card-hover',
        className
      )}
    >
      {/* Type gradient overlay */}
      <div
        className={cn('absolute inset-0 opacity-20 bg-gradient-to-br', typeConfig.gradient)}
      />

      {/* Rarity glow for legendary/epic */}
      {(rarityInfo.tier === 'legendary' || rarityInfo.tier === 'epic') && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse',
            rarityInfo.tier === 'legendary' ? 'bg-amber-500/10' : 'bg-purple-500/10'
          )}
        />
      )}

      <div className="relative p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white truncate max-w-[60%]">
            {card.member_name}
          </span>
          <span className="text-xs font-bold" style={{ color: typeConfig.color }}>
            Lv.{card.level}
          </span>
        </div>

        {/* Pokemon Image */}
        <div className="relative aspect-square mb-2">
          <Image
            src={card.image_url}
            alt={card.pokemon_name}
            fill
            className="object-contain drop-shadow-lg"
            onError={(e) => {
              // Fallback to default image
              (e.target as HTMLImageElement).src = '/images/pokemon-placeholder.png'
            }}
          />
        </div>

        {/* Pokemon Name & Type */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">{card.pokemon_name}</span>
          <div
            className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white"
            style={{ backgroundColor: typeConfig.color }}
          >
            {typeConfig.name}
          </div>
        </div>

        {/* HP */}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[10px] text-gray-500">HP</span>
          <span className="text-xs font-bold text-red-400">{card.hp}</span>
        </div>
      </div>

      {/* Rarity indicator */}
      <div
        className={cn(
          'absolute top-2 right-2 w-2 h-2 rounded-full',
          rarityInfo.tier === 'legendary' && 'bg-amber-400 animate-pulse',
          rarityInfo.tier === 'epic' && 'bg-purple-400 animate-pulse',
          rarityInfo.tier === 'rare' && 'bg-blue-400',
          rarityInfo.tier === 'uncommon' && 'bg-green-400',
          rarityInfo.tier === 'common' && 'bg-gray-400'
        )}
      />
    </motion.div>
  )
}

// ============================================
// MEDIUM CARD (Detail View)
// ============================================

function MediumCard({
  card,
  onRefresh,
  onDownload,
  className,
}: {
  card: PokemonCardType
  onRefresh?: () => void
  onDownload?: () => void
  className?: string
}) {
  const typeConfig = getTypeConfig(card.type)
  const rarityInfo = getRarityInfo(card.level)

  return (
    <div
      className={cn(
        'relative w-full max-w-sm rounded-2xl overflow-hidden',
        'bg-gradient-to-br from-gray-800 to-gray-900',
        'border-2 shadow-xl',
        className
      )}
      style={{ borderColor: typeConfig.color }}
    >
      {/* Type gradient header */}
      <div
        className={cn('p-4 bg-gradient-to-r', typeConfig.gradient)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{card.member_name}</h3>
            <p className="text-sm text-white/70">{card.pokemon_name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">Lv.{card.level}</div>
            <div className={cn('text-sm font-bold', rarityInfo.color)}>
              {rarityInfo.label}
            </div>
          </div>
        </div>
      </div>

      {/* Pokemon Image */}
      <div className="relative aspect-square p-4 bg-gradient-to-b from-transparent to-gray-900/50">
        <Image
          src={card.image_url}
          alt={card.pokemon_name}
          fill
          className="object-contain drop-shadow-2xl p-4"
        />

        {/* HP Badge */}
        <div className="absolute top-2 right-2 bg-red-500 px-3 py-1 rounded-full">
          <span className="text-xs text-white/70">HP</span>
          <span className="text-lg font-black text-white ml-1">{card.hp}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-2 bg-gray-900/50">
        <StatBar label="ATK" value={card.stats.attack} color="#ef4444" />
        <StatBar label="DEF" value={card.stats.defense} color="#3b82f6" />
        <StatBar label="SPD" value={card.stats.speed} color="#f59e0b" />
        <StatBar label="END" value={card.stats.endurance} color="#22c55e" />
        <StatBar label="TEC" value={card.stats.technique} color="#a855f7" />
      </div>

      {/* Attacks */}
      <div className="p-4 border-t border-gray-700/50">
        <h4 className="text-xs font-bold text-gray-400 mb-2">ATTAQUES</h4>
        <div className="space-y-2">
          {card.attacks.map((attack, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2"
            >
              <span className="text-sm font-medium text-white">{attack.name}</span>
              <span className="text-sm font-bold text-red-400">{attack.damage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {(onRefresh || onDownload) && (
        <div className="p-4 border-t border-gray-700/50 flex gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-skali-accent/20 hover:bg-skali-accent/30 rounded-lg transition-colors text-sm text-skali-accent"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
          )}
        </div>
      )}

      {/* Evolution Badge */}
      <div className="absolute bottom-4 left-4 text-[10px] text-gray-500">
        {card.evolution_stage.toUpperCase()}
      </div>
    </div>
  )
}

// ============================================
// FULLSCREEN CARD (Home Display)
// ============================================

function FullscreenCard({
  card,
  className,
}: {
  card: PokemonCardType
  className?: string
}) {
  const typeConfig = getTypeConfig(card.type)
  const rarityInfo = getRarityInfo(card.level)

  return (
    <div
      className={cn(
        'relative w-full max-w-md mx-auto',
        'rounded-3xl overflow-hidden',
        'bg-gradient-to-br from-gray-800 to-gray-900',
        'border-4 shadow-2xl',
        rarityInfo.tier === 'legendary' && 'border-amber-400 shadow-amber-500/30',
        rarityInfo.tier === 'epic' && 'border-purple-400 shadow-purple-500/30',
        rarityInfo.tier === 'rare' && 'border-blue-400',
        rarityInfo.tier === 'uncommon' && 'border-green-400',
        rarityInfo.tier === 'common' && 'border-gray-400',
        className
      )}
    >
      {/* Animated background for legendary/epic */}
      {(rarityInfo.tier === 'legendary' || rarityInfo.tier === 'epic') && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-shimmer" />
      )}

      {/* Type gradient header */}
      <div className={cn('p-6 bg-gradient-to-r relative', typeConfig.gradient)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white drop-shadow-lg">
              {card.member_name}
            </h2>
            <p className="text-white/80 font-medium">{card.pokemon_name}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white drop-shadow-lg">
              Lv.{card.level}
            </div>
            <div className={cn('text-sm font-bold', rarityInfo.color)}>
              {rarityInfo.label}
            </div>
          </div>
        </div>
      </div>

      {/* Pokemon Image - Large */}
      <div className="relative aspect-square p-8 bg-gradient-to-b from-transparent to-gray-900/50">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-full h-full"
        >
          <Image
            src={card.image_url}
            alt={card.pokemon_name}
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>

        {/* HP Badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 rounded-full shadow-lg">
          <span className="text-sm text-white/80">HP</span>
          <span className="text-2xl font-black text-white ml-2">{card.hp}</span>
        </div>

        {/* Type Badge */}
        <div
          className="absolute top-4 left-4 px-3 py-1.5 rounded-full shadow-lg text-white font-bold text-sm"
          style={{ backgroundColor: typeConfig.color }}
        >
          {typeConfig.icon} {typeConfig.name}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 bg-gray-900/50">
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: 'ATK', value: card.stats.attack, color: '#ef4444' },
            { label: 'DEF', value: card.stats.defense, color: '#3b82f6' },
            { label: 'SPD', value: card.stats.speed, color: '#f59e0b' },
            { label: 'END', value: card.stats.endurance, color: '#22c55e' },
            { label: 'TEC', value: card.stats.technique, color: '#a855f7' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-xl font-black"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-[10px] font-bold text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Attacks */}
        <div className="space-y-2">
          {card.attacks.map((attack, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ backgroundColor: typeConfig.color }}
                >
                  ⚔
                </div>
                <span className="font-bold text-white">{attack.name}</span>
              </div>
              <span className="text-lg font-black text-red-400">
                {attack.damage}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-900 flex items-center justify-between text-xs text-gray-500">
        <span>Skàli Prog</span>
        <span>{card.evolution_stage.toUpperCase()}</span>
      </div>
    </div>
  )
}

// ============================================
// MAIN EXPORT
// ============================================

export function PokemonCard({
  card,
  variant = 'mini',
  onClick,
  onRefresh,
  onDownload,
  className,
}: PokemonCardProps) {
  switch (variant) {
    case 'mini':
      return <MiniCard card={card} onClick={onClick} className={className} />
    case 'medium':
      return (
        <MediumCard
          card={card}
          onRefresh={onRefresh}
          onDownload={onDownload}
          className={className}
        />
      )
    case 'fullscreen':
      return <FullscreenCard card={card} className={className} />
    default:
      return <MiniCard card={card} onClick={onClick} className={className} />
  }
}

// Export variants for direct use
export { MiniCard, MediumCard, FullscreenCard }
