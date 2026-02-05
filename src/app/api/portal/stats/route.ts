import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

interface PortalSession {
  discordId: string;
  discordUsername: string;
  discordAvatar: string;
  memberId?: string;
  memberName?: string;
}

export interface MemberStats {
  strength: number;
  endurance: number;
  speed: number;
  technique: number;
  power: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  percentile: number;
  sessionCount: number;
  prCount: number;
}

// GET /api/portal/stats
// Récupère les stats Epic Card d'un membre
export async function GET() {
  // Vérifier la session portal
  const cookieStore = await cookies();
  const portalSessionCookie = cookieStore.get('portal_session')?.value;

  if (!portalSessionCookie) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  let portalSession: PortalSession;
  try {
    portalSession = JSON.parse(portalSessionCookie);
  } catch {
    return NextResponse.json(
      { error: 'Session invalide' },
      { status: 401 }
    );
  }

  if (!portalSession.memberId) {
    // Retourner des stats par défaut pour les utilisateurs non liés
    return NextResponse.json({
      stats: getDefaultStats()
    });
  }

  try {
    const supabase = createAdminClient();
    const memberId = portalSession.memberId;

    // Essayer la RPC d'abord
    const { data, error } = await supabase
      .rpc('calculate_member_stats', {
        p_member_id: memberId
      });

    if (!error && data) {
      return NextResponse.json({ stats: data });
    }

    // Log l'erreur RPC
    if (error) {
      console.warn('RPC calculate_member_stats failed:', error.message);
    }

    // Fallback: calcul côté serveur
    const stats = await calculateStatsFallback(supabase, memberId);
    return NextResponse.json({ stats });

  } catch (err) {
    console.error('Portal stats error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Stats par défaut pour les utilisateurs non liés
function getDefaultStats(): MemberStats {
  return {
    strength: 30,
    endurance: 30,
    speed: 30,
    technique: 30,
    power: 30,
    level: 1,
    xp: 0,
    xpToNextLevel: 600,
    percentile: 50,
    sessionCount: 0,
    prCount: 0
  };
}

// Calcul des stats côté serveur (fallback si RPC non disponible)
async function calculateStatsFallback(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  memberId: string
): Promise<MemberStats> {
  // 1. Récupérer toutes les performances du membre
  const { data: performances } = await supabase
    .from('performances')
    .select('*')
    .eq('member_id', memberId);

  // 2. Compter les séances assistées
  const { count: sessionCount } = await supabase
    .from('session_participants')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('attended', true);

  // 3. Compter les PRs
  const { count: prCount } = await supabase
    .from('performances')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('is_pr', true);

  // Si pas de données, retourner les stats par défaut
  if (!performances || performances.length === 0) {
    return {
      ...getDefaultStats(),
      sessionCount: sessionCount || 0,
      prCount: prCount || 0,
      level: Math.max(1, Math.floor((sessionCount || 0) / 6) + 1)
    };
  }

  // Calculer chaque stat
  const strength = calculateStrength(performances);
  const endurance = calculateEndurance(performances);
  const speed = calculateSpeed(performances);
  const technique = calculateTechnique(performances);
  const power = calculatePower(performances);

  // Niveau basé sur les séances (1 niveau tous les 6 séances)
  const level = Math.max(1, Math.min(50, Math.floor((sessionCount || 0) / 6) + 1));

  // XP pour progression visuelle
  const xp = ((sessionCount || 0) % 6) * 100 + (prCount || 0) * 50;

  // Percentile (simplifié - TODO: calculer vraiment par rapport aux autres membres)
  const averageStat = (strength + endurance + speed + technique + power) / 5;
  const percentile = Math.min(99, Math.max(1, Math.round(averageStat)));

  return {
    strength,
    endurance,
    speed,
    technique,
    power,
    level,
    xp,
    xpToNextLevel: 600,
    percentile,
    sessionCount: sessionCount || 0,
    prCount: prCount || 0
  };
}

interface Performance {
  exercise_type: string;
  value: number;
  unit: string;
  category: string;
}

// Calcul Force (1RM en kg, normalisé sur 100)
function calculateStrength(performances: Performance[]): number {
  const strengthExercises = ['squat', 'deadlift', 'bench', 'snatch', 'clean', 'press', 'jerk'];

  const strengthPerfs = performances.filter(p =>
    p.unit === 'kg' &&
    strengthExercises.some(ex => p.exercise_type.toLowerCase().includes(ex))
  );

  if (strengthPerfs.length === 0) return 30;

  const avg = strengthPerfs.reduce((sum, p) => sum + p.value, 0) / strengthPerfs.length;
  // Normaliser: 150kg = 100 points
  return Math.min(100, Math.max(0, Math.round(avg / 150 * 100)));
}

// Calcul Endurance (temps cardio, inversé)
function calculateEndurance(performances: Performance[]): number {
  const endurancePerfs = performances.filter(p =>
    (p.unit === 'seconds' || p.category === 'Endurance') &&
    (p.exercise_type.toLowerCase().includes('run') ||
     p.exercise_type.toLowerCase().includes('row') ||
     p.exercise_type.toLowerCase().includes('bike') ||
     p.exercise_type.toLowerCase().includes('ski'))
  );

  if (endurancePerfs.length === 0) return 30;

  // Pour le cardio, moins de temps = meilleur
  // On inverse: 600s (10min) = 0 points, 60s (1min) = 100 points
  const timePerfs = endurancePerfs.filter(p => p.unit === 'seconds');
  if (timePerfs.length === 0) return 30;

  const avgTime = timePerfs.reduce((sum, p) => sum + p.value, 0) / timePerfs.length;
  return Math.min(100, Math.max(0, Math.round(100 - (avgTime / 600 * 100))));
}

// Calcul Vitesse (sprints courts)
function calculateSpeed(performances: Performance[]): number {
  const speedPerfs = performances.filter(p =>
    p.unit === 'seconds' &&
    (p.exercise_type.toLowerCase().includes('400m') ||
     p.exercise_type.toLowerCase().includes('600m') ||
     p.exercise_type.toLowerCase().includes('800m') ||
     p.exercise_type.toLowerCase().includes('sprint'))
  );

  if (speedPerfs.length === 0) return 30;

  // 120s (2min) = 0 points, 0s = 100 points
  const avgTime = speedPerfs.reduce((sum, p) => sum + p.value, 0) / speedPerfs.length;
  return Math.min(100, Math.max(0, Math.round(100 - (avgTime / 120 * 100))));
}

// Calcul Technique (mouvements gymnastiques)
function calculateTechnique(performances: Performance[]): number {
  const techExercises = ['pullup', 'pull-up', 'pull up', 'dip', 'handstand', 'muscle', 'toes', 'kipping'];

  const techPerfs = performances.filter(p =>
    (p.unit === 'reps' || p.category === 'Gymnastique') &&
    techExercises.some(ex => p.exercise_type.toLowerCase().includes(ex))
  );

  if (techPerfs.length === 0) return 30;

  // 30 reps = 100 points
  const avg = techPerfs.reduce((sum, p) => sum + p.value, 0) / techPerfs.length;
  return Math.min(100, Math.max(0, Math.round(avg / 30 * 100)));
}

// Calcul Puissance (watts)
function calculatePower(performances: Performance[]): number {
  const powerPerfs = performances.filter(p =>
    p.exercise_type.toLowerCase().includes('watts') ||
    p.exercise_type.toLowerCase().includes('pic') ||
    p.exercise_type.toLowerCase().includes('power') ||
    (p.unit === 'reps' && p.exercise_type.toLowerCase().includes('jump'))
  );

  if (powerPerfs.length === 0) return 30;

  // 1000w = 100 points
  const avg = powerPerfs.reduce((sum, p) => sum + p.value, 0) / powerPerfs.length;
  return Math.min(100, Math.max(0, Math.round(avg / 1000 * 100)));
}
