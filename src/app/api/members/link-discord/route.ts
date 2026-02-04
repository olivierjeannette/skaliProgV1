import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

interface LinkDiscordBody {
  memberId: string;
}

interface PortalSession {
  discord_id: string;
  discord_username: string;
  discord_avatar: string | null;
  member: unknown;
  access_token: string;
  expires_at: number;
}

// POST /api/members/link-discord
// Lie le compte Discord connecté à un membre Skali
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const portalSessionRaw = cookieStore.get('portal_session')?.value;

  // Vérifier session portal
  if (!portalSessionRaw) {
    return NextResponse.json(
      { error: 'Non autorisé - Connectez-vous avec Discord' },
      { status: 401 }
    );
  }

  let portalSession: PortalSession;
  try {
    portalSession = JSON.parse(portalSessionRaw);
  } catch {
    return NextResponse.json(
      { error: 'Session invalide' },
      { status: 401 }
    );
  }

  // Vérifier expiration
  if (portalSession.expires_at && Date.now() > portalSession.expires_at) {
    cookieStore.delete('portal_session');
    return NextResponse.json(
      { error: 'Session expirée' },
      { status: 401 }
    );
  }

  // Parser le body
  let body: LinkDiscordBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Body JSON invalide' },
      { status: 400 }
    );
  }

  const { memberId } = body;

  if (!memberId) {
    return NextResponse.json(
      { error: 'memberId requis' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const discordId = portalSession.discord_id;

    // Utiliser la RPC pour lier
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('link_discord_to_member', {
        p_discord_id: discordId,
        p_member_id: memberId,
        p_linked_by: 'portal'
      });

    if (rpcError) {
      // Fallback si RPC n'existe pas
      console.warn('RPC link_discord_to_member failed, using fallback:', rpcError.message);

      // 1. Vérifier que le membre existe et n'est pas déjà lié
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (memberError || !member) {
        return NextResponse.json(
          { error: 'Membre non trouvé' },
          { status: 404 }
        );
      }

      // 2. Vérifier si déjà lié à un autre Discord
      if (member.discord_id && member.discord_id !== discordId) {
        return NextResponse.json(
          { error: 'Ce membre est déjà lié à un autre compte Discord' },
          { status: 409 }
        );
      }

      // 3. Mettre à jour discord_members
      const { error: dmError } = await supabase
        .from('discord_members')
        .update({
          member_id: memberId,
          linked_at: new Date().toISOString(),
          linked_by: 'portal'
        })
        .eq('discord_id', discordId);

      if (dmError) {
        console.error('Error updating discord_members:', dmError);
      }

      // 4. Mettre à jour members.discord_id
      const { error: updateError } = await supabase
        .from('members')
        .update({ discord_id: discordId })
        .eq('id', memberId);

      if (updateError) {
        console.error('Error updating member.discord_id:', updateError);
        return NextResponse.json(
          { error: 'Erreur lors de la liaison' },
          { status: 500 }
        );
      }

      // 5. Récupérer le membre mis à jour
      const { data: updatedMember } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      // 6. Mettre à jour la session avec le membre lié
      const nameParts = (updatedMember?.name || '').split(' ');
      const updatedSession = {
        ...portalSession,
        member: updatedMember ? {
          id: updatedMember.id,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || nameParts[0] || '',
          email: updatedMember.email
        } : null
      };

      cookieStore.set('portal_session', JSON.stringify(updatedSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      return NextResponse.json({
        success: true,
        member: {
          id: updatedMember?.id,
          name: updatedMember?.name,
          first_name: nameParts[0],
          last_name: nameParts.slice(1).join(' ') || '',
          email: updatedMember?.email,
          discord_id: discordId,
          discord_username: portalSession.discord_username,
          discord_avatar: portalSession.discord_avatar
        }
      });
    }

    // RPC a fonctionné
    if (!rpcResult?.success) {
      return NextResponse.json(
        { error: rpcResult?.message || 'Erreur lors de la liaison' },
        { status: 400 }
      );
    }

    // Mettre à jour la session cookie avec le membre
    const linkedMember = rpcResult.member;
    const updatedSession = {
      ...portalSession,
      member: linkedMember ? {
        id: linkedMember.id,
        first_name: linkedMember.first_name,
        last_name: linkedMember.last_name,
        email: linkedMember.email
      } : null
    };

    cookieStore.set('portal_session', JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json({
      success: true,
      member: linkedMember
    });

  } catch (err) {
    console.error('Link discord error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
