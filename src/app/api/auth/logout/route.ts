import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();

  // Clear session cookie
  cookieStore.delete('portal_session');

  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();

  // Clear session cookie
  cookieStore.delete('portal_session');

  // Redirect to portal login
  return NextResponse.redirect(new URL('/portal', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}
