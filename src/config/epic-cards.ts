/**
 * Systeme de cartes "Univers Epiques"
 * Heros multivers: Lord of the Rings, Harry Potter, Game of Thrones, Star Wars
 *
 * Concept: Les performants = Heros, Les debutants = Mechants (motivation pour progresser!)
 */

export type Universe = 'lotr' | 'starwars' | 'harrypotter' | 'got' | 'villain'

export type Tier = 'legendary' | 'epic' | 'rare' | 'common' | 'beginner'

export interface EpicCharacter {
  id: string
  name: string
  title: string
  universe: Universe
  tier: Tier
  quote: string
  imageUrl?: string
  // Stats modifiers (multiplicateurs visuels)
  statBonus: {
    strength: number  // Force
    endurance: number // Endurance
    speed: number     // Vitesse
    technique: number // Technique
    power: number     // Puissance
  }
  // Couleurs du theme
  colors: {
    primary: string
    secondary: string
    accent: string
    gradient: string
  }
}

// Configuration des tiers
export const TIER_CONFIG: Record<Tier, {
  name: string
  nameFr: string
  minPercentile: number
  maxPercentile: number
  xpMultiplier: number
  borderStyle: string
}> = {
  legendary: {
    name: 'Legendary',
    nameFr: 'Legendaire',
    minPercentile: 99,
    maxPercentile: 100,
    xpMultiplier: 2.0,
    borderStyle: 'border-4 border-yellow-400 shadow-yellow-400/50'
  },
  epic: {
    name: 'Epic',
    nameFr: 'Epique',
    minPercentile: 90,
    maxPercentile: 98,
    xpMultiplier: 1.5,
    borderStyle: 'border-4 border-purple-500 shadow-purple-500/50'
  },
  rare: {
    name: 'Rare',
    nameFr: 'Rare',
    minPercentile: 75,
    maxPercentile: 89,
    xpMultiplier: 1.25,
    borderStyle: 'border-4 border-blue-500 shadow-blue-500/50'
  },
  common: {
    name: 'Common',
    nameFr: 'Commun',
    minPercentile: 40,
    maxPercentile: 74,
    xpMultiplier: 1.0,
    borderStyle: 'border-2 border-slate-500'
  },
  beginner: {
    name: 'Beginner',
    nameFr: 'Apprenti',
    minPercentile: 0,
    maxPercentile: 39,
    xpMultiplier: 0.8,
    borderStyle: 'border-2 border-red-900'
  }
}

