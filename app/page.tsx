import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export default async function Home() {
  // Check if user is already logged in
  const cookieStore = await cookies()
  const session = cookieStore.get('session')

  if (session) {
    redirect('/dashboard')
  }

  // Build GitHub auth URL with proper URL encoding
  const clientId = process.env.GITHUB_CLIENT_ID || ''
  const redirectUri = process.env.NEXTAUTH_URL 
    ? `${process.env.NEXTAUTH_URL}/api/auth/github/callback`
    : 'http://localhost:3000/api/auth/github/callback'
  
  console.log('[v0] OAuth Config:', {
    clientId: clientId ? 'SET' : 'MISSING',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    redirectUri,
  })
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,read:user',
    allow_signup: 'true',
  })
  
  const gitHubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`
  console.log('[v0] GitHub Auth URL:', gitHubAuthUrl)

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 mb-4">
            <span className="text-2xl font-bold text-white">IQ</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">GitIQ</h1>
          <p className="text-muted-foreground text-lg">
            Analyze & Enhance Your GitHub Profile
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8 mb-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Welcome Back
              </h2>
              <p className="text-muted-foreground">
                Get AI-powered insights to improve your GitHub presence and unlock your coding potential.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">AI-Powered Analysis</p>
                  <p className="text-sm text-muted-foreground">Powered by Google Gemini</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5">
                  <span className="text-secondary text-xs font-bold">✓</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Score Tracking</p>
                  <p className="text-sm text-muted-foreground">Monitor improvements over time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Personalized Recommendations</p>
                  <p className="text-sm text-muted-foreground">Improve code quality & documentation</p>
                </div>
              </div>
            </div>

            {/* Auth Button */}
            <Link href={gitHubAuthUrl} className="block w-full">
              <Button
                size="lg"
                className="w-full bg-foreground hover:bg-foreground/90 text-white rounded-xl font-semibold flex items-center justify-center gap-2 h-12"
              >
                <Github className="w-5 h-5" />
                Sign in with GitHub
              </Button>
            </Link>

            <p className="text-xs text-center text-muted-foreground">
              We only access your public profile and repository data. Your privacy is important to us.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            GitIQ uses GitHub OAuth for secure authentication.{' '}
            <Link href="#" className="text-primary hover:underline">
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
