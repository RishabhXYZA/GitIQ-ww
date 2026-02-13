import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const CLIENT_ID = process.env.GITHUB_CLIENT_ID
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
  try {
    // Build redirect URI dynamically from request origin
    const origin = request.headers.get('x-forwarded-proto') === 'https'
      ? `https://${request.headers.get('x-forwarded-host')}`
      : request.nextUrl.origin
    const REDIRECT_URI = `${origin}/api/auth/github/callback`

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    console.log('[v0] OAuth callback received:', { code: code ? 'present' : 'missing', error })

    // Validate environment variables
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('[v0] Missing GitHub credentials')
      return NextResponse.redirect(
        new URL('/auth/error?message=Server misconfiguration: Missing GitHub credentials', request.url)
      )
    }

    // Handle GitHub auth errors
    if (error) {
      console.error('[v0] GitHub auth error:', error)
      return NextResponse.redirect(
        new URL(`/auth/error?message=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code) {
      console.error('[v0] No authorization code received')
      return NextResponse.redirect(
        new URL('/auth/error?message=No authorization code received', request.url)
      )
    }

    // Exchange code for access token
    console.log('[v0] Exchanging code for access token...')
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('[v0] Token exchange failed:', tokenResponse.status, tokenResponse.statusText)
      return NextResponse.redirect(
        new URL('/auth/error?message=Failed to exchange authorization code', request.url)
      )
    }

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error('[v0] No access token in response:', tokenData)
      return NextResponse.redirect(
        new URL('/auth/error?message=Failed to obtain access token', request.url)
      )
    }

    console.log('[v0] Access token obtained successfully')

    // Get user data from GitHub
    console.log('[v0] Fetching GitHub user data...')
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'GitIQ',
      },
    })

    if (!userResponse.ok) {
      console.error('[v0] Failed to fetch user:', userResponse.status)
      return NextResponse.redirect(
        new URL('/auth/error?message=Failed to fetch GitHub user data', request.url)
      )
    }

    const gitHubUser = await userResponse.json()
    console.log('[v0] GitHub user fetched:', gitHubUser.login)

    // Save user to database
    console.log('[v0] Saving user to database...')
    const dbResult = await pool.query(
      `INSERT INTO users (github_id, github_username, avatar_url, bio)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (github_id)
       DO UPDATE SET
         github_username = $2,
         avatar_url = $3,
         bio = $4,
         updated_at = NOW()
       RETURNING id, github_id, github_username, avatar_url, bio`,
      [gitHubUser.id, gitHubUser.login, gitHubUser.avatar_url, gitHubUser.bio]
    )

    if (dbResult.rows.length === 0) {
      console.error('[v0] Failed to save user to database')
      return NextResponse.redirect(
        new URL('/auth/error?message=Failed to save user data', request.url)
      )
    }

    const savedUser = dbResult.rows[0]
    console.log('[v0] User saved to database with ID:', savedUser.id)

    // Store user data in session
    const userData = {
      id: savedUser.id,
      github_id: savedUser.github_id,
      github_username: savedUser.github_username,
      avatar_url: savedUser.avatar_url,
      bio: savedUser.bio,
      access_token: tokenData.access_token,
    }

    // Create session cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    
    // Store user session in cookie
    response.cookies.set('session', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log('[v0] User authenticated successfully, redirecting to dashboard')
    return response
  } catch (error) {
    console.error('[v0] OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/auth/error?message=${encodeURIComponent('An error occurred during authentication')}`, request.url)
    )
  }
}