// Personnages par univers et tier
export const EPIC_CHARACTERS: EpicCharacter[] = [
  // ============ LEGENDARY (Top 1%) - Lord of the Rings ============
  {
    id: 'aragorn',
    name: 'Aragorn',
    title: 'Roi du Gondor',
    universe: 'lotr',
    tier: 'legendary',
    quote: '"Je suis Aragorn, fils d\'Arathorn. Si par ma vie ou ma mort je peux vous proteger, je le ferai."',
    statBonus: { strength: 1.5, endurance: 1.4, speed: 1.3, technique: 1.4, power: 1.5 },
    colors: {
      primary: '#1a365d',
      secondary: '#c9a227',
      accent: '#ffffff',
      gradient: 'from-slate-900 via-blue-900 to-slate-800'
    }
  },
  {
    id: 'gandalf',
    name: 'Gandalf',
    title: 'Le Blanc',
    universe: 'lotr',
    tier: 'legendary',
    quote: '"Un magicien n\'est jamais en retard, ni en avance. Il arrive precisement quand il le souhaite."',
    statBonus: { strength: 1.2, endurance: 1.6, speed: 1.1, technique: 1.8, power: 1.5 },
    colors: {
      primary: '#f5f5f5',
      secondary: '#c9a227',
      accent: '#1a365d',
      gradient: 'from-white via-gray-100 to-gray-300'
    }
  },
  {
    id: 'legolas',
    name: 'Legolas',
    title: 'Prince de la Foret Noire',
    universe: 'lotr',
    tier: 'legendary',
    quote: '"Ils prennent les Hobbits vers Isengard!"',
    statBonus: { strength: 1.2, endurance: 1.3, speed: 1.8, technique: 1.6, power: 1.3 },
    colors: {
      primary: '#065f46',
      secondary: '#fbbf24',
      accent: '#ffffff',
      gradient: 'from-emerald-900 via-green-800 to-emerald-900'
    }
  },

  // ============ EPIC (Top 10%) - Star Wars ============
  {
    id: 'luke',
    name: 'Luke Skywalker',
    title: 'Maitre Jedi',
    universe: 'starwars',
    tier: 'epic',
    quote: '"Je suis un Jedi, comme mon pere avant moi."',
    statBonus: { strength: 1.3, endurance: 1.3, speed: 1.4, technique: 1.4, power: 1.4 },
    colors: {
      primary: '#1e3a5f',
      secondary: '#00ff00',
      accent: '#ffffff',
      gradient: 'from-slate-900 via-blue-950 to-black'
    }
  },
  {
    id: 'obiwan',
    name: 'Obi-Wan Kenobi',
    title: 'General Jedi',
    universe: 'starwars',
    tier: 'epic',
    quote: '"Hello there."',
    statBonus: { strength: 1.3, endurance: 1.4, speed: 1.2, technique: 1.5, power: 1.3 },
    colors: {
      primary: '#7c3aed',
      secondary: '#22d3ee',
      accent: '#ffffff',
      gradient: 'from-violet-900 via-purple-900 to-slate-900'
    }
  },
  {
    id: 'yoda',
    name: 'Yoda',
    title: 'Grand Maitre Jedi',
    universe: 'starwars',
    tier: 'epic',
    quote: '"Fais-le ou ne le fais pas. Il n\'y a pas d\'essai."',
    statBonus: { strength: 1.1, endurance: 1.2, speed: 1.3, technique: 1.8, power: 1.4 },
    colors: {
      primary: '#064e3b',
      secondary: '#84cc16',
      accent: '#ffffff',
      gradient: 'from-green-950 via-emerald-900 to-green-950'
    }
  },
  {
    id: 'mando',
    name: 'Din Djarin',
    title: 'Le Mandalorien',
    universe: 'starwars',
    tier: 'epic',
    quote: '"C\'est la Voie."',
    statBonus: { strength: 1.4, endurance: 1.4, speed: 1.3, technique: 1.3, power: 1.4 },
    colors: {
      primary: '#374151',
      secondary: '#ef4444',
      accent: '#d4d4d4',
      gradient: 'from-gray-800 via-gray-700 to-gray-900'
    }
  },

  // ============ RARE (Top 25%) - Harry Potter ============
  {
    id: 'harry',
    name: 'Harry Potter',
    title: 'L\'Elu',
    universe: 'harrypotter',
    tier: 'rare',
    quote: '"Je fais confiance a Hagrid de ma vie."',
    statBonus: { strength: 1.2, endurance: 1.3, speed: 1.3, technique: 1.2, power: 1.3 },
    colors: {
      primary: '#7f1d1d',
      secondary: '#fbbf24',
      accent: '#ffffff',
      gradient: 'from-red-950 via-red-900 to-red-950'
    }
  },
  {
    id: 'hermione',
    name: 'Hermione Granger',
    title: 'La Plus Brillante',
    universe: 'harrypotter',
    tier: 'rare',
    quote: '"Ce n\'est pas Wingardium LevioSA, c\'est Wingardium LeviOsa!"',
    statBonus: { strength: 1.0, endurance: 1.2, speed: 1.1, technique: 1.6, power: 1.2 },
    colors: {
      primary: '#1e40af',
      secondary: '#f59e0b',
      accent: '#ffffff',
      gradient: 'from-blue-950 via-blue-900 to-blue-950'
    }
  },
  {
    id: 'dumbledore',
    name: 'Albus Dumbledore',
    title: 'Directeur de Poudlard',
    universe: 'harrypotter',
    tier: 'rare',
    quote: '"Le bonheur peut etre trouve meme dans les moments les plus sombres."',
    statBonus: { strength: 1.1, endurance: 1.3, speed: 1.0, technique: 1.7, power: 1.4 },
    colors: {
      primary: '#581c87',
      secondary: '#fcd34d',
      accent: '#ffffff',
      gradient: 'from-purple-950 via-violet-900 to-purple-950'
    }
  },
  {
    id: 'ron',
    name: 'Ron Weasley',
    title: 'Le Fidele',
    universe: 'harrypotter',
    tier: 'rare',
    quote: '"Bloody hell!"',
    statBonus: { strength: 1.2, endurance: 1.2, speed: 1.1, technique: 1.1, power: 1.2 },
    colors: {
      primary: '#c2410c',
      secondary: '#fef08a',
      accent: '#ffffff',
      gradient: 'from-orange-950 via-orange-900 to-orange-950'
    }
  },

  // ============ COMMON (50%) - Game of Thrones ============
  {
    id: 'jonsnow',
    name: 'Jon Snow',
    title: 'Le Batard du Nord',
    universe: 'got',
    tier: 'common',
    quote: '"Je ne sais rien."',
    statBonus: { strength: 1.1, endurance: 1.2, speed: 1.1, technique: 1.1, power: 1.1 },
    colors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#ffffff',
      gradient: 'from-gray-900 via-gray-800 to-gray-900'
    }
  },
  {
    id: 'arya',
    name: 'Arya Stark',
    title: 'Personne',
    universe: 'got',
    tier: 'common',
    quote: '"Pas aujourd\'hui."',
    statBonus: { strength: 1.0, endurance: 1.1, speed: 1.3, technique: 1.2, power: 1.0 },
    colors: {
      primary: '#374151',
      secondary: '#9ca3af',
      accent: '#ffffff',
      gradient: 'from-slate-900 via-slate-800 to-slate-900'
    }
  },
  {
    id: 'daenerys',
    name: 'Daenerys Targaryen',
    title: 'Mere des Dragons',
    universe: 'got',
    tier: 'common',
    quote: '"Je suis le sang du dragon."',
    statBonus: { strength: 1.0, endurance: 1.1, speed: 1.0, technique: 1.2, power: 1.3 },
    colors: {
      primary: '#7f1d1d',
      secondary: '#fbbf24',
      accent: '#ffffff',
      gradient: 'from-red-950 via-amber-900 to-red-950'
    }
  },
  {
    id: 'tyrion',
    name: 'Tyrion Lannister',
    title: 'Le Lutin',
    universe: 'got',
    tier: 'common',
    quote: '"Je bois et je sais des choses."',
    statBonus: { strength: 0.9, endurance: 1.0, speed: 0.9, technique: 1.4, power: 0.9 },
    colors: {
      primary: '#92400e',
      secondary: '#dc2626',
      accent: '#fef3c7',
      gradient: 'from-amber-950 via-amber-900 to-amber-950'
    }
  },

  // ============ BEGINNER / VILLAINS (Motivation!) ============
  {
    id: 'sauron',
    name: 'Sauron',
    title: 'Le Seigneur Tenebreux',
    universe: 'villain',
    tier: 'beginner',
    quote: '"Un Anneau pour les gouverner tous."',
    statBonus: { strength: 0.8, endurance: 0.9, speed: 0.8, technique: 0.9, power: 0.8 },
    colors: {
      primary: '#1c1917',
      secondary: '#f97316',
      accent: '#fef3c7',
      gradient: 'from-black via-orange-950 to-black'
    }
  },
  {
    id: 'vader',
    name: 'Dark Vador',
    title: 'Seigneur Sith',
    universe: 'villain',
    tier: 'beginner',
    quote: '"Je suis ton pere."',
    statBonus: { strength: 0.9, endurance: 0.8, speed: 0.8, technique: 0.9, power: 0.9 },
    colors: {
      primary: '#0a0a0a',
      secondary: '#ef4444',
      accent: '#ffffff',
      gradient: 'from-black via-red-950 to-black'
    }
  },
  {
    id: 'voldemort',
    name: 'Voldemort',
    title: 'Le Seigneur des Tenebres',
    universe: 'villain',
    tier: 'beginner',
    quote: '"Il n\'y a pas de bien ou de mal, seulement le pouvoir."',
    statBonus: { strength: 0.8, endurance: 0.8, speed: 0.9, technique: 1.0, power: 0.9 },
    colors: {
      primary: '#0f172a',
      secondary: '#22c55e',
      accent: '#ffffff',
      gradient: 'from-slate-950 via-green-950 to-slate-950'
    }
  },
  {
    id: 'nightking',
    name: 'Night King',
    title: 'Roi de la Nuit',
    universe: 'villain',
    tier: 'beginner',
    quote: '"..."',
    statBonus: { strength: 0.9, endurance: 0.9, speed: 0.7, technique: 0.8, power: 0.9 },
    colors: {
      primary: '#0c4a6e',
      secondary: '#38bdf8',
      accent: '#e0f2fe',
      gradient: 'from-sky-950 via-blue-900 to-sky-950'
    }
  },
  {
    id: 'saruman',
    name: 'Saruman',
    title: 'Le Blanc Corrompu',
    universe: 'villain',
    tier: 'beginner',
    quote: '"Contre le pouvoir du Mordor, il ne peut y avoir de victoire."',
    statBonus: { strength: 0.7, endurance: 0.8, speed: 0.7, technique: 1.0, power: 0.8 },
    colors: {
      primary: '#1f2937',
      secondary: '#d4d4d8',
      accent: '#ffffff',
      gradient: 'from-gray-900 via-gray-700 to-gray-900'
    }
  }
]

