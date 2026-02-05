import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

interface PortalSession {
  discordId: string;
  discordUsername: string;
  discordAvatar: string;
  memberId?: string;
  memberName?: string;
}

interface WorkoutBlock {
  type: string;
  title: string;
  content: string;
  result?: string;
}

// GET /api/portal/personal-workouts - Récupérer les séances personnelles
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const category = searchParams.get('category');

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
    const supabase = createAdminClient();
    const memberId = portalSession.memberId;

    // Essayer la RPC d'abord
    const { data, error } = await supabase
      .rpc('get_personal_workouts', {
        p_member_id: memberId,
        p_limit: limit,
        p_offset: offset,
        p_category: category || null
      });

    if (!error && data) {
      return NextResponse.json({
        workouts: data || [],
        count: (data || []).length
      });
    }

    // Fallback: requête directe
    if (error) {
      console.warn('RPC get_personal_workouts failed:', error.message);
    }

    let query = supabase
      .from('personal_workouts')
      .select('*')
      .eq('member_id', memberId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: workouts, error: queryError } = await query;

    if (queryError) {
      console.error('Personal workouts query error:', queryError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des séances' },
        { status: 500 }
      );
    }

    // Formatter les résultats
    const formattedWorkouts = (workouts || []).map(w => ({
      id: w.id,
      date: w.date,
      title: w.title,
      type: w.category,
      duration: w.duration || 60,
      description: w.description,
      blocks: w.blocks || [],
      score: w.score,
      notes: w.notes,
      feeling: w.feeling,
      completed: w.is_completed,
      is_personal: true
    }));

    return NextResponse.json({
      workouts: formattedWorkouts,
      count: formattedWorkouts.length
    });

  } catch (err) {
    console.error('Portal personal workouts error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/portal/personal-workouts - Créer une séance personnelle
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
      { error: 'Vous devez être lié à un profil membre' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      date,
      title,
      category = 'personal',
      duration = 60,
      description,
      blocks = [],
      score,
      notes,
      feeling
    } = body;

    // Validation
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Le titre est requis' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const memberId = portalSession.memberId;

    // Essayer la RPC d'abord
    const { data, error } = await supabase
      .rpc('create_personal_workout', {
        p_member_id: memberId,
        p_date: date || new Date().toISOString().split('T')[0],
        p_title: title.trim(),
        p_category: category,
        p_duration: duration,
        p_description: description || null,
        p_blocks: blocks,
        p_score: score || null,
        p_notes: notes || null,
        p_feeling: feeling || null
      });

    if (!error && data) {
      return NextResponse.json(data);
    }

    // Fallback: insert direct
    if (error) {
      console.warn('RPC create_personal_workout failed:', error.message);
    }

    const { data: workout, error: insertError } = await supabase
      .from('personal_workouts')
      .insert({
        member_id: memberId,
        date: date || new Date().toISOString().split('T')[0],
        title: title.trim(),
        category,
        duration,
        description: description || null,
        blocks: blocks as WorkoutBlock[],
        score: score || null,
        notes: notes || null,
        feeling: feeling || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert personal workout error:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la séance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workout_id: workout.id,
      message: 'Séance créée avec succès'
    });

  } catch (err) {
    console.error('Create personal workout error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/portal/personal-workouts - Modifier une séance
export async function PUT(request: NextRequest) {
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
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de séance requis' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const memberId = portalSession.memberId;

    // Vérifier que la séance appartient au membre
    const { data: existing } = await supabase
      .from('personal_workouts')
      .select('id')
      .eq('id', id)
      .eq('member_id', memberId)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Séance non trouvée' },
        { status: 404 }
      );
    }

    // Mettre à jour
    const { error: updateError } = await supabase
      .from('personal_workouts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('member_id', memberId);

    if (updateError) {
      console.error('Update personal workout error:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la modification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Séance mise à jour'
    });

  } catch (err) {
    console.error('Update personal workout error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/portal/personal-workouts?id=xxx - Supprimer une séance
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'ID de séance requis' },
      { status: 400 }
    );
  }

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
    const supabase = createAdminClient();
    const memberId = portalSession.memberId;

    const { error } = await supabase
      .from('personal_workouts')
      .delete()
      .eq('id', id)
      .eq('member_id', memberId);

    if (error) {
      console.error('Delete personal workout error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Séance supprimée'
    });

  } catch (err) {
    console.error('Delete personal workout error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
