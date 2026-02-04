'use client'

import { useState, useRef, useEffect } from 'react'
import {
  EpicCharacter,
  TIER_CONFIG,
  calculateFinalStats,
  UNIVERSE_OPTIONS
} from '@/config/epic-cards'
import { Badge } from '@/components/ui/badge'
import {
  Sword,
  Heart,
  Zap,
  Target,
  Flame,
  Star,
  Sparkles
} from 'lucide-react'

interface EpicCardProps {
  memberName: string
  character: EpicCharacter
  level: number
  xp: number
  xpToNextLevel: number
  baseStats: {
    strength: number
    endurance: number
    speed: number
    technique: number
    power: number
  }
  sessionCount?: number
  prCount?: number
}

// Composant particules animees
function ParticleField({ color, count = 20 }: { color: string; count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full animate-float"
          style={{
            backgroundColor: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.4,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  )
}

// Background anime selon l'univers
function UniverseBackground({ character }: { character: EpicCharacter }) {
  const getBackgroundElements = () => {
    switch (character.universe) {
      case 'lotr':
        return (
          <>
            {/* Montagnes + anneau */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            <svg className="absolute bottom-0 left-0 right-0 h-24 text-slate-800" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,100 L50,40 L100,70 L150,20 L200,50 L250,10 L300,60 L350,30 L400,100 Z" fill="currentColor" />
            </svg>
            <div
              className="absolute top-8 right-8 w-12 h-12 rounded-full border-4 animate-pulse"
              style={{ borderColor: character.colors.secondary, boxShadow: `0 0 20px ${character.colors.secondary}` }}
            />
          </>
        )
      case 'starwars':
        return (
          <>
            {/* Etoiles + lightsaber glow */}
            <div className="absolute inset-0">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 3}s`
                  }}
                />
              ))}
            </div>
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1 h-32 rounded-full"
              style={{
                background: `linear-gradient(to top, transparent, ${character.colors.secondary})`,
                boxShadow: `0 0 15px ${character.colors.secondary}`
              }}
            />
          </>
        )
      case 'harrypotter':
        return (
          <>
            {/* Magie + etoiles */}
            <ParticleField color={character.colors.secondary} count={15} />
            <Sparkles
              className="absolute top-6 left-6 h-8 w-8 animate-pulse"
              style={{ color: character.colors.secondary }}
            />
            <Sparkles
              className="absolute bottom-12 right-8 h-6 w-6 animate-pulse delay-500"
              style={{ color: character.colors.secondary }}
            />
          </>
        )
      case 'got':
        return (
          <>
            {/* Neige / braise */}
            <ParticleField color="#ffffff" count={25} />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 to-transparent" />
          </>
        )
      case 'villain':
        return (
          <>
            {/* Flammes / energie sombre */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-950/50 via-transparent to-transparent" />
            <ParticleField color={character.colors.secondary} count={30} />
            <div
              className="absolute bottom-0 left-0 right-0 h-20"
              style={{
                background: `linear-gradient(to top, ${character.colors.secondary}30, transparent)`
              }}
            />
          </>
        )
      default:
        return null
    }
  }

  return <>{getBackgroundElements()}</>
}

export function EpicCard({
  memberName,
  character,
  level,
  xp,
  xpToNextLevel,
  baseStats,
  sessionCount = 0,
  prCount = 0
}: EpicCardProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const tierConfig = TIER_CONFIG[character.tier]
  const finalStats = calculateFinalStats(baseStats, character)

  // Effet 3D au mouvement de souris/touch
  const handleMove = (clientX: number, clientY: number) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const rotateX = ((clientY - centerY) / (rect.height / 2)) * -15
    const rotateY = ((clientX - centerX) / (rect.width / 2)) * 15
    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 })
    setIsHovered(false)
  }

  const stats = [
    { name: 'STR', label: 'Force', value: finalStats.strength, icon: Sword, color: 'text-red-400' },
    { name: 'END', label: 'Endurance', value: finalStats.endurance, icon: Heart, color: 'text-green-400' },
    { name: 'SPD', label: 'Vitesse', value: finalStats.speed, icon: Zap, color: 'text-yellow-400' },
    { name: 'TEC', label: 'Technique', value: finalStats.technique, icon: Target, color: 'text-blue-400' },
    { name: 'PWR', label: 'Puissance', value: finalStats.power, icon: Flame, color: 'text-orange-400' }
  ]

  const getUniverseEmoji = (universe: string) => {
    const found = UNIVERSE_OPTIONS.find(u => u.id === universe)
    return found?.emoji || '🎭'
  }

  const getUniverseIcon = (universe: string) => {
    switch (universe) {
      case 'lotr': return '🧙'
      case 'starwars': return '⚔️'
      case 'harrypotter': return '🪄'
      case 'got': return '🐺'
      case 'villain': return '💀'
      default: return '🎭'
    }
  }

  const getTierGlow = () => {
    switch (character.tier) {
      case 'legendary': return '0 0 40px rgba(251,191,36,0.6), 0 0 80px rgba(251,191,36,0.3)'
      case 'epic': return '0 0 30px rgba(168,85,247,0.5), 0 0 60px rgba(168,85,247,0.2)'
      case 'rare': return '0 0 25px rgba(59,130,246,0.4)'
      default: return 'none'
    }
  }

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        className="relative transition-transform duration-200 ease-out cursor-pointer"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) ${isHovered ? 'scale(1.02)' : 'scale(1)'}`,
          transformStyle: 'preserve-3d'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
      >
        {/* Halo/Glow effect */}
        <div
          className="absolute -inset-2 rounded-3xl blur-xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle, ${character.colors.secondary}40, transparent 70%)`,
            opacity: isHovered ? 1 : 0.5
          }}
        />

        {/* Main card */}
        <div
          className={`relative rounded-2xl overflow-hidden ${tierConfig.borderStyle}`}
          style={{ boxShadow: getTierGlow() }}
        >
          {/* Background gradient + universe elements */}
          <div className={`bg-gradient-to-br ${character.colors.gradient} p-1`}>
            <div className="bg-slate-900/90 backdrop-blur rounded-xl overflow-hidden">

              {/* Header */}
              <div
                className="px-4 py-3 flex items-center justify-between relative"
                style={{ backgroundColor: character.colors.primary + '50' }}
              >
                <div className="z-10">
                  <h3 className="text-lg font-bold text-white drop-shadow-lg">{memberName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg">{getUniverseIcon(character.universe)}</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: character.colors.secondary }}
                    >
                      {character.name}
                    </span>
                  </div>
                </div>
                <div className="text-right z-10">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5" style={{ color: character.colors.secondary }} />
                    <span className="text-2xl font-bold text-white drop-shadow-lg">Nv.{level}</span>
                  </div>
                  <Badge
                    className="text-[10px] px-2 py-0 backdrop-blur-sm"
                    style={{
                      backgroundColor: character.colors.secondary + '40',
                      color: character.colors.secondary,
                      borderColor: character.colors.secondary
                    }}
                  >
                    {tierConfig.nameFr}
                  </Badge>
                </div>
              </div>

              {/* Character visual area - FIGURINE STYLE */}
              <div
                className={`aspect-[4/3] relative bg-gradient-to-br ${character.colors.gradient} overflow-hidden`}
              >
                {/* Animated background */}
                <UniverseBackground character={character} />

                {/* Socle/plateforme */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-8">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: `radial-gradient(ellipse, ${character.colors.primary}80, transparent)`,
                      boxShadow: `0 0 30px ${character.colors.secondary}40`
                    }}
                  />
                </div>

                {/* Figurine/Character silhouette */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  {/* Aura effect */}
                  <div
                    className="absolute -inset-4 rounded-full animate-pulse"
                    style={{
                      background: `radial-gradient(circle, ${character.colors.secondary}30, transparent 70%)`
                    }}
                  />

                  {/* Character figure */}
                  <div
                    className="relative w-28 h-28 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${character.colors.primary}, ${character.colors.secondary}40)`,
                      boxShadow: `0 10px 40px ${character.colors.primary}80, inset 0 -5px 20px ${character.colors.secondary}40`
                    }}
                  >
                    <span className="text-5xl drop-shadow-2xl">{getUniverseIcon(character.universe)}</span>
                  </div>

                  {/* Title plate */}
                  <div
                    className="mt-3 px-4 py-1 rounded-full backdrop-blur-md"
                    style={{
                      backgroundColor: character.colors.primary + '90',
                      boxShadow: `0 4px 15px ${character.colors.primary}60`
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: character.colors.secondary }}
                    >
                      {character.title}
                    </span>
                  </div>
                </div>

                {/* Holographic overlay for legendary/epic */}
                {(character.tier === 'legendary' || character.tier === 'epic') && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, transparent 40%, ${character.colors.secondary}10 50%, transparent 60%)`,
                      mixBlendMode: 'overlay'
                    }}
                  />
                )}
              </div>

              {/* XP Bar */}
              <div className="px-4 py-2" style={{ backgroundColor: character.colors.primary + '30' }}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Experience</span>
                  <span>{xp}/{xpToNextLevel} XP</span>
                </div>
                <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${(xp / xpToNextLevel) * 100}%`,
                      background: `linear-gradient(90deg, ${character.colors.primary}, ${character.colors.secondary})`,
                      boxShadow: `0 0 10px ${character.colors.secondary}`
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="px-4 py-3 grid grid-cols-5 gap-2 bg-slate-900/70">
                {stats.map((stat) => (
                  <div key={stat.name} className="text-center group">
                    <div className="relative">
                      <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color} transition-transform group-hover:scale-125`} />
                    </div>
                    <div className="text-[10px] text-slate-500">{stat.name}</div>
                    <div className="text-sm font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className="px-4 py-2 flex justify-between items-center text-xs border-t"
                style={{
                  backgroundColor: character.colors.primary + '20',
                  borderColor: character.colors.secondary + '30'
                }}
              >
                <div className="flex items-center gap-1 text-slate-400">
                  <span>{sessionCount}</span>
                  <span>seances</span>
                </div>
                <div
                  className="font-bold"
                  style={{ color: character.colors.secondary }}
                >
                  {prCount} PRs
                </div>
              </div>

              {/* Quote teaser */}
              <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800">
                <p className="text-xs text-slate-500 italic truncate">
                  &quot;{character.quote.substring(0, 50)}...&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Version mini pour les listes
export function EpicCardMini({
  memberName,
  character,
  level
}: {
  memberName: string
  character: EpicCharacter
  level: number
}) {
  const tierConfig = TIER_CONFIG[character.tier]
  const getUniverseIcon = (universe: string) => {
    switch (universe) {
      case 'lotr': return '🧙'
      case 'starwars': return '⚔️'
      case 'harrypotter': return '🪄'
      case 'got': return '🐺'
      case 'villain': return '💀'
      default: return '🎭'
    }
  }

  return (
    <div className={`rounded-lg overflow-hidden ${tierConfig.borderStyle} hover:scale-105 transition-transform`}>
      <div className={`bg-gradient-to-br ${character.colors.gradient} p-0.5`}>
        <div className="bg-slate-900/90 rounded-md p-3 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${character.colors.primary}, ${character.colors.secondary}40)`,
              boxShadow: `0 4px 15px ${character.colors.primary}60`
            }}
          >
            <span className="text-xl">{getUniverseIcon(character.universe)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{memberName}</p>
            <p className="text-xs truncate" style={{ color: character.colors.secondary }}>
              {character.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-white">Nv.{level}</div>
            <Badge
              className="text-[9px] px-1.5 py-0"
              style={{
                backgroundColor: character.colors.secondary + '30',
                color: character.colors.secondary
              }}
            >
              {tierConfig.nameFr}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