/**
 * Determine le tier d'un membre selon son percentile
 */
export function getTierFromPercentile(percentile: number): Tier {
  for (const [tier, config] of Object.entries(TIER_CONFIG)) {
    if (percentile >= config.minPercentile && percentile <= config.maxPercentile) {
      return tier as Tier
    }
  }
  return 'beginner'
}

/**
 * Assigne un personnage aleatoire du tier correspondant
 */
export function assignCharacter(percentile: number, preferredUniverse?: Universe): EpicCharacter {
  const tier = getTierFromPercentile(percentile)

  // Filtre par tier
  let candidates = EPIC_CHARACTERS.filter(c => c.tier === tier)

  // Si univers prefere, essayer de matcher
  if (preferredUniverse && preferredUniverse !== 'villain') {
    const universeMatch = candidates.filter(c => c.universe === preferredUniverse)
    if (universeMatch.length > 0) {
      candidates = universeMatch
    }
  }

  // Random parmi les candidats
  return candidates[Math.floor(Math.random() * candidates.length)]
}

/**
 * Calcule les stats finales avec les bonus du personnage
 */
export function calculateFinalStats(
  baseStats: { strength: number; endurance: number; speed: number; technique: number; power: number },
  character: EpicCharacter
) {
  return {
    strength: Math.round(baseStats.strength * character.statBonus.strength),
    endurance: Math.round(baseStats.endurance * character.statBonus.endurance),
    speed: Math.round(baseStats.speed * character.statBonus.speed),
    technique: Math.round(baseStats.technique * character.statBonus.technique),
    power: Math.round(baseStats.power * character.statBonus.power)
  }
}

/**
 * Univers disponibles pour les preferences
 */
export const UNIVERSE_OPTIONS = [
  { id: 'lotr', name: 'Le Seigneur des Anneaux', emoji: '🧙' },
  { id: 'starwars', name: 'Star Wars', emoji: '⚔️' },
  { id: 'harrypotter', name: 'Harry Potter', emoji: '🪄' },
  { id: 'got', name: 'Game of Thrones', emoji: '🐺' }
] as const
