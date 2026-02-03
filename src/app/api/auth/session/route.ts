import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export interface PortalSession {
  discord_id: string;
  discord_username: string;
  discord_avatar: string | null;
  member: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    // Add other member fields as needed
  } | null;
  access_token: string;
  expires_at: number;
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('portal_session');

  if (!sessionCookie?.value) {
    return NextResponse.json({ session: null });
  }

  try {
    const session: PortalSession = JSON.parse(sessionCookie.value);

    // Check if session is expired
    if (session.expires_at < Date.now()) {
      cookieStore.delete('portal_session');
      return NextResponse.json({ session: null, error: 'Session expired' });
    }

    // Return session without sensitive data
    return NextResponse.json({
      session: {
        discord_id: session.discord_id,
        discord_username: session.discord_username,
        discord_avatar: session.discord_avatar,
        member: session.member,
        is_linked: !!session.member,
      },
    });
  } catch {
    cookieStore.delete('portal_session');
    return NextResponse.json({ session: null, error: 'Invalid session' });
  }
}
