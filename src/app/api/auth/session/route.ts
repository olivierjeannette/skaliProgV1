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
  } | null;
  access_token: string;
  expires_at: number;
}

interface AdminSession {
  isAuthenticated: boolean;
  role: 'ADMIN' | 'COACH' | 'ATHLETE';
  expiresAt: number;
}

export async function GET() {
  const cookieStore = await cookies();

  // Check admin session first (skali-session)
  const adminSessionCookie = cookieStore.get('skali-session');
  if (adminSessionCookie?.value) {
    try {
      const adminSession: AdminSession = JSON.parse(adminSessionCookie.value);

      // Check if session is expired
      if (adminSession.expiresAt < Date.now()) {
        // Don't delete here, let logout handle it
        return NextResponse.json({ session: null, error: 'Session expired' });
      }

      return NextResponse.json({
        session: {
          isAuthenticated: adminSession.isAuthenticated,
          role: adminSession.role,
          expiresAt: adminSession.expiresAt,
        },
        type: 'admin',
      });
    } catch {
      // Invalid admin session, continue to check portal session
    }
  }

  // Check portal session (portal_session)
  const portalSessionCookie = cookieStore.get('portal_session');
  if (portalSessionCookie?.value) {
    try {
      const session: PortalSession = JSON.parse(portalSessionCookie.value);

      // Check if session is expired
      if (session.expires_at < Date.now()) {
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
        type: 'portal',
      });
    } catch {
      return NextResponse.json({ session: null, error: 'Invalid session' });
    }
  }

  return NextResponse.json({ session: null });
}
