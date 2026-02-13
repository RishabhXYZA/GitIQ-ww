import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: NextRequest) {
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

    // Get user profile
    const userResult = await pool.query(
      'SELECT id, github_username, avatar_url, bio FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userProfile = userResult.rows[0]

    // Get GitIQ profile (latest analysis)
    const profileResult = await pool.query(
      `SELECT overall_score, repositories_count, analysis_result_data, last_analyzed_at 
       FROM gitiq_profiles 
       WHERE user_id = $1
       ORDER BY last_analyzed_at DESC
       LIMIT 1`,
      [userId]
    )

    if (profileResult.rows.length === 0) {
      return NextResponse.json({
        profile: {
          username: userProfile.github_username,
          name: null,
          avatar_url: userProfile.avatar_url,
          bio: userProfile.bio,
        },
        score: null,
        recommendations: null,
        repositories: [],
      })
    }

    const profile = profileResult.rows[0]
    const analysisData = profile.analysis_result_data

    // Get repositories
    const reposResult = await pool.query(
      `SELECT repo_name, description, url, stars, language, topics, updated_at, forks
       FROM repositories 
       WHERE user_id = $1
       ORDER BY stars DESC
       LIMIT 50`,
      [userId]
    )

    const repositories = reposResult.rows.map((repo) => ({
      id: repo.repo_name,
      name: repo.repo_name,
      description: repo.description,
      url: repo.url,
      stars: repo.stars,
      language: repo.language,
      topics: repo.topics || [],
      forks: repo.forks,
      updated_at: repo.updated_at,
    }))

    return NextResponse.json({
      profile: {
        username: userProfile.github_username,
        name: null,
        avatar_url: userProfile.avatar_url,
        bio: userProfile.bio,
      },
      score: analysisData.score,
      recommendations: analysisData.recommendations,
      repositories,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
