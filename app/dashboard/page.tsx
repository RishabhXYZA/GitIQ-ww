'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScoreCard } from '@/components/score-card'
import { DimensionsRadar } from '@/components/dimensions-radar'
import { Recommendations } from '@/components/recommendations'
import { RepositoriesList } from '@/components/repositories-list'
import { Loader2, LogOut, RefreshCw } from 'lucide-react'
import { Repository } from '@/lib/github'
import { ProfileScore } from '@/lib/scoring'
import { AIInsight } from '@/lib/gemini'

interface DashboardData {
  profile: {
    username: string
    name: string | null
    avatar_url: string
    bio: string | null
  }
  score: ProfileScore
  recommendations: AIInsight
  repositories: Repository[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    // Load initial data
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard')
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/')
          return
        }
        throw new Error('Failed to load dashboard')
      }
      const dashboardData = await res.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true)
      const res = await fetch('/api/analyze', { method: 'POST' })
      if (!res.ok) throw new Error('Analysis failed')
      const result = await res.json()
      setData({
        profile: result.profile,
        score: result.score,
        recommendations: result.recommendations,
        repositories: result.repositories,
      })
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'session=; max-age=0; path=/'
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Welcome to GitIQ</h1>
          <p className="text-muted-foreground mb-6">Let&apos;s analyze your GitHub profile!</p>
          <Button onClick={handleAnalyze} disabled={analyzing} size="lg" className="rounded-lg">
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Start Analysis'
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold">IQ</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground">GitIQ</h1>
              <p className="text-xs text-muted-foreground">GitHub Profile Analyzer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-foreground">{data.profile.name || data.profile.username}</p>
              <p className="text-sm text-muted-foreground">@{data.profile.username}</p>
            </div>
            {data.profile.avatar_url && (
              <img src={data.profile.avatar_url} alt={data.profile.username} className="w-10 h-10 rounded-full" />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Header Section */}
        <section className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Your Profile Analysis</h2>
              <p className="text-muted-foreground">
                Last updated: {new Date(data.score.lastAnalyzedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                variant="outline"
                className="rounded-lg"
                size="sm"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-analyze
                  </>
                )}
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="rounded-lg">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </section>

        {/* Score Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScoreCard
            score={data.score.overall}
            improvement={data.score.improvement}
            title="Overall Score"
            subtitle="Your comprehensive GitHub profile rating"
          />
          <div className="space-y-4">
            {data.score.improvement !== null && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-foreground mb-2">Score Improvement</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {Math.abs(Math.round(data.score.improvement))}%
                  </span>
                  <span className="text-muted-foreground">
                    {data.score.improvement > 0 ? 'improvement' : 'change'} from last analysis
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                <p className="text-xs text-muted-foreground mb-1">Repositories</p>
                <p className="text-2xl font-bold text-foreground">{data.repositories.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">Followers</p>
                <p className="text-2xl font-bold text-foreground">{data.score.dimensions.contributionActivity?.details?.split(',')[0] || '0'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dimensions Radar */}
        <section>
          <DimensionsRadar dimensions={data.score.dimensions} />
        </section>

        {/* Recommendations */}
        <section>
          <Recommendations recommendations={data.recommendations.recommendations} />
        </section>

        {/* Repositories */}
        <section>
          <RepositoriesList repositories={data.repositories} />
        </section>
      </main>
    </div>
  )
}
