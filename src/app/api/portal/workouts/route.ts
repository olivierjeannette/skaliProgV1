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

// GET /api/portal/workouts?limit=20&offset=0&type=all
// Récupère l'historique des entraînements d'un membre
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const typeFilter = searchParams.get('type');

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
      .rpc('get_member_workouts', {
        p_member_id: memberId,
        p_limit: limit,
        p_offset: offset,
        p_type_filter: typeFilter === 'all' ? null : typeFilter
      });

    if (!error && data) {
      // Calculer les stats du mois
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthWorkouts = (data || []).filter((w: { date: string }) =>
        new Date(w.date) >= monthStart
      );

      const totalDuration = (data || []).reduce((sum: number, w: { duration?: number }) =>
        sum + (w.duration || 60), 0
      );

      return NextResponse.json({
        workouts: data || [],
        stats: {
          thisMonth: monthWorkouts.length,
          totalTime: Math.round(totalDuration / 60), // en heures
          totalSessions: (data || []).length
        }
      });
    }

    // Log l'erreur RPC
    if (error) {
      console.warn('RPC get_member_workouts failed:', error.message);
    }

    // Fallback: requête directe
    let query = supabase
      .from('session_participants')
      .select(`
        id,
        score,
        notes,
        block_results,
        attended_at,
        sessions (
          id,
          date,
          title,
          category,
          duration,
          coach,
          blocks,
          description
        )
      `)
      .eq('member_id', memberId)
      .eq('attended', true)
      .order('attended_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtre par type
    if (typeFilter && typeFilter !== 'all') {
      query = query.eq('sessions.category', typeFilter);
    }

    const { data: participations, error: queryError } = await query;

    if (queryError) {
      console.error('Workouts query error:', queryError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des entraînements' },
        { status: 500 }
      );
    }

    // Formatter les résultats
    interface SessionData {
      id: string;
      date: string;
      title: string;
      category: string;
      duration: number;
      coach: string;
      blocks: unknown[];
      description: string;
    }

    const workouts = (participations || [])
      .filter(p => p.sessions)
      .map(p => {
        const session = p.sessions as unknown as SessionData;
        return {
          id: session.id,
          date: session.date,
          title: session.title,
          type: session.category,
          duration: session.duration || 60,
          coach: session.coach,
          blocks: session.blocks || [],
          completed: true,
          score: p.score,
          notes: p.notes,
          block_results: p.block_results || []
        };
      });

    // Stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthWorkouts = workouts.filter(w => new Date(w.date) >= monthStart);
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 60), 0);

    return NextResponse.json({
      workouts,
      stats: {
        thisMonth: monthWorkouts.length,
        totalTime: Math.round(totalDuration / 60),
        totalSessions: workouts.length
      }
    });

  } catch (err) {
    console.error('Portal workouts error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
