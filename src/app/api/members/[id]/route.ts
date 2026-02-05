import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/members/[id]
// Récupère un membre avec ses stats pour le Portal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Vérifier session (portal ou admin)
  const cookieStore = await cookies();
  const portalSession = cookieStore.get('portal_session')?.value;
  const adminSession = cookieStore.get('skali-session')?.value;

  if (!portalSession && !adminSession) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  if (!id) {
    return NextResponse.json(
      { error: 'ID membre requis' },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    // Essayer d'utiliser la RPC
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('get_member_for_portal', { p_member_id: id });

    if (rpcError) {
      // Fallback: requête directe
      console.warn('RPC get_member_for_portal failed, using fallback:', rpcError.message);

      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (memberError || !member) {
        return NextResponse.json(
          { error: 'Membre non trouvé' },
          { status: 404 }
        );
      }

      const nameParts = (member.name || '').split(' ');

      return NextResponse.json({
        success: true,
        member: {
          id: member.id,
          name: member.name,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          email: member.email,
          phone: member.phone,
          gender: member.gender,
          birthdate: member.birthdate,
          weight: member.weight,
          height: member.height,
          body_fat_percentage: member.body_fat_percentage,
          lean_mass: member.lean_mass,
          photo: member.photo,
          is_active: member.is_active,
          discord_id: member.discord_id,
          created_at: member.created_at
        },
        stats: {
          cardio: 50,
          force: 50,
          gym: 50,
          puissance: 50,
          niveau: 1
        }
      });
    }

    if (!rpcResult?.success) {
      return NextResponse.json(
        { error: rpcResult?.error || 'Membre non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(rpcResult);

  } catch (err) {
    console.error('Get member error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
