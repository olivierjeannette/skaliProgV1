/**
 * Systeme de cartes "Heros Epiques" v2
 * Personnages generiques inspires d'archetypes fantasy/sci-fi
 * Effets holographiques, 3D, animations premium
 */

export type CardClass =
  | 'warrior'      // Guerrier - Force brute
  | 'mage'         // Mage - Intelligence/Technique
  | 'ranger'       // Rodeur - Vitesse/Precision
  | 'paladin'      // Paladin - Equilibre/Tank
  | 'assassin'     // Assassin - Agilite/Critique
  | 'berserker'    // Berserker - Puissance extreme
  | 'guardian'     // Gardien - Defense/Endurance
  | 'mystic'       // Mystique - Sagesse/Puissance cachee

export type CardRarity = 'legendary' | 'epic' | 'rare' | 'common' | 'starter'

export type CardTheme = 'fire' | 'ice' | 'lightning' | 'nature' | 'shadow' | 'light' | 'cosmic' | 'blood'

// URL de base pour les videos
// Option 1: Locales dans /public/videos/cards (recommandé pour Vercel)
// Option 2: VPS externe via NEXT_PUBLIC_VPS_VIDEO_URL
export const VIDEO_BASE_URL = process.env.NEXT_PUBLIC_VPS_VIDEO_URL || '/videos/cards'

export interface EpicCharacter {
  id: string
  name: string
  title: string
  cardClass: CardClass
  rarity: CardRarity
  theme: CardTheme
  quote: string
  // Image depuis Unsplash/Pexels (libres de droits)
  imageUrl: string
  // Video de fond (optionnel, hebergee sur VPS)
  videoUrl?: string
  // Stats de base (multipliees par le niveau)
  baseStats: {
    strength: number   // Force
    endurance: number  // Endurance
    speed: number      // Vitesse
    technique: number  // Technique
    power: number      // Puissance
  }
  // Couleurs du theme
  colors: {
    primary: string
    secondary: string
    accent: string
    glow: string
  }
  // Effets speciaux
  effects: {
    particles: 'fire' | 'ice' | 'lightning' | 'sparkles' | 'smoke' | 'stars' | 'none'
    aura: boolean
    holographic: boolean
    animated: boolean
  }
}

// Configuration des raretes
export const RARITY_CONFIG: Record<CardRarity, {
  name: string
  nameFr: string
  minPercentile: number
  maxPercentile: number
  xpMultiplier: number
  glowIntensity: number
  borderWidth: number
  particleCount: number
}> = {
  legendary: {
    name: 'Legendary',
    nameFr: 'Legendaire',
    minPercentile: 95,
    maxPercentile: 100,
    xpMultiplier: 2.0,
    glowIntensity: 1.0,
    borderWidth: 4,
    particleCount: 50
  },
  epic: {
    name: 'Epic',
    nameFr: 'Epique',
    minPercentile: 80,
    maxPercentile: 94,
    xpMultiplier: 1.5,
    glowIntensity: 0.7,
    borderWidth: 3,
    particleCount: 35
  },
  rare: {
    name: 'Rare',
    nameFr: 'Rare',
    minPercentile: 50,
    maxPercentile: 79,
    xpMultiplier: 1.25,
    glowIntensity: 0.5,
    borderWidth: 2,
    particleCount: 20
  },
  common: {
    name: 'Common',
    nameFr: 'Commun',
    minPercentile: 20,
    maxPercentile: 49,
    xpMultiplier: 1.0,
    glowIntensity: 0.3,
    borderWidth: 2,
    particleCount: 10
  },
  starter: {
    name: 'Starter',
    nameFr: 'Novice',
    minPercentile: 0,
    maxPercentile: 19,
    xpMultiplier: 0.8,
    glowIntensity: 0.1,
    borderWidth: 1,
    particleCount: 5
  }
}

