'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get session from cookie
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('session='))
    
    if (!sessionCookie) {
      router.push('/')
      return
    }

    try {
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie.split('=')[1]))
      setUser(sessionData)
    } catch (error) {
      console.error('[v0] Failed to parse session:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-foreground font-semibold mb-2">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 mb-4">
              <span className="text-2xl font-bold text-white">IQ</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome to GitIQ!</h1>
            <p className="text-muted-foreground text-lg">Authentication successful</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Profile</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {user.avatar_url && (
                  <img 
                    src={user.avatar_url} 
                    alt={user.github_username}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-foreground">{user.github_username}</p>
                  <p className="text-sm text-muted-foreground">GitHub ID: {user.github_id}</p>
                </div>
              </div>
              {user.bio && (
                <p className="text-foreground mt-2">{user.bio}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <a 
              href="/dashboard"
              className="block w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl text-center transition"
            >
              Go to Dashboard
            </a>
            <a 
              href="/api/auth/logout"
              className="block w-full bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 px-4 rounded-xl text-center transition"
            >
              Logout
            </a>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Your session is secure and stored locally
          </p>
        </div>
      </div>
    </div>
  )
}
