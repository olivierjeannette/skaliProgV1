import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/members/search?q=query
// Recherche des membres actifs pour liaison Discord (Portal)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  // Vérifier que l'utilisateur a une session portal
  const cookieStore = await cookies();
  const portalSession = cookieStore.get('portal_session')?.value;

  if (!portalSession) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  // Valider la query
  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query trop courte (min 2 caractères)' },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    // Utiliser la RPC pour rechercher
    const { data, error } = await supabase
      .rpc('search_members_for_linking', {
        p_query: query,
        p_limit: 10
      });

    if (error) {
      // Fallback: recherche directe si RPC n'existe pas
      console.warn('RPC search_members_for_linking failed, using fallback:', error.message);

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('members')
        .select('id, name, email, discord_id, is_active')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('name')
        .limit(10);

      if (fallbackError) {
        console.error('Fallback search failed:', fallbackError);
        return NextResponse.json(
          { error: 'Erreur de recherche' },
          { status: 500 }
        );
      }

      // Formatter les résultats
      const members = (fallbackData || []).map(m => ({
        id: m.id,
        name: m.name,
        first_name: m.name.split(' ')[0],
        last_name: m.name.split(' ').slice(1).join(' ') || '',
        email: m.email,
        discord_id: m.discord_id,
        is_active: m.is_active,
        is_linked: !!m.discord_id
      }));

      return NextResponse.json({ members });
    }

    return NextResponse.json({ members: data || [] });

  } catch (err) {
    console.error('Members search error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