// Configuration des classes
export const CLASS_CONFIG: Record<CardClass, {
  name: string
  nameFr: string
  icon: string
  description: string
  primaryStat: keyof EpicCharacter['baseStats']
}> = {
  warrior: {
    name: 'Warrior',
    nameFr: 'Guerrier',
    icon: '⚔️',
    description: 'Maitre des armes',
    primaryStat: 'strength'
  },
  mage: {
    name: 'Mage',
    nameFr: 'Mage',
    icon: '🔮',
    description: 'Maitre des arcanes',
    primaryStat: 'technique'
  },
  ranger: {
    name: 'Ranger',
    nameFr: 'Rodeur',
    icon: '🏹',
    description: 'Oeil de faucon',
    primaryStat: 'speed'
  },
  paladin: {
    name: 'Paladin',
    nameFr: 'Paladin',
    icon: '🛡️',
    description: 'Bouclier sacre',
    primaryStat: 'endurance'
  },
  assassin: {
    name: 'Assassin',
    nameFr: 'Assassin',
    icon: '🗡️',
    description: 'Frappe mortelle',
    primaryStat: 'speed'
  },
  berserker: {
    name: 'Berserker',
    nameFr: 'Berserker',
    icon: '🔥',
    description: 'Rage incontrôlable',
    primaryStat: 'power'
  },
  guardian: {
    name: 'Guardian',
    nameFr: 'Gardien',
    icon: '🏰',
    description: 'Mur infranchissable',
    primaryStat: 'endurance'
  },
  mystic: {
    name: 'Mystic',
    nameFr: 'Mystique',
    icon: '✨',
    description: 'Secrets anciens',
    primaryStat: 'power'
  }
}

/**
 * Helper: Genere l'URL video pour un personnage
 * Les fichiers doivent etre dans /public/videos/cards/{id}.webm (et .mp4 en fallback)
 */
export function getVideoUrl(characterId: string): string {
  return `${VIDEO_BASE_URL}/${characterId}`
}

