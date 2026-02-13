import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'GitHub Client ID not configured' },
        { status: 500 }
      )
    }

    // Get the origin from the request (this works in production)
    const origin = request.headers.get('x-forwarded-proto') === 'https'
      ? `https://${request.headers.get('host')}`
      : `http://${request.headers.get('host')}`

    const redirectUri = `${origin}/api/auth/github/callback`

    console.log('[v0] Initiating GitHub OAuth:', {
      origin,
      redirectUri,
      clientId: clientId ? 'SET' : 'MISSING',
    })

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'repo,read:user',
      allow_signup: 'true',
    })

    const gitHubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

    return NextResponse.redirect(gitHubAuthUrl)
  } catch (error) {
    console.error('[v0] Auth initiate error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    )
  }
}
