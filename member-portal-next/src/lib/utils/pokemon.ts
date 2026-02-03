import type {
  PokemonCard,
  PokemonType,
  PokemonTypeConfig,
  PokemonStats,
  PokemonAttack,
  EvolutionStage,
  RarityTier,
  Performance,
  Member,
  PerformanceStats
} from '@/types'

// ============================================
// POKEMON TYPE CONFIGURATION
// ============================================

export const POKEMON_TYPES: Record<PokemonType, PokemonTypeConfig> = {
  fighting: {
    name: 'Combat',
    color: '#C22E28',
    gradient: 'from-red-600 to-orange-500',
    bgColor: 'bg-red-900/30',
    description: 'Spécialiste en force et puissance',
    icon: '💪',
  },
  electric: {
    name: 'Électrik',
    color: '#F7D02C',
    gradient: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-900/30',
    description: 'Vitesse et explosivité',
    icon: '⚡',
  },
  psychic: {
    name: 'Psy',
    color: '#F95587',
    gradient: 'from-pink-500 to-purple-500',
    bgColor: 'bg-pink-900/30',
    description: 'Technique et précision',
    icon: '🧠',
  },
  fire: {
    name: 'Feu',
    color: '#EE8130',
    gradient: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-900/30',
    description: 'Intensité et endurance',
    icon: '🔥',
  },
  water: {
    name: 'Eau',
    color: '#6390F0',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-900/30',
    description: 'Équilibre et fluidité',
    icon: '💧',
  },
  grass: {
    name: 'Plante',
    color: '#7AC74C',
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-900/30',
    description: 'Récupération et régularité',
    icon: '🌿',
  },
}

// ============================================
// EVOLUTION STAGES
// ============================================

export const EVOLUTION_STAGES: Record<EvolutionStage, { minLevel: number; maxLevel: number; label: string }> = {
  rookie: { minLevel: 1, maxLevel: 20, label: 'Rookie' },
  intermediate: { minLevel: 21, maxLevel: 40, label: 'Intermédiaire' },
  advanced: { minLevel: 41, maxLevel: 60, label: 'Avancé' },
  elite: { minLevel: 61, maxLevel: 80, label: 'Élite' },
  master: { minLevel: 81, maxLevel: 100, label: 'Maître' },
}

export const RARITY_TIERS: Record<RarityTier, { minLevel: number; label: string; color: string }> = {
  common: { minLevel: 0, label: 'Commun', color: 'text-gray-400' },
  uncommon: { minLevel: 30, label: 'Peu commun', color: 'text-green-400' },
  rare: { minLevel: 50, label: 'Rare', color: 'text-blue-400' },
  epic: { minLevel: 70, label: 'Épique', color: 'text-purple-400' },
  legendary: { minLevel: 90, label: 'Légendaire', color: 'text-amber-400' },
}

// ============================================
// EXERCISE CATEGORIES
// ============================================

const EXERCISE_PATTERNS = {
  power: ['squat', 'deadlift', 'bench', 'développé', 'soulevé', 'clean', 'snatch', 'press'],
  cardio: ['run', 'course', 'bike', 'vélo', 'row', 'rameur', 'swim', 'ski', 'assault', 'echo'],
  gym: ['pull', 'push', 'plank', 'traction', 'dip', 'curl', 'extension', 'crunch', 'gainage'],
  technique: ['pistol', 'muscle-up', 'handstand', 'skill', 'gymnastic'],
}

export function categorizeExercise(exerciseName: string): 'power' | 'cardio' | 'gym' | 'technique' | 'unknown' {
  const normalized = exerciseName.toLowerCase()

  for (const [category, patterns] of Object.entries(EXERCISE_PATTERNS)) {
    if (patterns.some(pattern => normalized.includes(pattern))) {
      return category as 'power' | 'cardio' | 'gym' | 'technique'
    }
  }

  return 'unknown'
}