// Personnages epiques (sans videoUrl - ajouté dynamiquement)
const CHARACTERS_DATA: Omit<EpicCharacter, 'videoUrl'>[] = [
  // ============ LEGENDARY - Les Titans ============
  {
    id: 'phoenix-lord',
    name: 'Seigneur Phenix',
    title: 'Flamme Eternelle',
    cardClass: 'berserker',
    rarity: 'legendary',
    theme: 'fire',
    quote: '"De mes cendres, je renais plus fort."',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    baseStats: { strength: 95, endurance: 80, speed: 85, technique: 75, power: 100 },
    colors: {
      primary: '#dc2626',
      secondary: '#f97316',
      accent: '#fbbf24',
      glow: '#ef4444'
    },
    effects: { particles: 'fire', aura: true, holographic: true, animated: true }
  },
  {
    id: 'frost-emperor',
    name: 'Empereur Givre',
    title: 'Zero Absolu',
    cardClass: 'mage',
    rarity: 'legendary',
    theme: 'ice',
    quote: '"Le froid preserve, le froid detruit."',
    imageUrl: 'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=800&q=80',
    baseStats: { strength: 70, endurance: 90, speed: 75, technique: 100, power: 95 },
    colors: {
      primary: '#0ea5e9',
      secondary: '#38bdf8',
      accent: '#e0f2fe',
      glow: '#06b6d4'
    },
    effects: { particles: 'ice', aura: true, holographic: true, animated: true }
  },
  {
    id: 'storm-titan',
    name: 'Titan Tempete',
    title: 'Maitre des Eclairs',
    cardClass: 'warrior',
    rarity: 'legendary',
    theme: 'lightning',
    quote: '"La foudre ne frappe jamais deux fois? Regarde bien."',
    imageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?w=800&q=80',
    baseStats: { strength: 100, endurance: 85, speed: 90, technique: 80, power: 95 },
    colors: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      accent: '#e9d5ff',
      glow: '#8b5cf6'
    },
    effects: { particles: 'lightning', aura: true, holographic: true, animated: true }
  },
  {
    id: 'void-walker',
    name: 'Marcheur du Vide',
    title: 'Entre les Mondes',
    cardClass: 'mystic',
    rarity: 'legendary',
    theme: 'cosmic',
    quote: '"L\'univers entier est mon terrain de jeu."',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
    baseStats: { strength: 75, endurance: 80, speed: 95, technique: 90, power: 100 },
    colors: {
      primary: '#1e1b4b',
      secondary: '#6366f1',
      accent: '#c7d2fe',
      glow: '#818cf8'
    },
    effects: { particles: 'stars', aura: true, holographic: true, animated: true }
  },

  // ============ EPIC - Les Champions ============
  {
    id: 'blade-dancer',
    name: 'Danseur de Lames',
    title: 'Mille Coupures',
    cardClass: 'assassin',
    rarity: 'epic',
    theme: 'shadow',
    quote: '"Tu ne verras pas la derniere."',
    imageUrl: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&q=80',
    baseStats: { strength: 75, endurance: 60, speed: 100, technique: 90, power: 70 },
    colors: {
      primary: '#18181b',
      secondary: '#71717a',
      accent: '#d4d4d8',
      glow: '#52525b'
    },
    effects: { particles: 'smoke', aura: true, holographic: true, animated: true }
  },
  {
    id: 'light-bringer',
    name: 'Porteur de Lumiere',
    title: 'Aube Radieuse',
    cardClass: 'paladin',
    rarity: 'epic',
    theme: 'light',
    quote: '"Meme l\'obscurite la plus profonde craint ma lumiere."',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    baseStats: { strength: 85, endurance: 95, speed: 70, technique: 80, power: 85 },
    colors: {
      primary: '#fbbf24',
      secondary: '#fde68a',
      accent: '#fef9c3',
      glow: '#f59e0b'
    },
    effects: { particles: 'sparkles', aura: true, holographic: true, animated: true }
  },
  {
    id: 'nature-warden',
    name: 'Gardien Nature',
    title: 'Coeur de la Foret',
    cardClass: 'guardian',
    rarity: 'epic',
    theme: 'nature',
    quote: '"La nature ne pardonne jamais."',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
    baseStats: { strength: 80, endurance: 100, speed: 65, technique: 85, power: 80 },
    colors: {
      primary: '#166534',
      secondary: '#4ade80',
      accent: '#bbf7d0',
      glow: '#22c55e'
    },
    effects: { particles: 'sparkles', aura: true, holographic: false, animated: true }
  },
  {
    id: 'blood-hunter',
    name: 'Chasseur de Sang',
    title: 'Predateur Ultime',
    cardClass: 'ranger',
    rarity: 'epic',
    theme: 'blood',
    quote: '"Je sens ta peur. Elle est delicieuse."',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    baseStats: { strength: 85, endurance: 75, speed: 95, technique: 85, power: 75 },
    colors: {
      primary: '#991b1b',
      secondary: '#f87171',
      accent: '#fecaca',
      glow: '#dc2626'
    },
    effects: { particles: 'smoke', aura: true, holographic: false, animated: true }
  },

  // ============ RARE - Les Veterans ============
  {
    id: 'iron-fist',
    name: 'Poing d\'Acier',
    title: 'Force Brute',
    cardClass: 'warrior',
    rarity: 'rare',
    theme: 'lightning',
    quote: '"Un coup suffit."',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
    baseStats: { strength: 90, endurance: 80, speed: 70, technique: 65, power: 80 },
    colors: {
      primary: '#374151',
      secondary: '#9ca3af',
      accent: '#e5e7eb',
      glow: '#6b7280'
    },
    effects: { particles: 'lightning', aura: false, holographic: false, animated: true }
  },
  {
    id: 'shadow-step',
    name: 'Pas d\'Ombre',
    title: 'Invisible',
    cardClass: 'assassin',
    rarity: 'rare',
    theme: 'shadow',
    quote: '"Tu ne m\'as pas vu venir."',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    baseStats: { strength: 65, endurance: 55, speed: 95, technique: 85, power: 60 },
    colors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#d1d5db',
      glow: '#4b5563'
    },
    effects: { particles: 'smoke', aura: false, holographic: false, animated: true }
  },
  {
    id: 'flame-keeper',
    name: 'Gardien Flamme',
    title: 'Braise Vivante',
    cardClass: 'mage',
    rarity: 'rare',
    theme: 'fire',
    quote: '"Le feu purifie tout."',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    baseStats: { strength: 60, endurance: 70, speed: 75, technique: 90, power: 85 },
    colors: {
      primary: '#ea580c',
      secondary: '#fb923c',
      accent: '#fed7aa',
      glow: '#f97316'
    },
    effects: { particles: 'fire', aura: false, holographic: false, animated: true }
  },
  {
    id: 'frost-archer',
    name: 'Archer Givre',
    title: 'Fleche Glaciale',
    cardClass: 'ranger',
    rarity: 'rare',
    theme: 'ice',
    quote: '"Chaque tir, un arret cardiaque."',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    baseStats: { strength: 55, endurance: 65, speed: 90, technique: 95, power: 70 },
    colors: {
      primary: '#0284c7',
      secondary: '#7dd3fc',
      accent: '#e0f2fe',
      glow: '#0ea5e9'
    },
    effects: { particles: 'ice', aura: false, holographic: false, animated: true }
  },

  // ============ COMMON - Les Guerriers ============
  {
    id: 'steel-guard',
    name: 'Garde d\'Acier',
    title: 'Sentinelle',
    cardClass: 'guardian',
    rarity: 'common',
    theme: 'light',
    quote: '"Je ne recule jamais."',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    baseStats: { strength: 70, endurance: 85, speed: 55, technique: 60, power: 65 },
    colors: {
      primary: '#475569',
      secondary: '#94a3b8',
      accent: '#cbd5e1',
      glow: '#64748b'
    },
    effects: { particles: 'none', aura: false, holographic: false, animated: false }
  },
  {
    id: 'wild-striker',
    name: 'Frappeur Sauvage',
    title: 'Instinct',
    cardClass: 'berserker',
    rarity: 'common',
    theme: 'fire',
    quote: '"RAAAAGH!"',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=800&q=80',
    baseStats: { strength: 80, endurance: 60, speed: 70, technique: 50, power: 75 },
    colors: {
      primary: '#78350f',
      secondary: '#d97706',
      accent: '#fde68a',
      glow: '#b45309'
    },
    effects: { particles: 'fire', aura: false, holographic: false, animated: false }
  },
  {
    id: 'swift-blade',
    name: 'Lame Rapide',
    title: 'Premier Sang',
    cardClass: 'assassin',
    rarity: 'common',
    theme: 'shadow',
    quote: '"Vite fait, bien fait."',
    imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80',
    baseStats: { strength: 60, endurance: 50, speed: 85, technique: 75, power: 55 },
    colors: {
      primary: '#27272a',
      secondary: '#71717a',
      accent: '#a1a1aa',
      glow: '#52525b'
    },
    effects: { particles: 'none', aura: false, holographic: false, animated: false }
  },
  {
    id: 'apprentice-mage',
    name: 'Apprenti Mage',
    title: 'Etudiant',
    cardClass: 'mage',
    rarity: 'common',
    theme: 'cosmic',
    quote: '"Je progresse chaque jour."',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    baseStats: { strength: 45, endurance: 55, speed: 65, technique: 80, power: 70 },
    colors: {
      primary: '#3730a3',
      secondary: '#818cf8',
      accent: '#c7d2fe',
      glow: '#6366f1'
    },
    effects: { particles: 'sparkles', aura: false, holographic: false, animated: false }
  },

  // ============ STARTER - Les Debutants ============
  {
    id: 'rookie-fighter',
    name: 'Combattant Rookie',
    title: 'Premiere Bataille',
    cardClass: 'warrior',
    rarity: 'starter',
    theme: 'light',
    quote: '"C\'est mon premier jour!"',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    baseStats: { strength: 50, endurance: 50, speed: 50, technique: 50, power: 50 },
    colors: {
      primary: '#64748b',
      secondary: '#94a3b8',
      accent: '#cbd5e1',
      glow: '#475569'
    },
    effects: { particles: 'none', aura: false, holographic: false, animated: false }
  },
  {
    id: 'trainee',
    name: 'Stagiaire',
    title: 'En Formation',
    cardClass: 'paladin',
    rarity: 'starter',
    theme: 'light',
    quote: '"Un jour, je serai legendaire."',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    baseStats: { strength: 45, endurance: 55, speed: 45, technique: 45, power: 40 },
    colors: {
      primary: '#78716c',
      secondary: '#a8a29e',
      accent: '#d6d3d1',
      glow: '#57534e'
    },
    effects: { particles: 'none', aura: false, holographic: false, animated: false }
  }
]

