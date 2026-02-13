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
    const userId = user.id

    // Get user access token from database
    const userRecord = await sql`
      SELECT access_token FROM users WHERE id = ${userId}
    `

    if (userRecord.length === 0 || !userRecord[0].access_token) {
      return NextResponse.json(
        { error: 'No GitHub access token found' },
        { status: 400 }
      )
    }

    const accessToken = userRecord[0].access_token

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
    await sql`
      INSERT INTO gitiq_profiles (user_id, overall_score, repositories_count, analysis_result_data, last_analyzed_at)
      VALUES (${userId}, ${profileScore.overall}, ${allRepositories.length}, ${JSON.stringify({
        profile,
        score: profileScore,
        recommendations,
      })}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        overall_score = ${profileScore.overall},
        repositories_count = ${allRepositories.length},
        analysis_result_data = ${JSON.stringify({
          profile,
          score: profileScore,
          recommendations,
        })},
        last_analyzed_at = NOW()
    `

    return NextResponse.json({
      success: true,
      profile,
      score: profileScore,
      recommendations,
      repositories: allRepositories,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
