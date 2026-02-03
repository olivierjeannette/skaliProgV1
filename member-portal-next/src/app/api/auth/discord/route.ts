import { NextRequest, NextResponse } from 'next/server'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`

export async function GET(request: NextRequest) {
  // Generate Discord OAuth URL
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email',
  })

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`

  return NextResponse.redirect(discordAuthUrl)
}
