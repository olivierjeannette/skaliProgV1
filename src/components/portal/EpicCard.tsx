'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import {
  EpicCharacter,
  RARITY_CONFIG,
  CLASS_CONFIG,
  calculateStats
} from '@/config/epic-cards'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface EpicCardProps {
  memberName: string
  character: EpicCharacter
  level: number
  xp: number
  xpToNextLevel: number
  sessionCount?: number
  prCount?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// ============ PARTICLE SYSTEMS ============

function FireParticles({ count, intensity }: { count: number; intensity: number }) {
  const particles = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      size: 2 + Math.random() * 4
    })), [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-fire-rise"
          style={{
            left: `${p.left}%`,
            bottom: '-10%',
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, #fbbf24 0%, #f97316 40%, #ef4444 70%, transparent 100%)`,
            boxShadow: `0 0 ${p.size * 2}px #f97316`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: intensity
          }}
        />
      ))}
    </div>
  )
}

function IceParticles({ count, intensity }: { count: number; intensity: number }) {
  const particles = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
      size: 1 + Math.random() * 3
    })), [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-ice-float"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: '#e0f2fe',
            boxShadow: `0 0 ${p.size * 3}px #38bdf8`,
            borderRadius: '50%',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: intensity
          }}
        />
      ))}
      {/* Frost overlay */}
      <div
        className="absolute inset-0 animate-frost-breath"
        style={{
          background: 'radial-gradient(ellipse at bottom, rgba(56, 189, 248, 0.1) 0%, transparent 70%)',
          opacity: intensity * 0.5
        }}
      />
    </div>
  )
}

function LightningParticles({ intensity }: { count: number; intensity: number }) {
  const [bolts, setBolts] = useState<{ id: number; path: string; opacity: number }[]>([])

  useEffect(() => {
    const generateBolt = () => {
      const startX = 20 + Math.random() * 60
      let path = `M ${startX} 0`
      let y = 0
      while (y < 100) {
        y += 5 + Math.random() * 15
        const x = startX + (Math.random() - 0.5) * 30
        path += ` L ${x} ${y}`
      }
      return path
    }

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newBolt = { id: Date.now(), path: generateBolt(), opacity: 1 }
        setBolts(prev => [...prev.slice(-3), newBolt])
        setTimeout(() => {
          setBolts(prev => prev.filter(b => b.id !== newBolt.id))
        }, 200)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full">
        {bolts.map((bolt) => (
          <path
            key={bolt.id}
            d={bolt.path}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
            style={{
              filter: 'drop-shadow(0 0 8px #8b5cf6) drop-shadow(0 0 16px #7c3aed)',
              opacity: bolt.opacity * intensity
            }}
          />
        ))}
      </svg>
      {/* Electric glow at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 animate-electric-pulse"
        style={{
          background: 'linear-gradient(to top, rgba(139, 92, 246, 0.3), transparent)',
          opacity: intensity
        }}
      />
    </div>
  )
}

function SparkleParticles({ count, color, intensity }: { count: number; color: string; intensity: number }) {
  const particles = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 1.5 + Math.random() * 2,
      size: 2 + Math.random() * 4
    })), [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <Sparkles
          key={p.id}
          className="absolute animate-sparkle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size * 4,
            height: p.size * 4,
            color: color,
            filter: `drop-shadow(0 0 ${p.size}px ${color})`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: intensity
          }}
        />
      ))}
    </div>
  )
}

function SmokeParticles({ count, intensity }: { count: number; intensity: number }) {
  const particles = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      size: 20 + Math.random() * 40
    })), [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-smoke-rise"
          style={{
            left: `${p.left}%`,
            bottom: '-20%',
            width: p.size,
            height: p.size,
            background: 'radial-gradient(circle, rgba(100, 100, 100, 0.3) 0%, transparent 70%)',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: intensity * 0.5
          }}
        />
      ))}
    </div>
  )
}

function StarParticles({ count, intensity }: { count: number; intensity: number }) {
  const particles = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
      size: 1 + Math.random() * 2
    })), [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Nebula background */}
      <div
        className="absolute inset-0 animate-nebula"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)
          `,
          opacity: intensity
        }}
      />
      {/* Stars */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-star-twinkle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: '#fff',
            boxShadow: `0 0 ${p.size * 3}px #fff, 0 0 ${p.size * 6}px #c7d2fe`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: intensity
          }}
        />
      ))}
    </div>
  )
}