/**
 * EPIC_CHARACTERS avec videoUrl generee automatiquement
 * Les videos doivent etre dans /public/videos/cards/{id}.webm
 */
export const EPIC_CHARACTERS: EpicCharacter[] = CHARACTERS_DATA.map(char => ({
  ...char,
  videoUrl: getVideoUrl(char.id)
}))

/**
 * Determine la rarete selon le percentile de performance
 */
export function getRarityFromPercentile(percentile: number): CardRarity {
  if (percentile >= 95) return 'legendary'
  if (percentile >= 80) return 'epic'
  if (percentile >= 50) return 'rare'
  if (percentile >= 20) return 'common'
  return 'starter'
}

/**
 * Assigne un personnage selon les stats du membre
 */
export function assignCharacter(
  percentile: number,
  primaryStatType?: keyof EpicCharacter['baseStats']
): EpicCharacter {
  const rarity = getRarityFromPercentile(percentile)

  // Filtre par rarete
  let candidates = EPIC_CHARACTERS.filter(c => c.rarity === rarity)

  // Si stat principale specifiee, priorise la classe correspondante
  if (primaryStatType) {
    const matchingClass = Object.entries(CLASS_CONFIG).find(
      ([, config]) => config.primaryStat === primaryStatType
    )
    if (matchingClass) {
      const classCandidates = candidates.filter(c => c.cardClass === matchingClass[0])
      if (classCandidates.length > 0) {
        candidates = classCandidates
      }
    }
  }

  // Random parmi les candidats
  return candidates[Math.floor(Math.random() * candidates.length)] || candidates[0]
}

