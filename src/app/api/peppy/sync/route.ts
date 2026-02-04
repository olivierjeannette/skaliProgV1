import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface PeppyParticipant {
  name: string;
  status: string;
}

interface PeppySessionDB {
  id: string;
  date: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  session_name: string;
  total_places: number;
  participant_count: number;
  participants: PeppyParticipant[];
  scraped_at: string;
}

// Convertir le format DB vers le format API
function formatSession(dbSession: PeppySessionDB) {
  return {
    date: dbSession.date,
    dayOfWeek: dbSession.day_of_week,
    startTime: dbSession.start_time,
    endTime: dbSession.end_time,
    sessionName: dbSession.session_name,
    totalPlaces: dbSession.total_places,
    participantCount: dbSession.participant_count,
    participants: dbSession.participants,
    scrapedAt: dbSession.scraped_at
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hour = searchParams.get('hour');

  try {
    const supabase = await createClient();

    // Construire la requête
    let query = supabase
      .from('peppy_sessions')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(1);

    // Si une heure est spécifiée, filtrer
    if (hour) {
      const hourPadded = hour.padStart(2, '0');
      query = query.or(`start_time.ilike.${hourPadded}:%,start_time.ilike.${hour}:%`);
    }

    // Sinon, récupérer la session la plus récente du jour
    const today = new Date().toISOString().split('T')[0];
    query = query.eq('date', today);

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('[Peppy API] Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error', success: false },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'No session found for today',
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      data: formatSession(data as PeppySessionDB),
      fromCache: true,
      syncedAt: data.scraped_at
    });

  } catch (error) {
    console.error('[Peppy API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error', success: false },
      { status: 500 }
    );
  }
}

// POST pour trigger un sync manuel (appelle GitHub Actions via webhook ou autre)
export async function POST(request: NextRequest) {
  // Pour l'instant, retourner une erreur car le sync se fait via GitHub Actions
  return NextResponse.json({
    success: false,
    error: 'Manual sync not available. Use GitHub Actions workflow_dispatch.',
    hint: 'Go to GitHub > Actions > Peppy Sync > Run workflow'
  }, { status: 400 });
}
