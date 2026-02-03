import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`;

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  email?: string;
}

async function exchangeCodeForToken(code: string): Promise<DiscordTokenResponse> {
  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  return response.json();
}

async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get Discord user');
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('discord_oauth_state')?.value;
  const redirectTo = cookieStore.get('discord_oauth_redirect')?.value || '/portal';

  // Clean up OAuth cookies
  cookieStore.delete('discord_oauth_state');
  cookieStore.delete('discord_oauth_redirect');

  // Handle Discord errors
  if (error) {
    console.error('Discord OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/portal?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Validate state to prevent CSRF
  if (!state || state !== storedState) {
    console.error('Invalid OAuth state');
    return NextResponse.redirect(
      new URL('/portal?error=invalid_state', request.url)
    );
  }

  // Validate code
  if (!code) {
    return NextResponse.redirect(
      new URL('/portal?error=no_code', request.url)
    );
  }

  try {
    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code);

    // Get Discord user info
    const discordUser = await getDiscordUser(tokenData.access_token);

    // Create Supabase client
    const supabase = await createClient();

    // Check if this Discord user exists in our discord_members table
    const { data: discordMember } = await supabase
      .from('discord_members')
      .select('*, members(*)')
      .eq('discord_id', discordUser.id)
      .single();

    // Update or insert Discord member info
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;

    await supabase
      .from('discord_members')
      .upsert({
        discord_id: discordUser.id,
        discord_username: discordUser.global_name || discordUser.username,
        discord_avatar: avatarUrl,
        last_sync: new Date().toISOString(),
        is_active: true,
      }, {
        onConflict: 'discord_id',
      });

    // Create session data
    const sessionData = {
      discord_id: discordUser.id,
      discord_username: discordUser.global_name || discordUser.username,
      discord_avatar: avatarUrl,
      member: discordMember?.members || null,
      access_token: tokenData.access_token,
      expires_at: Date.now() + tokenData.expires_in * 1000,
    };

    // Store session in secure httpOnly cookie
    cookieStore.set('portal_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in,
      path: '/',
    });

    // Redirect to portal
    return NextResponse.redirect(new URL(redirectTo, request.url));

  } catch (err) {
    console.error('Discord OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/portal?error=auth_failed', request.url)
    );
  }
}
