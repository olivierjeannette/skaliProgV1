// Types principaux - Skali Admin

export type UserRole = 'ADMIN' | 'COACH' | 'ATHLETE';

export interface AuthSession {
  isAuthenticated: boolean;
  role: UserRole;
  userId?: string;
  expiresAt?: number;
}

// Alias for backward compatibility
export type Session = AuthSession;

// Training session (from Supabase)
export type SessionCategory = 'crosstraining' | 'musculation' | 'cardio' | 'hyrox' | 'recovery';

export interface TrainingSession {
  id: string;
  date: string; // Format: YYYY-MM-DD
  title: string;
  category?: SessionCategory;
  description?: string;
  blocks?: unknown; // JSONB structure
  rfid_enabled?: boolean;
  rfid_mode?: string;
  work_duration?: number;
  rest_duration?: number;
  rounds?: number;
  created_at: string;
  updated_at?: string;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  gender?: 'male' | 'female' | null;
  weight?: number;
  height?: number;
  body_fat_percentage?: number;
  lean_mass?: number;
  photo?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  // Computed fields (not in DB)
  firstName?: string;
  lastName?: string;
  age?: number;
}

export interface DiscordMember {
  id: string;
  discord_id: string;
  discord_username: string;
  discord_avatar?: string;
  member_id?: string;
  member_name?: string;
  is_active: boolean;
  last_sync?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface APIKeyConfig {
  name: string;
  label: string;
  description: string;
  placeholder: string;
  testable: boolean;
  required: boolean;
}

// Performance tracking
export type PerformanceCategory = 'Musculation' | 'Crosstraining' | 'Endurance' | 'Gymnastique';
export type PerformanceUnit = 'kg' | 'seconds' | 'meters' | 'reps';

export interface Performance {
  id: string;
  member_id: string;
  exercise_type: string;
  category: PerformanceCategory;
  value: number;
  unit: PerformanceUnit;
  reps?: number;
  date: string;
  is_pr: boolean;
  notes?: string;
  created_at: string;
}

// Pokemon card stats (4 categories)
export type PokemonStatCategory = 'cardio' | 'force' | 'gym' | 'puissance';

export interface PokemonStats {
  cardio: number;    // 0-100: Endurance (courses, rameur, skierg)
  force: number;     // 0-100: Force pure (squats, deadlifts, bench)
  gym: number;       // 0-100: Poids du corps (pullups, dips, pushups)
  puissance: number; // 0-100: Explosivité (watts, jumps)
  niveau: number;    // 1-100: Overall level (moyenne des 4)
}

// Exercise mapping for stats calculation
export const EXERCISE_MAPPING: Record<PokemonStatCategory, string[]> = {
  cardio: ['run', '600m', '800m', '1200m', '2000m', 'skierg', 'rameur', 'row', 'bikerg', 'burpees'],
  force: ['bench press', 'deadlift', 'squat', 'front squat', 'back squat', 'strict press', 'snatch', 'clean & jerk', 'clean and jerk'],
  gym: ['pullups', 'pull ups', 'toes to bar', 'dips', 'pushups', 'push ups', 'handstand'],
  puissance: ['pic watts', 'watts', 'assault bike', 'jump', 'broad jump', 'box jump']
};

// 1RM calculation formulas
export const OneRMFormulas = {
  epley: (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    if (reps === 0) return 0;
    return weight * (1 + reps / 30);
  },
  brzycki: (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    if (reps === 0) return 0;
    return weight / (1.0278 - 0.0278 * reps);
  }
};
