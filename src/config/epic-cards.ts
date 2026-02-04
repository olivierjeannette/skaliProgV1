/**
 * Systeme de cartes "Heros Epiques" v3
 * Personnages iconiques avec videos
 * Carte aleatoire assignee a chaque nouvelle performance
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

// URL de base pour les videos (locales dans /public/videos/cards)
export const VIDEO_BASE_URL = '/videos/cards'

export interface EpicCharacter {
  id: string
  name: string
  title: string
  cardClass: CardClass
  rarity: CardRarity
  theme: CardTheme
  quote: string
  // Video de fond
  videoUrl: string
  // Image fallback (si pas de video)
  imageUrl: string
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
  // Univers du personnage
  universe: 'star-wars' | 'marvel' | 'lotr' | 'dc' | 'other'
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
 * PERSONNAGES EPIC - Basés sur les vidéos disponibles
 */
export const EPIC_CHARACTERS: EpicCharacter[] = [
  // ============ LEGENDARY - Les Titans ============
  {
    id: 'darkvador',
    name: 'Dark Vador',
    title: 'Seigneur Sith',
    cardClass: 'berserker',
    rarity: 'legendary',
    theme: 'shadow',
    quote: '"Je suis ton pere."',
    videoUrl: `${VIDEO_BASE_URL}/darkvador.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=800&q=80',
    baseStats: { strength: 95, endurance: 90, speed: 75, technique: 85, power: 100 },
    colors: {
      primary: '#1a1a2e',
      secondary: '#e63946',
      accent: '#f4a261',
      glow: '#e63946'
    },
    effects: { particles: 'smoke', aura: true, holographic: true, animated: true },
    universe: 'star-wars'
  },
  {
    id: 'thanos',
    name: 'Thanos',
    title: 'Le Titan Fou',
    cardClass: 'mystic',
    rarity: 'legendary',
    theme: 'cosmic',
    quote: '"Je suis inevitable."',
    videoUrl: `${VIDEO_BASE_URL}/thanos.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&q=80',
    baseStats: { strength: 100, endurance: 95, speed: 70, technique: 80, power: 100 },
    colors: {
      primary: '#4a0e4e',
      secondary: '#c77dff',
      accent: '#ffd700',
      glow: '#9d4edd'
    },
    effects: { particles: 'stars', aura: true, holographic: true, animated: true },
    universe: 'marvel'
  },
  {
    id: 'Sauron',
    name: 'Sauron',
    title: 'Le Seigneur des Tenebres',
    cardClass: 'mystic',
    rarity: 'legendary',
    theme: 'fire',
    quote: '"Un Anneau pour les gouverner tous."',
    videoUrl: `${VIDEO_BASE_URL}/Sauron.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    baseStats: { strength: 90, endurance: 100, speed: 60, technique: 95, power: 100 },
    colors: {
      primary: '#1a0a0a',
      secondary: '#ff4500',
      accent: '#ffd700',
      glow: '#ff6600'
    },
    effects: { particles: 'fire', aura: true, holographic: true, animated: true },
    universe: 'lotr'
  },
  {
    id: 'Dieu',
    name: 'Zeus',
    title: 'Roi des Dieux',
    cardClass: 'mystic',
    rarity: 'legendary',
    theme: 'lightning',
    quote: '"Le tonnerre repond a ma volonte."',
    videoUrl: `${VIDEO_BASE_URL}/Dieu.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?w=800&q=80',
    baseStats: { strength: 85, endurance: 85, speed: 95, technique: 90, power: 100 },
    colors: {
      primary: '#1a1a3e',
      secondary: '#00d4ff',
      accent: '#ffffff',
      glow: '#7df9ff'
    },
    effects: { particles: 'lightning', aura: true, holographic: true, animated: true },
    universe: 'other'
  },

  // ============ EPIC - Les Champions ============
  {
    id: 'ironman',
    name: 'Iron Man',
    title: 'Genie Milliardaire',
    cardClass: 'mage',
    rarity: 'epic',
    theme: 'fire',
    quote: '"Je suis Iron Man."',
    videoUrl: `${VIDEO_BASE_URL}/ironman.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=800&q=80',
    baseStats: { strength: 80, endurance: 75, speed: 85, technique: 100, power: 90 },
    colors: {
      primary: '#8b0000',
      secondary: '#ffd700',
      accent: '#00d4ff',
      glow: '#ff4500'
    },
    effects: { particles: 'fire', aura: true, holographic: true, animated: true },
    universe: 'marvel'
  },
  {
    id: 'yoda',
    name: 'Yoda',
    title: 'Maitre Jedi',
    cardClass: 'mystic',
    rarity: 'epic',
    theme: 'nature',
    quote: '"Fais-le ou ne le fais pas. Il n\'y a pas d\'essai."',
    videoUrl: `${VIDEO_BASE_URL}/yoda.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=800&q=80',
    baseStats: { strength: 60, endurance: 80, speed: 95, technique: 100, power: 95 },
    colors: {
      primary: '#1a3a1a',
      secondary: '#90ee90',
      accent: '#ffffff',
      glow: '#00ff00'
    },
    effects: { particles: 'sparkles', aura: true, holographic: true, animated: true },
    universe: 'star-wars'
  },
  {
    id: 'aragorn',
    name: 'Aragorn',
    title: 'Roi du Gondor',
    cardClass: 'warrior',
    rarity: 'epic',
    theme: 'light',
    quote: '"Pour Frodon."',
    videoUrl: `${VIDEO_BASE_URL}/aragorn.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    baseStats: { strength: 90, endurance: 85, speed: 80, technique: 85, power: 80 },
    colors: {
      primary: '#2c3e50',
      secondary: '#bdc3c7',
      accent: '#f1c40f',
      glow: '#95a5a6'
    },
    effects: { particles: 'sparkles', aura: true, holographic: true, animated: true },
    universe: 'lotr'
  },
  {
    id: 'batman',
    name: 'Batman',
    title: 'Le Chevalier Noir',
    cardClass: 'assassin',
    rarity: 'epic',
    theme: 'shadow',
    quote: '"Je suis la nuit."',
    videoUrl: `${VIDEO_BASE_URL}/batman.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&q=80',
    baseStats: { strength: 85, endurance: 80, speed: 90, technique: 95, power: 75 },
    colors: {
      primary: '#0d0d0d',
      secondary: '#2c2c2c',
      accent: '#ffd700',
      glow: '#333333'
    },
    effects: { particles: 'smoke', aura: true, holographic: true, animated: true },
    universe: 'dc'
  },

  // ============ RARE - Les Veterans ============
  {
    id: 'spiderman',
    name: 'Spider-Man',
    title: 'Le Tisseur',
    cardClass: 'assassin',
    rarity: 'rare',
    theme: 'blood',
    quote: '"Un grand pouvoir implique de grandes responsabilites."',
    videoUrl: `${VIDEO_BASE_URL}/spiderman.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&q=80',
    baseStats: { strength: 75, endurance: 70, speed: 95, technique: 85, power: 70 },
    colors: {
      primary: '#8b0000',
      secondary: '#00008b',
      accent: '#ffffff',
      glow: '#dc143c'
    },
    effects: { particles: 'none', aura: false, holographic: false, animated: true },
    universe: 'marvel'
  },
  {
    id: 'captainamerica',
    name: 'Captain America',
    title: 'Le Premier Avenger',
    cardClass: 'paladin',
    rarity: 'rare',
    theme: 'light',
    quote: '"Je peux faire ca toute la journee."',
    videoUrl: `${VIDEO_BASE_URL}/captainamerica.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=800&q=80',
    baseStats: { strength: 85, endurance: 90, speed: 80, technique: 80, power: 75 },
    colors: {
      primary: '#002868',
      secondary: '#bf0a30',
      accent: '#ffffff',
      glow: '#4169e1'
    },
    effects: { particles: 'sparkles', aura: false, holographic: false, animated: true },
    universe: 'marvel'
  },
  {
    id: 'obiwan',
    name: 'Obi-Wan Kenobi',
    title: 'Le Negociateur',
    cardClass: 'paladin',
    rarity: 'rare',
    theme: 'light',
    quote: '"Hello there."',
    videoUrl: `${VIDEO_BASE_URL}/obiwan.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=800&q=80',
    baseStats: { strength: 75, endurance: 80, speed: 85, technique: 90, power: 80 },
    colors: {
      primary: '#8b4513',
      secondary: '#d2b48c',
      accent: '#00bfff',
      glow: '#87ceeb'
    },
    effects: { particles: 'sparkles', aura: false, holographic: false, animated: true },
    universe: 'star-wars'
  },
  {
    id: 'legolas',
    name: 'Legolas',
    title: 'Prince des Elfes',
    cardClass: 'ranger',
    rarity: 'rare',
    theme: 'nature',
    quote: '"Ils prennent les Hobbits vers l\'Isengard!"',
    videoUrl: `${VIDEO_BASE_URL}/legolas.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
    baseStats: { strength: 70, endurance: 75, speed: 100, technique: 95, power: 65 },
    colors: {
      primary: '#228b22',
      secondary: '#ffd700',
      accent: '#f0fff0',
      glow: '#32cd32'
    },
    effects: { particles: 'sparkles', aura: false, holographic: false, animated: true },
    universe: 'lotr'
  },
  {
    id: 'superman',
    name: 'Superman',
    title: 'L\'Homme d\'Acier',
    cardClass: 'guardian',
    rarity: 'rare',
    theme: 'light',
    quote: '"L\'espoir ne meurt jamais."',
    videoUrl: `${VIDEO_BASE_URL}/superman.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=800&q=80',
    baseStats: { strength: 100, endurance: 95, speed: 90, technique: 70, power: 90 },
    colors: {
      primary: '#0033a0',
      secondary: '#c8102e',
      accent: '#ffd700',
      glow: '#4169e1'
    },
    effects: { particles: 'sparkles', aura: false, holographic: false, animated: true },
    universe: 'dc'
  },

  // ============ COMMON - Les Guerriers ============
  {
    id: 'anakin',
    name: 'Anakin Skywalker',
    title: 'L\'Elu',
    cardClass: 'warrior',
    rarity: 'common',
    theme: 'fire',
    quote: '"Je n\'aime pas le sable."',
    videoUrl: `${VIDEO_BASE_URL}/anakin.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=800&q=80',
    baseStats: { strength: 80, endurance: 70, speed: 85, technique: 80, power: 85 },
    colors: {
      primary: '#1a1a1a',
      secondary: '#4169e1',
      accent: '#ffd700',
      glow: '#4169e1'
    },
    effects: { particles: 'fire', aura: false, holographic: false, animated: false },
    universe: 'star-wars'
  },
  {
    id: 'gimli',
    name: 'Gimli',
    title: 'Fils de Gloin',
    cardClass: 'berserker',
    rarity: 'common',
    theme: 'fire',
    quote: '"ET MA HACHE!"',
    videoUrl: `${VIDEO_BASE_URL}/gimli.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
    baseStats: { strength: 90, endurance: 85, speed: 50, technique: 70, power: 80 },
    colors: {
      primary: '#8b4513',
      secondary: '#cd853f',
      accent: '#ffd700',
      glow: '#d2691e'
    },
    effects: { particles: 'fire', aura: false, holographic: false, animated: false },
    universe: 'lotr'
  },
  {
    id: 'Groot',
    name: 'Groot',
    title: 'Le Colosse',
    cardClass: 'guardian',
    rarity: 'common',
    theme: 'nature',
    quote: '"Je s\'appelle Groot."',
    videoUrl: `${VIDEO_BASE_URL}/Groot.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
    baseStats: { strength: 85, endurance: 90, speed: 40, technique: 50, power: 75 },
    colors: {
      primary: '#2e1a0e',
      secondary: '#228b22',
      accent: '#90ee90',
      glow: '#32cd32'
    },
    effects: { particles: 'sparkles', aura: false, holographic: false, animated: false },
    universe: 'marvel'
  },
  {
    id: 'R2D2',
    name: 'R2-D2',
    title: 'Le Droide Astromech',
    cardClass: 'mage',
    rarity: 'common',
    theme: 'lightning',
    quote: '"*Bip boop bip*"',
    videoUrl: `${VIDEO_BASE_URL}/R2D2.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    baseStats: { strength: 30, endurance: 80, speed: 60, technique: 100, power: 50 },
    colors: {
      primary: '#e8e8e8',
      secondary: '#4169e1',
      accent: '#c0c0c0',
      glow: '#87ceeb'
    },
    effects: { particles: 'lightning', aura: false, holographic: false, animated: false },
    universe: 'star-wars'
  },

  // ============ STARTER - Les Debutants ============
  {
    id: 'frodon',
    name: 'Frodon',
    title: 'Le Porteur de l\'Anneau',
    cardClass: 'paladin',
    rarity: 'starter',
    theme: 'light',
    quote: '"Je vais le faire. Je vais porter l\'Anneau."',
    videoUrl: `${VIDEO_BASE_URL}/frodon.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    baseStats: { strength: 40, endurance: 70, speed: 60, technique: 50, power: 45 },
    colors: {
      primary: '#2c3e50',
      secondary: '#8b4513',
      accent: '#ffd700',
      glow: '#95a5a6'
    },
    effects: { particles: 'none', aura: false, holographic: false, animated: false },
    universe: 'lotr'
  },
  {
    id: 'babygroot',
    name: 'Baby Groot',
    title: 'Le Petit Arbre',
    cardClass: 'guardian',
    rarity: 'starter',
    theme: 'nature',
    quote: '"Je s\'appelle Groot!"',
    videoUrl: `${VIDEO_BASE_URL}/babygroot.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
    baseStats: { strength: 30, endurance: 50, speed: 55, technique: 40, power: 35 },
    colors: {
      primary: '#2e1a0e',
      secondary: '#90ee90',
      accent: '#ffffff',
      glow: '#32cd32'
    },
    effects: { particles: 'sparkles', aura: false, holographic: false, animated: false },
    universe: 'marvel'
  },
  {
    id: 'C3PO',
    name: 'C-3PO',
    title: 'Droide de Protocole',
    cardClass: 'mage',
    rarity: 'starter',
    theme: 'light',
    quote: '"Les probabilites de survie sont de 3720 contre 1!"',
    videoUrl: `${VIDEO_BASE_URL}/C3PO.webm`,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    baseStats: { strength: 20, endurance: 60, speed: 40, technique: 90, power: 30 },
    colors: {
      primary: '#ffd700',
      secondary: '#daa520',
      accent: '#ffffff',
      glow: '#ffdf00'
    },
    effects: { particles: 'none', aura: false, holographic: false, animated: false },
    universe: 'star-wars'
  }
]

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
 * Assigne un personnage ALEATOIREMENT selon la rarete
 * Change a chaque appel (nouvelle performance = nouvelle carte)
 */
export function assignRandomCharacter(percentile: number): EpicCharacter {
  const rarity = getRarityFromPercentile(percentile)

  // Filtre par rarete
  const candidates = EPIC_CHARACTERS.filter(c => c.rarity === rarity)

  // Si pas de candidats pour cette rarete, prend tous
  const pool = candidates.length > 0 ? candidates : EPIC_CHARACTERS

  // Selection aleatoire
  const randomIndex = Math.floor(Math.random() * pool.length)
  return pool[randomIndex]
}

/**
 * Assigne un personnage specifique par ID
 */
export function getCharacterById(characterId: string): EpicCharacter | undefined {
  return EPIC_CHARACTERS.find(c => c.id === characterId)
}

/**
 * Retourne tous les personnages d'une rarete donnee
 */
export function getCharactersByRarity(rarity: CardRarity): EpicCharacter[] {
  return EPIC_CHARACTERS.filter(c => c.rarity === rarity)
}

/**
 * Retourne tous les personnages d'un univers donne
 */
export function getCharactersByUniverse(universe: EpicCharacter['universe']): EpicCharacter[] {
  return EPIC_CHARACTERS.filter(c => c.universe === universe)
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

/**
 * Univers disponibles
 */
export const UNIVERSE_OPTIONS = [
  { id: 'star-wars', name: 'Star Wars', emoji: '⭐' },
  { id: 'marvel', name: 'Marvel', emoji: '🦸' },
  { id: 'lotr', name: 'Seigneur des Anneaux', emoji: '💍' },
  { id: 'dc', name: 'DC Comics', emoji: '🦇' },
  { id: 'other', name: 'Autre', emoji: '🌟' }
] as const
