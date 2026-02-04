import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

interface PortalSession {
  discordId: string;
  discordUsername: string;
  discordAvatar: string;
  memberId?: string;
  memberName?: string;
}

// GET /api/portal/prs?limit=20
// Récupère les Personal Records d'un membre
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '20');

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
    return NextResponse.json(
      { error: 'Vous devez être lié à un profil membre' },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const memberId = portalSession.memberId;

    // Essayer la RPC d'abord
    const { data, error } = await supabase
      .rpc('get_member_prs', {
        p_member_id: memberId,
        p_limit: limit
      });

    if (!error && data) {
      // Formatter avec calcul d'amélioration
      const prs = (data || []).map((pr: {
        id: string;
        exercise: string;
        value: string;
        unit: string;
        date: string;
        category: string;
        previous_value: string | null;
      }) => {
        const improvement = pr.previous_value
          ? calculateImprovement(parseFloat(pr.value), parseFloat(pr.previous_value), pr.unit)
          : null;

        return {
          id: pr.id,
          exercise: pr.exercise,
          value: pr.value,
          unit: pr.unit,
          date: pr.date,
          category: pr.category,
          improvement
        };
      });

      return NextResponse.json({ prs });
    }

    // Log l'erreur RPC
    if (error) {
      console.warn('RPC get_member_prs failed:', error.message);
    }

    // Fallback: requête directe
    const { data: performances, error: queryError } = await supabase
      .from('performances')
      .select('*')
      .eq('member_id', memberId)
      .eq('is_pr', true)
      .order('date', { ascending: false })
      .limit(limit);

    if (queryError) {
      console.error('PRs query error:', queryError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des PRs' },
        { status: 500 }
      );
    }

    // Pour chaque PR, chercher le précédent pour calculer l'amélioration
    const prsWithImprovement = await Promise.all(
      (performances || []).map(async (pr) => {
        // Chercher le PR précédent
        const { data: previousPR } = await supabase
          .from('performances')
          .select('value')
          .eq('member_id', memberId)
          .eq('exercise_type', pr.exercise_type)
          .eq('is_pr', true)
          .lt('date', pr.date)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        const improvement = previousPR
          ? calculateImprovement(pr.value, previousPR.value, pr.unit)
          : null;

        return {
          id: pr.id,
          exercise: pr.exercise_type,
          value: pr.value.toString(),
          unit: pr.unit,
          date: pr.date,
          category: pr.category,
          improvement
        };
      })
    );

    return NextResponse.json({ prs: prsWithImprovement });

  } catch (err) {
    console.error('Portal PRs error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Calculer l'amélioration entre deux valeurs
function calculateImprovement(current: number, previous: number, unit: string): string | null {
  if (!previous || previous === 0) return null;

  const diff = current - previous;

  // Pour les temps (seconds), moins = mieux
  if (unit === 'seconds') {
    if (diff >= 0) return null; // Pas d'amélioration
    const minutes = Math.floor(Math.abs(diff) / 60);
    const seconds = Math.abs(diff) % 60;
    if (minutes > 0) {
      return `-${minutes}min${seconds > 0 ? ` ${Math.round(seconds)}s` : ''}`;
    }
    return `-${Math.round(seconds)}s`;
  }

  // Pour les autres (kg, reps, meters), plus = mieux
  if (diff <= 0) return null;

  if (unit === 'kg') {
    return `+${diff.toFixed(1)}kg`;
  }
  if (unit === 'reps') {
    return `+${Math.round(diff)} reps`;
  }
  if (unit === 'meters') {
    return `+${Math.round(diff)}m`;
  }

  return `+${diff}`;
}
