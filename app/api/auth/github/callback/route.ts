import { NextRequest, NextResponse } from 'next/server'
import { getGitHubUser, saveOrUpdateUser } from '@/lib/auth'

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/github/callback`

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle GitHub auth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?message=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/error?message=No authorization code received', request.url)
    )
  }

  try {
    // Exchange code for access token
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

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error('[v0] Token error:', tokenData)
      return NextResponse.redirect(
        new URL('/auth/error?message=Failed to obtain access token', request.url)
      )
    }

    // Get user data from GitHub
    const gitHubUser = await getGitHubUser(tokenData.access_token)

    if (!gitHubUser) {
      console.error('[v0] Failed to get GitHub user')
      return NextResponse.redirect(
        new URL('/auth/error?message=Failed to fetch GitHub user data', request.url)
      )
    }

    // Save or update user in database
    const user = await saveOrUpdateUser(gitHubUser, tokenData.access_token)

    if (!user) {
      console.error('[v0] Failed to save user')
      return NextResponse.redirect(
        new URL('/auth/error?message=Failed to save user data', request.url)
      )
    }

    // Create session cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    
    // Store user session in cookie
    response.cookies.set('session', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('[v0] OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/auth/error?message=An error occurred during authentication', request.url)
    )
  }
}