// ============================================
// STATS CALCULATION
// ============================================

export function calculatePerformanceStats(
  performances: Performance[],
  benchmarks?: Map<string, { min: number; max: number }>
): PerformanceStats {
  const stats: PerformanceStats = {
    cardio: 0,
    force: 0,
    gym: 0,
    puissance: 0,
    overall: 0,
  }

  if (!performances.length) return stats

  const categorized = {
    cardio: [] as number[],
    force: [] as number[],
    gym: [] as number[],
    puissance: [] as number[],
  }

  // Group performances by category and normalize
  for (const perf of performances) {
    const category = categorizeExercise(perf.exercise_name)
    let normalizedValue = perf.value

    // Normalize against benchmarks if available
    if (benchmarks) {
      const benchmark = benchmarks.get(perf.exercise_name)
      if (benchmark) {
        normalizedValue = ((perf.value - benchmark.min) / (benchmark.max - benchmark.min)) * 100
        normalizedValue = Math.max(0, Math.min(100, normalizedValue))
      }
    }

    switch (category) {
      case 'cardio':
        categorized.cardio.push(normalizedValue)
        break
      case 'power':
        categorized.force.push(normalizedValue)
        categorized.puissance.push(normalizedValue)
        break
      case 'gym':
        categorized.gym.push(normalizedValue)
        break
      case 'technique':
        categorized.gym.push(normalizedValue)
        break
    }
  }

  // Calculate averages
  const average = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

  stats.cardio = Math.round(average(categorized.cardio))
  stats.force = Math.round(average(categorized.force))
  stats.gym = Math.round(average(categorized.gym))
  stats.puissance = Math.round(average(categorized.puissance))

  // Overall is weighted average
  const weights = { cardio: 0.25, force: 0.3, gym: 0.2, puissance: 0.25 }
  stats.overall = Math.round(
    stats.cardio * weights.cardio +
    stats.force * weights.force +
    stats.gym * weights.gym +
    stats.puissance * weights.puissance
  )

  return stats
}

// ============================================
// POKEMON CARD GENERATION
// ============================================

export function determineType(stats: PerformanceStats): PokemonType {
  const { cardio, force, gym, puissance } = stats

  // Find dominant stat
  const statValues = [
    { type: 'fighting' as PokemonType, value: force },
    { type: 'electric' as PokemonType, value: cardio },
    { type: 'psychic' as PokemonType, value: gym },
    { type: 'fire' as PokemonType, value: puissance },
  ]

  statValues.sort((a, b) => b.value - a.value)

  // Return type based on dominant stat
  // If stats are close, use secondary criteria
  if (statValues[0].value - statValues[1].value < 10) {
    // Stats are close - use combined type logic
    if (force > 60 && cardio > 60) return 'fire' // High intensity
    if (gym > 60 && force > 60) return 'fighting' // Strength focused
    if (cardio > 60 && gym > 60) return 'water' // Balanced endurance
  }

  return statValues[0].type
}

export function calculateLevel(stats: PerformanceStats): number {
  // Level is based on overall performance (0-100)
  const baseLevel = stats.overall

  // Add bonus for being well-rounded
  const variance = Math.abs(stats.cardio - stats.force) +
    Math.abs(stats.force - stats.gym) +
    Math.abs(stats.gym - stats.puissance)

  const balanceBonus = Math.max(0, 10 - variance / 10)

  return Math.min(100, Math.max(1, Math.round(baseLevel + balanceBonus)))
}

export function calculateHP(level: number, defense: number): number {
  const baseHP = 100
  const levelBonus = level * 2
  const defenseBonus = Math.round(defense * 0.5)

  return baseHP + levelBonus + defenseBonus
}

export function getEvolutionStage(level: number): EvolutionStage {
  if (level >= 81) return 'master'
  if (level >= 61) return 'elite'
  if (level >= 41) return 'advanced'
  if (level >= 21) return 'intermediate'
  return 'rookie'
}