// ============ PARTICLE RENDERER ============

function ParticleSystem({ character, intensity }: { character: EpicCharacter; intensity: number }) {
  const rarityConfig = RARITY_CONFIG[character.rarity]
  const count = rarityConfig.particleCount

  switch (character.effects.particles) {
    case 'fire':
      return <FireParticles count={count} intensity={intensity} />
    case 'ice':
      return <IceParticles count={count} intensity={intensity} />
    case 'lightning':
      return <LightningParticles count={count} intensity={intensity} />
    case 'sparkles':
      return <SparkleParticles count={count} color={character.colors.secondary} intensity={intensity} />
    case 'smoke':
      return <SmokeParticles count={count} intensity={intensity} />
    case 'stars':
      return <StarParticles count={count} intensity={intensity} />
    default:
      return null
  }
}

// ============ HOLOGRAPHIC OVERLAY ============

function HolographicOverlay({ active }: { active: boolean; colors: EpicCharacter['colors'] }) {
  if (!active) return null

  return (
    <>
      {/* Rainbow shimmer */}
      <div
        className="absolute inset-0 pointer-events-none animate-holo-shimmer"
        style={{
          background: `linear-gradient(
            105deg,
            transparent 20%,
            rgba(255, 0, 0, 0.1) 25%,
            rgba(255, 165, 0, 0.1) 30%,
            rgba(255, 255, 0, 0.1) 35%,
            rgba(0, 255, 0, 0.1) 40%,
            rgba(0, 0, 255, 0.1) 45%,
            rgba(128, 0, 128, 0.1) 50%,
            transparent 55%
          )`,
          backgroundSize: '200% 200%',
          mixBlendMode: 'overlay'
        }}
      />
      {/* Glossy reflection */}
      <div
        className="absolute inset-0 pointer-events-none animate-holo-reflect"
        style={{
          background: `linear-gradient(
            135deg,
            transparent 40%,
            rgba(255, 255, 255, 0.2) 45%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0.2) 55%,
            transparent 60%
          )`,
          backgroundSize: '200% 200%'
        }}
      />
    </>
  )
}

// ============ AURA EFFECT ============

function AuraEffect({ active, color, intensity }: { active: boolean; color: string; intensity: number }) {
  if (!active) return null

  return (
    <div
      className="absolute -inset-4 rounded-3xl animate-aura-pulse pointer-events-none"
      style={{
        background: `radial-gradient(circle, ${color}40 0%, ${color}20 40%, transparent 70%)`,
        filter: `blur(${20 * intensity}px)`,
        opacity: intensity
      }}
    />
  )
}

// ============ STAT BAR ============

function StatBar({
  value,
  maxValue,
  color,
  animated
}: {
  value: number
  maxValue: number
  color: string
  animated: boolean
}) {
  const percentage = Math.min((value / maxValue) * 100, 100)

  return (
    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-1000",
          animated && "animate-stat-fill"
        )}
        style={{
          width: `${percentage}%`,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          boxShadow: `0 0 8px ${color}60`
        }}
      />
    </div>
  )
}

// ============ MAIN CARD COMPONENT ============