/**
 * Calcule les stats finales avec le niveau
 */
export function calculateStats(
  character: EpicCharacter,
  level: number
): EpicCharacter['baseStats'] {
  const multiplier = 1 + (level - 1) * 0.1 // +10% par niveau
  return {
    strength: Math.round(character.baseStats.strength * multiplier),
    endurance: Math.round(character.baseStats.endurance * multiplier),
    speed: Math.round(character.baseStats.speed * multiplier),
    technique: Math.round(character.baseStats.technique * multiplier),
    power: Math.round(character.baseStats.power * multiplier)
  }
}

/**
 * Themes disponibles pour le choix utilisateur
 */
export const THEME_OPTIONS = [
  { id: 'fire', name: 'Feu', emoji: '🔥', color: '#ef4444' },
  { id: 'ice', name: 'Glace', emoji: '❄️', color: '#06b6d4' },
  { id: 'lightning', name: 'Foudre', emoji: '⚡', color: '#8b5cf6' },
  { id: 'nature', name: 'Nature', emoji: '🌿', color: '#22c55e' },
  { id: 'shadow', name: 'Ombre', emoji: '🌑', color: '#52525b' },
  { id: 'light', name: 'Lumiere', emoji: '✨', color: '#fbbf24' },
  { id: 'cosmic', name: 'Cosmique', emoji: '🌌', color: '#818cf8' },
  { id: 'blood', name: 'Sang', emoji: '🩸', color: '#dc2626' }
] as const