export function getRarity(level: number): RarityTier {
  if (level >= 90) return 'legendary'
  if (level >= 70) return 'epic'
  if (level >= 50) return 'rare'
  if (level >= 30) return 'uncommon'
  return 'common'
}

// ============================================
// POKEMON NAME & IMAGE GENERATION
// ============================================

// Pokemon IDs organized by evolution stage
const POKEMON_BY_STAGE: Record<EvolutionStage, number[]> = {
  rookie: [1, 4, 7, 10, 13, 16, 19, 21, 23, 27, 29, 32, 37, 41, 43, 46, 48, 50, 52, 54, 56, 58, 60, 63, 66, 69, 72, 74, 77, 79, 81, 83, 84, 86, 88, 90, 92, 95, 96, 98, 100, 102, 104, 108, 109, 111, 114, 116, 118, 120, 123, 127, 128, 129, 131, 132, 133, 137, 138, 140, 147],
  intermediate: [2, 5, 8, 11, 14, 17, 20, 22, 24, 28, 30, 33, 38, 42, 44, 47, 49, 51, 53, 55, 57, 59, 61, 64, 67, 70, 73, 75, 78, 80, 82, 85, 87, 89, 91, 93, 97, 99, 101, 103, 105, 110, 112, 117, 119, 121, 124, 125, 126, 134, 135, 136, 139, 141, 148],
  advanced: [3, 6, 9, 12, 15, 18, 25, 26, 31, 34, 35, 36, 39, 40, 45, 62, 65, 68, 71, 76, 94, 106, 107, 113, 115, 122, 130, 142, 143, 144, 145, 146, 149],
  elite: [150, 151, 243, 244, 245, 248, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386],
  master: [150, 151, 249, 250, 251, 382, 383, 384, 385, 386, 483, 484, 487, 491, 492, 493],
}

// Track assigned Pokemon IDs to avoid duplicates
const assignedPokemonIds = new Set<number>()

export function getPokemonId(stage: EvolutionStage, memberId: string): number {
  const candidates = POKEMON_BY_STAGE[stage]

  // Find unused Pokemon in this stage
  const unused = candidates.filter(id => !assignedPokemonIds.has(id))

  let pokemonId: number

  if (unused.length > 0) {
    // Use hash of memberId to get consistent assignment
    const hash = memberId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    pokemonId = unused[hash % unused.length]
  } else {
    // All used, pick based on member hash (allow duplicates)
    const hash = memberId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    pokemonId = candidates[hash % candidates.length]
  }

  assignedPokemonIds.add(pokemonId)
  return pokemonId
}

export function getPokemonImageUrl(pokemonId: number): string {
  // Official artwork from PokeAPI
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
}

export function getPokemonName(pokemonId: number): string {
  // Simplified Pokemon names map (first 151 + some legendaries)
  const names: Record<number, string> = {
    1: 'Bulbizarre', 2: 'Herbizarre', 3: 'Florizarre',
    4: 'Salamèche', 5: 'Reptincel', 6: 'Dracaufeu',
    7: 'Carapuce', 8: 'Carabaffe', 9: 'Tortank',
    25: 'Pikachu', 26: 'Raichu',
    150: 'Mewtwo', 151: 'Mew',
    243: 'Raikou', 244: 'Entei', 245: 'Suicune',
    249: 'Lugia', 250: 'Ho-Oh', 251: 'Celebi',
    382: 'Kyogre', 383: 'Groudon', 384: 'Rayquaza',
    // ... add more as needed
  }

  return names[pokemonId] || `Pokemon #${pokemonId}`
}

// ============================================
// ATTACK GENERATION
// ============================================

