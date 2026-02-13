import { NextRequest, NextResponse } from 'next/server'

// This route is just for initiating the GitHub OAuth flow (if needed)
// The actual callback is handled in /api/auth/github/callback/route.ts

export async function GET(request: NextRequest) {
  // If someone hits this route directly, redirect to home
  return NextResponse.redirect(new URL('/', request.url))
}
