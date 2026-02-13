import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
    const accessToken = user.access_token

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No GitHub access token in session' },
        { status: 400 }
      )
    }

    console.log('[v0] Starting analysis for user:', user.github_username)

    // Step 1: Fetch basic GitHub profile
    console.log('[v0] Fetching GitHub profile...')
    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!profileResponse.ok) {
      console.error('[v0] Failed to fetch profile:', profileResponse.status)
      return NextResponse.json(
        { error: 'Failed to fetch GitHub profile' },
        { status: 400 }
      )
    }

    const profile = await profileResponse.json()
    console.log('[v0] Profile fetched successfully')

    // Step 2: Fetch public repositories
    console.log('[v0] Fetching repositories...')
    const reposResponse = await fetch(`https://api.github.com/user/repos?per_page=100&sort=stars`, {
      headers: {
        Authorization: `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!reposResponse.ok) {
      console.error('[v0] Failed to fetch repos:', reposResponse.status)
      return NextResponse.json(
        { error: 'Failed to fetch repositories' },
        { status: 400 }
      )
    }

    const repositories = await reposResponse.json()
    console.log('[v0] Found', repositories.length, 'repositories')

    // Step 3: Calculate a simple score
    const overallScore = Math.min(
      100,
      Math.round(
        (Math.min(profile.followers, 100) / 100) * 20 +
        (Math.min(repositories.length, 50) / 50) * 20 +
        (Math.min(profile.public_repos, 100) / 100) * 20 +
        (profile.public_gists > 0 ? 20 : 10) +
        (profile.bio ? 10 : 0) +
        (profile.company ? 5 : 0) +
        (profile.location ? 5 : 0)
      )
    )

    console.log('[v0] Score calculated:', overallScore)

    // Step 4: Generate basic recommendations
    const recommendations = {
      summary: `GitHub profile analysis for ${profile.login}. You have ${profile.followers} followers and ${repositories.length} public repositories.`,
      recommendations: [
        {
          category: 'Profile',
          title: 'Complete Your Bio',
          description: profile.bio ? 'Your bio is filled. Keep it updated with your latest skills.' : 'Add a compelling bio to help others understand your expertise.',
          priority: profile.bio ? 'low' : 'high',
        },
        {
          category: 'Repositories',
          title: 'Maintain Active Repositories',
          description: `You have ${repositories.length} repositories. Keep them updated and well-documented.`,
          priority: 'medium',
        },
        {
          category: 'Documentation',
          title: 'Add READMEs to Projects',
          description: 'Ensure all your repositories have comprehensive README files explaining what they do.',
          priority: 'high',
        },
      ],
      strengths: [
        `${profile.followers} followers`,
        `${repositories.length} public repositories`,
        'GitHub presence established',
      ],
      improvements: [
        'Increase repository documentation',
        'Contribute to open source projects',
        'Maintain consistent commit activity',
      ],
    }

    console.log('[v0] Analysis complete, sending results')

    return NextResponse.json({
      success: true,
      profile: {
        username: profile.login,
        name: profile.name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        followers: profile.followers,
        following: profile.following,
        public_repos: profile.public_repos,
      },
      score: {
        overall: overallScore,
        dimensions: {
          followers: { score: Math.min((profile.followers / 100) * 100, 100), name: 'Followers' },
          repos: { score: Math.min((repositories.length / 50) * 100, 100), name: 'Repositories' },
          docs: { score: 50, name: 'Documentation' },
          activity: { score: 60, name: 'Activity' },
        },
      },
      recommendations,
      repositories: repositories.slice(0, 10).map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
      })),
    })
  } catch (error) {
    console.error('[v0] Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze profile', details: String(error) },
      { status: 500 }
    )
  }
}