const ATTACK_TEMPLATES: Record<PokemonType, { name: string; baseDamage: number }[]> = {
  fighting: [
    { name: 'Poing Boost', baseDamage: 40 },
    { name: 'Casse-Brique', baseDamage: 60 },
    { name: 'Close Combat', baseDamage: 80 },
  ],
  electric: [
    { name: 'Éclair', baseDamage: 40 },
    { name: 'Tonnerre', baseDamage: 60 },
    { name: 'Fatal-Foudre', baseDamage: 80 },
  ],
  psychic: [
    { name: 'Choc Mental', baseDamage: 40 },
    { name: 'Psyko', baseDamage: 60 },
    { name: 'Prescience', baseDamage: 80 },
  ],
  fire: [
    { name: 'Flammèche', baseDamage: 40 },
    { name: 'Lance-Flammes', baseDamage: 60 },
    { name: 'Déflagration', baseDamage: 80 },
  ],
  water: [
    { name: 'Pistolet à O', baseDamage: 40 },
    { name: 'Surf', baseDamage: 60 },
    { name: 'Hydrocanon', baseDamage: 80 },
  ],
  grass: [
    { name: 'Fouet Lianes', baseDamage: 40 },
    { name: 'Tranch\'Herbe', baseDamage: 60 },
    { name: 'Lance-Soleil', baseDamage: 80 },
  ],
}

export function generateAttacks(type: PokemonType, level: number): PokemonAttack[] {
  const templates = ATTACK_TEMPLATES[type]
  const attacks: PokemonAttack[] = []

  // Always have basic attack
  attacks.push({
    ...templates[0],
    damage: Math.round(templates[0].baseDamage * (1 + level / 100)),
    type,
  })

  // Medium attack unlocked at level 30+
  if (level >= 30) {
    attacks.push({
      ...templates[1],
      damage: Math.round(templates[1].baseDamage * (1 + level / 100)),
      type,
    })
  }

  // Ultimate attack unlocked at level 60+
  if (level >= 60) {
    attacks.push({
      ...templates[2],
      damage: Math.round(templates[2].baseDamage * (1 + level / 100)),
      type,
    })
  }

  return attacks
}

// ============================================
// MAIN CARD GENERATOR
// ============================================

export function generatePokemonCard(
  member: Member,
  performances: Performance[],
  benchmarks?: Map<string, { min: number; max: number }>
): PokemonCard {
  // Calculate stats
  const perfStats = calculatePerformanceStats(performances, benchmarks)

  // Determine Pokemon attributes
  const type = determineType(perfStats)
  const level = calculateLevel(perfStats)
  const evolutionStage = getEvolutionStage(level)
  const rarity = getRarity(level)

  // Get Pokemon
  const pokemonId = getPokemonId(evolutionStage, member.id)

  // Calculate card stats
  const stats: PokemonStats = {
    attack: Math.round((perfStats.force + perfStats.puissance) / 2),
    defense: Math.round((perfStats.gym + perfStats.cardio) / 2),
    speed: perfStats.cardio,
    endurance: Math.round((perfStats.cardio + perfStats.gym) / 2),
    technique: perfStats.gym,
  }

  const hp = calculateHP(level, stats.defense)
  const attacks = generateAttacks(type, level)

  return {
    id: `card-${member.id}`,
    member_id: member.id,
    member_name: member.name,
    pokemon_id: pokemonId,
    pokemon_name: getPokemonName(pokemonId),
    type,
    level,
    hp,
    stats,
    attacks,
    evolution_stage: evolutionStage,
    rarity,
    image_url: getPokemonImageUrl(pokemonId),
    generated_at: new Date().toISOString(),
  }
}

// ============================================
// CARD UTILITIES
// ============================================

export function resetAssignedPokemon(): void {
  assignedPokemonIds.clear()
}

export function getTypeConfig(type: PokemonType): PokemonTypeConfig {
  return POKEMON_TYPES[type]
}

export function getRarityInfo(level: number): { tier: RarityTier; label: string; color: string } {
  const rarity = getRarity(level)
  return {
    tier: rarity,
    ...RARITY_TIERS[rarity],
  }
}
