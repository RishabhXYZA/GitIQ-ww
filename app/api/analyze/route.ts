import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Pool } from 'pg'
import { getGitHubProfile, getPinnedRepositories, getTopStarredRepositories, getRecentRepositories, saveRepositories } from '@/lib/github'
import { calculateProfileScore } from '@/lib/scoring'
import { generateAndSaveRecommendations } from '@/lib/gemini'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(session.value)
    const userId = user.github_id
    const accessToken = user.access_token

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No GitHub access token in session' },
        { status: 400 }
      )
    }

    console.log('[v0] Starting analysis for user:', user.github_username)

    // Fetch GitHub profile data
    const profile = await getGitHubProfile(accessToken)
    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to fetch GitHub profile' },
        { status: 400 }
      )
    }

    // Fetch repositories
    const [pinnedRepos, topStarredRepos, recentRepos] = await Promise.all([
      getPinnedRepositories(profile.username, accessToken),
      getTopStarredRepositories(profile.username, accessToken),
      getRecentRepositories(profile.username, accessToken),
    ])

    // Combine unique repositories
    const allReposMap = new Map()
    ;[...pinnedRepos, ...topStarredRepos, ...recentRepos].forEach((repo) => {
      if (!allReposMap.has(repo.name)) {
        allReposMap.set(repo.name, repo)
      }
    })

    const allRepositories = Array.from(allReposMap.values())

    // Save repositories to database
    await saveRepositories(userId, allRepositories)

    // Calculate profile score
    const profileScore = await calculateProfileScore(
      userId,
      allRepositories,
      {
        name: profile.name,
        bio: profile.bio,
        followers: profile.followers,
        following: profile.following,
        created_at: profile.created_at,
      }
    )

    // Generate AI recommendations
    const recommendations = await generateAndSaveRecommendations(
      userId,
      {
        username: profile.username,
        name: profile.name,
        bio: profile.bio,
        followers: profile.followers,
        following: profile.following,
      },
      allRepositories,
      profileScore
    )

    // Update GitIQ profile
    const analysisData = JSON.stringify({
      profile,
      score: profileScore,
      recommendations,
    })

    try {
      await pool.query(
        `INSERT INTO gitiq_profiles (user_id, overall_score, repositories_count, analysis_result_data, last_analyzed_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET
           overall_score = $2,
           repositories_count = $3,
           analysis_result_data = $4,
           last_analyzed_at = NOW()`,
        [userId, profileScore.overall, allRepositories.length, analysisData]
      )
      console.log('[v0] Analysis saved to database')
    } catch (dbError) {
      console.warn('[v0] Database save failed, but returning results:', dbError)
    }

    return NextResponse.json({
      success: true,
      profile,
      score: profileScore,
      recommendations,
      repositories: allRepositories,
    })
  } catch (error) {
    console.error('[v0] Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze profile', details: String(error) },
      { status: 500 }
    )
  }
}
