import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  // Clear session cookie
  const cookieStore = await cookies()
  cookieStore.delete('skali-session')

  // Redirect to login page
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}