export function EpicCard({
  memberName,
  character,
  level,
  xp,
  xpToNextLevel,
  sessionCount = 0,
  prCount = 0,
  className,
  size = 'md'
}: EpicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const rarityConfig = RARITY_CONFIG[character.rarity]
  const classConfig = CLASS_CONFIG[character.cardClass]
  const stats = calculateStats(character, level)
  const glowIntensity = rarityConfig.glowIntensity

  // 3D tilt effect
  const handleMove = (clientX: number, clientY: number) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const maxRotation = 15
    const rotateX = ((clientY - centerY) / (rect.height / 2)) * -maxRotation
    const rotateY = ((clientX - centerX) / (rect.width / 2)) * maxRotation
    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY)
  }
  const handleLeave = () => {
    setRotation({ x: 0, y: 0 })
    setIsHovered(false)
  }

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const statsList = [
    { key: 'strength', name: 'STR', value: stats.strength, color: '#ef4444' },
    { key: 'endurance', name: 'END', value: stats.endurance, color: '#22c55e' },
    { key: 'speed', name: 'SPD', value: stats.speed, color: '#eab308' },
    { key: 'technique', name: 'TEC', value: stats.technique, color: '#3b82f6' },
    { key: 'power', name: 'PWR', value: stats.power, color: '#f97316' }
  ]

  const sizeClasses = {
    sm: 'max-w-[280px]',
    md: 'max-w-[340px]',
    lg: 'max-w-[400px]'
  }

  return (
    <div
      className={cn("relative w-full mx-auto", sizeClasses[size], className)}
      style={{ perspective: '1200px' }}
    >
      {/* Aura effect (behind card) */}
      <AuraEffect
        active={character.effects.aura}
        color={character.colors.glow}
        intensity={isHovered ? glowIntensity : glowIntensity * 0.5}
      />

      <div
        ref={cardRef}
        className={cn(
          "relative transition-all duration-300 ease-out cursor-pointer",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.02 : 1})`,
          transformStyle: 'preserve-3d'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleLeave}
      >
        {/* Outer glow */}
        <div
          className="absolute -inset-1 rounded-2xl transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${character.colors.primary}, ${character.colors.secondary}, ${character.colors.primary})`,
            opacity: isHovered ? 1 : 0.7,
            filter: `blur(${isHovered ? 8 : 4}px)`
          }}
        />

        {/* Main card */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            border: `${rarityConfig.borderWidth}px solid ${character.colors.secondary}`,
            boxShadow: `
              0 0 ${20 * glowIntensity}px ${character.colors.glow}40,
              0 0 ${40 * glowIntensity}px ${character.colors.glow}20,
              inset 0 0 ${30 * glowIntensity}px ${character.colors.primary}20
            `
          }}
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${character.colors.primary} 0%, #0f172a 50%, ${character.colors.primary}40 100%)`
            }}
          />

          {/* Particle system */}
          <ParticleSystem character={character} intensity={glowIntensity} />

          {/* Content */}
          <div className="relative">
            {/* Header - simplifié */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background: `linear-gradient(180deg, ${character.colors.primary}80 0%, transparent 100%)`
              }}
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate drop-shadow-lg">
                  {memberName}
                </h3>
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: character.colors.secondary }}
                >
                  {character.name}
                </span>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-2xl font-black text-white drop-shadow-lg">
                  Nv.{level}
                </span>
                <div
                  className="text-xs font-bold px-2 py-0.5 rounded-full mt-1"
                  style={{
                    background: `${character.colors.secondary}30`,
                    color: character.colors.secondary,
                    border: `1px solid ${character.colors.secondary}50`
                  }}
                >
                  {rarityConfig.nameFr}
                </div>
              </div>
            </div>

            {/* Character video/image area - VIDEO PURE sans filtre */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <div className="absolute inset-0">
                {character.videoUrl ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      transform: `scale(${isHovered ? 1.05 : 1})`,
                      transition: 'transform 0.5s ease-out'
                    }}
                  >
                    <source src={character.videoUrl.replace(/\.(mp4|webm)$/, '.webm')} type="video/webm" />
                    <source src={character.videoUrl.replace(/\.(mp4|webm)$/, '.mp4')} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={character.imageUrl}
                    alt={character.name}
                    fill
                    className="object-cover"
                    style={{
                      transform: `scale(${isHovered ? 1.05 : 1})`,
                      transition: 'transform 0.5s ease-out'
                    }}
                  />
                )}
              </div>

              {/* Holographic overlay (leger, optionnel) */}
              <HolographicOverlay active={character.effects.holographic} colors={character.colors} />
            </div>

            {/* XP Bar - simplifié */}
            <div
              className="px-4 py-2"
              style={{ background: `${character.colors.primary}40` }}
            >
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">XP</span>
                <span style={{ color: character.colors.secondary }}>
                  {xp.toLocaleString()}/{xpToNextLevel.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${(xp / xpToNextLevel) * 100}%`,
                    background: `linear-gradient(90deg, ${character.colors.primary}, ${character.colors.secondary})`,
                    boxShadow: `0 0 10px ${character.colors.glow}`
                  }}
                />
              </div>
            </div>

            {/* Stats grid - simplifié sans icônes */}
            <div className="px-4 py-3 bg-slate-900/80 grid grid-cols-5 gap-2">
              {statsList.map((stat) => {
                const isPrimary = classConfig.primaryStat === stat.key
                return (
                  <div
                    key={stat.key}
                    className={cn(
                      "text-center p-1.5 rounded-lg transition-all",
                      isPrimary && "bg-slate-800/50"
                    )}
                    style={{
                      boxShadow: isPrimary ? `inset 0 0 0 1px ${character.colors.secondary}50` : undefined
                    }}
                  >
                    <div className="text-[9px] text-slate-500 font-medium">{stat.name}</div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: isPrimary ? character.colors.secondary : '#fff' }}
                    >
                      {stat.value}
                    </div>
                    <StatBar
                      value={stat.value}
                      maxValue={150}
                      color={stat.color}
                      animated={character.effects.animated}
                    />
                  </div>
                )
              })}
            </div>

            {/* Footer - simplifié */}
            <div
              className="px-4 py-2 flex justify-between items-center text-xs"
              style={{
                background: `linear-gradient(180deg, transparent 0%, ${character.colors.primary}30 100%)`,
                borderTop: `1px solid ${character.colors.secondary}20`
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400">{sessionCount} seances</span>
                <span className="font-bold" style={{ color: character.colors.secondary }}>{prCount} PRs</span>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded"
                style={{
                  background: `${character.colors.primary}50`,
                  color: character.colors.accent
                }}
              >
                {character.title}
              </span>
            </div>

            {/* Quote */}
            <div
              className="px-4 py-2 text-center"
              style={{ background: `${character.colors.primary}20` }}
            >
              <p
                className="text-xs italic opacity-70 truncate"
                style={{ color: character.colors.accent }}
              >
                {character.quote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ MINI CARD VERSION ============

export function EpicCardMini({
  memberName,
  character,
  level,
  onClick
}: {
  memberName: string
  character: EpicCharacter
  level: number
  onClick?: () => void
}) {
  const rarityConfig = RARITY_CONFIG[character.rarity]
  const classConfig = CLASS_CONFIG[character.cardClass]

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
      )}
      style={{
        border: `${Math.max(rarityConfig.borderWidth - 1, 1)}px solid ${character.colors.secondary}60`,
        boxShadow: `0 0 ${10 * rarityConfig.glowIntensity}px ${character.colors.glow}30`
      }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${character.colors.primary} 0%, #0f172a 100%)`
        }}
      />

      {/* Content */}
      <div className="relative p-3 flex items-center gap-3">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${character.colors.primary}80, ${character.colors.secondary}40)`,
            boxShadow: `0 4px 15px ${character.colors.glow}40`
          }}
        >
          <span className="text-2xl">{classConfig.icon}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">{memberName}</p>
          <p
            className="text-xs truncate"
            style={{ color: character.colors.secondary }}
          >
            {character.name}
          </p>
        </div>

        {/* Level */}
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-black text-white">Nv.{level}</div>
          <div
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: `${character.colors.secondary}30`,
              color: character.colors.secondary
            }}
          >
            {rarityConfig.nameFr}
          </div>
        </div>
      </div>
    </div>
  )
}
