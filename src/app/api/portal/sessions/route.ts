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

// GET /api/portal/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD
// Récupère les séances pour le calendrier du portail membre
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dateFrom = searchParams.get('from');
  const dateTo = searchParams.get('to');

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

  // Valider les dates
  if (!dateFrom || !dateTo) {
    return NextResponse.json(
      { error: 'Paramètres from et to requis' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const memberId = portalSession.memberId;

    // Utiliser la RPC si le membre est lié
    if (memberId) {
      const { data, error } = await supabase
        .rpc('get_portal_sessions', {
          p_member_id: memberId,
          p_date_from: dateFrom,
          p_date_to: dateTo
        });

      if (!error && data) {
        return NextResponse.json({ sessions: data || [] });
      }

      // Log l'erreur mais continue avec le fallback
      console.warn('RPC get_portal_sessions failed:', error?.message);
    }

    // Fallback: requête directe (sans info de réservation si pas de membre lié)
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('date', { ascending: true });

    if (sessionsError) {
      console.error('Sessions query error:', sessionsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des séances' },
        { status: 500 }
      );
    }

    // Si membre lié, récupérer ses inscriptions
    let bookings: Record<string, boolean> = {};
    if (memberId) {
      const { data: participations } = await supabase
        .from('session_participants')
        .select('session_id')
        .eq('member_id', memberId)
        .eq('is_booked', true);

      if (participations) {
        bookings = participations.reduce((acc, p) => {
          acc[p.session_id] = true;
          return acc;
        }, {} as Record<string, boolean>);
      }
    }

    // Récupérer le nombre de places réservées par séance
    const sessionIds = sessions?.map(s => s.id) || [];
    let spotsCounts: Record<string, number> = {};

    if (sessionIds.length > 0) {
      const { data: counts } = await supabase
        .from('session_participants')
        .select('session_id')
        .in('session_id', sessionIds)
        .eq('is_booked', true);

      if (counts) {
        spotsCounts = counts.reduce((acc, c) => {
          acc[c.session_id] = (acc[c.session_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      }
    }

    // Formatter les séances
    const formattedSessions = (sessions || []).map(s => ({
      id: s.id,
      date: s.date,
      time: s.time || '09:00',
      title: s.title,
      type: s.category,
      coach: s.coach,
      duration: s.duration || 60,
      description: s.description,
      blocks: s.blocks || [],
      max_spots: s.max_spots || 12,
      spots: (s.max_spots || 12) - (spotsCounts[s.id] || 0),
      is_booked: bookings[s.id] || false
    }));

    return NextResponse.json({ sessions: formattedSessions });

  } catch (err) {
    console.error('Portal sessions error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/portal/sessions - Réserver ou annuler une séance
export async function POST(request: NextRequest) {
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
      { error: 'Vous devez être lié à un profil membre pour réserver' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { sessionId, action } = body;

    if (!sessionId || !['book', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'sessionId et action (book/cancel) requis' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (action === 'book') {
      // Utiliser la RPC pour réserver
      const { data, error } = await supabase
        .rpc('book_session', {
          p_session_id: sessionId,
          p_member_id: portalSession.memberId
        });

      if (error) {
        console.error('Book session RPC error:', error);

        // Fallback: insert direct
        const { error: insertError } = await supabase
          .from('session_participants')
          .upsert({
            session_id: sessionId,
            member_id: portalSession.memberId,
            is_booked: true,
            booked_at: new Date().toISOString()
          }, {
            onConflict: 'session_id,member_id'
          });

        if (insertError) {
          return NextResponse.json(
            { error: 'Erreur lors de la réservation' },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true, message: 'Réservation confirmée' });
      }

      return NextResponse.json(data);

    } else {
      // Annuler la réservation
      const { data, error } = await supabase
        .rpc('cancel_booking', {
          p_session_id: sessionId,
          p_member_id: portalSession.memberId
        });

      if (error) {
        console.error('Cancel booking RPC error:', error);

        // Fallback: update direct
        const { error: updateError } = await supabase
          .from('session_participants')
          .update({ is_booked: false, updated_at: new Date().toISOString() })
          .eq('session_id', sessionId)
          .eq('member_id', portalSession.memberId);

        if (updateError) {
          return NextResponse.json(
            { error: 'Erreur lors de l\'annulation' },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true, message: 'Réservation annulée' });
      }

      return NextResponse.json(data);
    }

  } catch (err) {
    console.error('Portal sessions POST error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
