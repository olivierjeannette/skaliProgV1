import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AppError {
  id: string;
  error_type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  url?: string;
  user_agent?: string;
  user_role?: string;
  metadata?: Record<string, unknown>;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

// GET /api/errors - Récupérer les erreurs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resolved = searchParams.get('resolved');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const supabase = createAdminClient();

    let query = supabase
      .from('app_errors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (resolved !== null) {
      query = query.eq('resolved', resolved === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching errors:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des erreurs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ errors: data || [] });
  } catch (err) {
    console.error('API errors error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/errors - Logger une erreur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      error_type = 'error',
      stack,
      url,
      user_agent,
      user_role,
      metadata = {}
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('app_errors')
      .insert({
        error_type,
        message,
        stack,
        url,
        user_agent,
        user_role,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging error:', error);
      return NextResponse.json(
        { error: 'Erreur lors du logging' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, error: data });
  } catch (err) {
    console.error('API error logging:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH /api/errors - Marquer comme résolu
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, resolved, resolved_by } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = { resolved };
    if (resolved) {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = resolved_by || 'admin';
    } else {
      updateData.resolved_at = null;
      updateData.resolved_by = null;
    }

    const { error } = await supabase
      .from('app_errors')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API error update:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/errors - Supprimer une erreur
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'ID requis' },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('app_errors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API error delete:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
