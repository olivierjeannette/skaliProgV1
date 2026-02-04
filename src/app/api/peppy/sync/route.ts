import { NextRequest, NextResponse } from 'next/server';
import { scrapePeppyCurrentSession, scrapePeppySessionByHour, PeppyScrapeResult, PeppySession } from '@/lib/peppy/scraper';

// Cache en mémoire (sera réinitialisé au redémarrage du serveur)
// Pour une solution plus robuste, utiliser Redis ou Supabase
let cachedSession: PeppySession | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';
  const hour = searchParams.get('hour');

  // Vérifier le cache si pas de refresh forcé
  if (!forceRefresh && cachedSession && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return NextResponse.json({
      success: true,
      data: cachedSession,
      fromCache: true,
      cachedAt: new Date(cacheTimestamp).toISOString()
    });
  }

  const email = process.env.PEPPY_EMAIL;
  const password = process.env.PEPPY_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Peppy credentials not configured', success: false },
      { status: 500 }
    );
  }

  try {
    let result: PeppyScrapeResult;

    if (hour) {
      result = await scrapePeppySessionByHour(email, password, parseInt(hour));
    } else {
      result = await scrapePeppyCurrentSession(email, password);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 400 }
      );
    }

    // Mettre en cache
    cachedSession = result.session || null;
    cacheTimestamp = Date.now();

    return NextResponse.json({
      success: true,
      data: result.session,
      fromCache: false,
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Peppy Sync] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error', success: false },
      { status: 500 }
    );
  }
}

// POST pour forcer un refresh avec une heure spécifique
export async function POST(request: NextRequest) {
  const email = process.env.PEPPY_EMAIL;
  const password = process.env.PEPPY_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Peppy credentials not configured', success: false },
      { status: 500 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { hour } = body;

    let result: PeppyScrapeResult;

    if (hour !== undefined) {
      result = await scrapePeppySessionByHour(email, password, parseInt(hour));
    } else {
      result = await scrapePeppyCurrentSession(email, password);
    }

    if (result.success && result.session) {
      // Mettre en cache
      cachedSession = result.session;
      cacheTimestamp = Date.now();
    }

    return NextResponse.json({
      success: result.success,
      data: result.session,
      error: result.error,
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Peppy Sync] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error', success: false },
      { status: 500 }
    );
  }
}
