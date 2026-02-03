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

// ================================
// TEAM BUILDER
// ================================

export type TeamMode = 'teams' | 'size';
export type BalanceMode = 'level' | 'homogeneous';
export type ParticipantLevel = 'debutant' | 'intermediaire' | 'enforme' | 'tresenforme';

export const LEVEL_POINTS: Record<ParticipantLevel, number> = {
  debutant: 1,
  intermediaire: 2,
  enforme: 3,
  tresenforme: 4
};

export const LEVEL_LABELS: Record<ParticipantLevel, string> = {
  debutant: '🟢 Débutant (1pt)',
  intermediaire: '🟡 Intermédiaire (2pt)',
  enforme: '🟠 En forme (3pt)',
  tresenforme: '🔴 Très en forme (4pt)'
};

export interface TeamParticipant {
  id: string;
  name: string;
  cleanName: string;
  gender: 'homme' | 'femme' | null;
  level: ParticipantLevel;
  points: number;
  isInDatabase: boolean;
  memberId?: string;
}

export interface Team {
  id: number;
  name: string;
  participants: TeamParticipant[];
  totalPoints: number;
  maleCount: number;
  femaleCount: number;
}

export interface TeamSettings {
  mode: TeamMode;
  numberOfTeams: number;
  teamSize: number;
  balanceMode: BalanceMode;
}

// ================================
// CRM
// ================================

export type LeadStatus =
  | 'prospect'
  | 'contacte_attente'
  | 'rdv_essai'
  | 'converti_abonnement'
  | 'converti_carnets'
  | 'non_converti_prix'
  | 'liste_rouge';

export type LeadService = 'fitness' | 'pilates' | 'coaching' | 'teambuilding';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  prospect: '🆕 Prospect',
  contacte_attente: '📞 Contacté (Attente)',
  rdv_essai: '📅 RDV pris (Essai)',
  converti_abonnement: '✅ Converti (Abo)',
  converti_carnets: '🎫 Converti (Carnets)',
  non_converti_prix: '💰 Non converti',
  liste_rouge: '🗑️ Liste rouge'
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  prospect: '#60a5fa',
  contacte_attente: '#fbbf24',
  rdv_essai: '#c084fc',
  converti_abonnement: '#4ade80',
  converti_carnets: '#34d399',
  non_converti_prix: '#f87171',
  liste_rouge: '#94a3b8'
};

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  service: LeadService;
  status: LeadStatus;
  message?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  contacted_at?: string;
  converted_at?: string;
}

// ================================
// SESSION TEMPLATES (Weekly)
// ================================

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Lundi, 6 = Dimanche

export interface WeekTemplateDay {
  dayOfWeek: DayOfWeek;
  title: string;
  category: SessionCategory;
}

export interface WeekTemplate {
  id: string;
  name: string;
  description?: string;
  days: WeekTemplateDay[];
  created_at: string;
  updated_at?: string;
}

// ================================
// SESSION BLOCKS (Modular)
// ================================

export type BlockType = 'warmup' | 'strength' | 'wod' | 'skill' | 'accessory' | 'cooldown' | 'custom';

export const BLOCK_TYPE_CONFIG: Record<BlockType, { name: string; color: string; icon: string }> = {
  warmup: { name: 'Échauffement', color: 'bg-yellow-500/20 text-yellow-600', icon: '🔥' },
  strength: { name: 'Force', color: 'bg-blue-500/20 text-blue-600', icon: '💪' },
  wod: { name: 'WOD', color: 'bg-red-500/20 text-red-600', icon: '⏱️' },
  skill: { name: 'Skill', color: 'bg-purple-500/20 text-purple-600', icon: '🎯' },
  accessory: { name: 'Accessoire', color: 'bg-green-500/20 text-green-600', icon: '🔧' },
  cooldown: { name: 'Retour au calme', color: 'bg-cyan-500/20 text-cyan-600', icon: '❄️' },
  custom: { name: 'Personnalisé', color: 'bg-gray-500/20 text-gray-600', icon: '📝' },
};

export interface SessionBlock {
  id: string;
  type: BlockType;
  title: string;
  content: string; // Markdown/texte libre pour les exercices
  duration?: number; // en minutes
  order: number;
}

// Extended TrainingSession with blocks
export interface TrainingSessionWithBlocks extends TrainingSession {
  blocks: SessionBlock[];
}
