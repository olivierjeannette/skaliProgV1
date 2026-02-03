import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Discord OAuth2 configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`;

// Scopes needed for member identification
const SCOPES = ['identify', 'guilds.members.read'].join(' ');

// Generate a random state for CSRF protection
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function GET(request: NextRequest) {
  // Check if Discord OAuth is configured
  if (!DISCORD_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Discord OAuth not configured' },
      { status: 500 }
    );
  }

  // Generate state for CSRF protection
  const state = generateState();

  // Store state in cookie for validation on callback
  const cookieStore = await cookies();
  cookieStore.set('discord_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  // Get optional redirect URL from query params
  const searchParams = request.nextUrl.searchParams;
  const redirectTo = searchParams.get('redirect') || '/portal';

  cookieStore.set('discord_oauth_redirect', redirectTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  });

  // Build Discord OAuth URL
  const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize');
  discordAuthUrl.searchParams.set('client_id', DISCORD_CLIENT_ID);
  discordAuthUrl.searchParams.set('redirect_uri', DISCORD_REDIRECT_URI);
  discordAuthUrl.searchParams.set('response_type', 'code');
  discordAuthUrl.searchParams.set('scope', SCOPES);
  discordAuthUrl.searchParams.set('state', state);
  discordAuthUrl.searchParams.set('prompt', 'none'); // Skip consent if already authorized

  // Redirect to Discord
  return NextResponse.redirect(discordAuthUrl.toString());
}
