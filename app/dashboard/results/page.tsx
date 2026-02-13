'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    try {
      // Get analysis results from session storage
      const storedResults = sessionStorage.getItem('analysisResults')
      if (!storedResults) {
        console.log('[v0] No analysis results found, redirecting...')
        router.push('/dashboard/welcome')
        return
      }

      const data = JSON.parse(storedResults)
      setResults(data)
      setLoading(false)
    } catch (error) {
      console.error('[v0] Failed to parse results:', error)
      router.push('/dashboard/welcome')
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-foreground font-semibold">Loading results...</div>
        </div>
      </div>
    )
  }

  if (!results) {
    return null
  }

  const { profile, score, recommendations, repositories } = results

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/welcome" className="text-primary hover:underline text-sm font-semibold">
            ← Back to Profile
          </Link>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8 mb-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">GitIQ Score</h1>
            <div className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              {score?.overall || 'N/A'}
            </div>
            <p className="text-muted-foreground text-lg">out of 100</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-2xl shadow-lg border border-border p-6 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Profile Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="text-lg font-semibold text-foreground">{profile?.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Repositories Analyzed</p>
              <p className="text-lg font-semibold text-foreground">{repositories?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Followers</p>
              <p className="text-lg font-semibold text-foreground">{profile?.followers || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Following</p>
              <p className="text-lg font-semibold text-foreground">{profile?.following || 0}</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-border p-6 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">AI Recommendations</h2>
            <div className="space-y-4">
              {recommendations.map((rec: any, idx: number) => (
                <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                  <p className="font-semibold text-foreground">{rec.title || rec.area}</p>
                  <p className="text-sm text-muted-foreground mt-1">{rec.description || rec.suggestion}</p>
                  {rec.priority && (
                    <span className={`inline-block text-xs font-semibold mt-2 px-2 py-1 rounded ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Breakdown */}
        {score?.dimensions && (
          <div className="bg-white rounded-2xl shadow-lg border border-border p-6 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Score Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(score.dimensions).map(([dimension, value]: any) => (
                <div key={dimension} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground capitalize">{dimension.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">{Math.round(value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Repositories */}
        {repositories && repositories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-border p-6 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Top Repositories</h2>
            <div className="space-y-4">
              {repositories.slice(0, 5).map((repo: any, idx: number) => (
                <div key={idx} className="border border-border rounded-lg p-4">
                  <a 
                    href={repo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline"
                  >
                    {repo.name}
                  </a>
                  {repo.description && (
                    <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
                  )}
                  <div className="flex gap-4 mt-3 text-sm">
                    {repo.stars && <span className="text-foreground">⭐ {repo.stars} stars</span>}
                    {repo.language && <span className="text-muted-foreground">{repo.language}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 mb-8">
          <Link 
            href="/dashboard/welcome"
            className="block w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl text-center transition"
          >
            Run Analysis Again
          </Link>
          <Link 
            href="/api/auth/logout"
            className="block w-full bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 px-4 rounded-xl text-center transition"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  )
}
