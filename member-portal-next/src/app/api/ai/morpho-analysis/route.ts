import { NextRequest, NextResponse } from 'next/server'
import { buildMorphoPrompt } from '@/lib/ai/claude'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY!
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

export async function POST(request: NextRequest) {
  try {
    const { photos, memberName } = await request.json()

    if (!photos || photos.length < 1) {
      return NextResponse.json(
        { error: 'At least one photo is required' },
        { status: 400 }
      )
    }

    // Build the prompt
    const prompt = buildMorphoPrompt(memberName)

    // Prepare image content for Claude
    const imageContent = photos.map((photo: { data_url: string; type: string }) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: photo.data_url.replace(/^data:image\/\w+;base64,/, ''),
      },
    }))

    // Call Claude API
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              ...imageContent,
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Claude API error:', errorData)
      return NextResponse.json(
        { error: 'AI analysis failed' },
        { status: 500 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      content: data.content[0].text,
      usage: data.usage,
    })
  } catch (error) {
    console.error('Morpho analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
