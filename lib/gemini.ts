import { GoogleGenerativeAI } from '@google/generative-ai'
import { Repository } from './github'
import { ProfileScore } from './scoring'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const client = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export interface AIRecommendation {
  category: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actionItems: string[]
  estimatedImpact: string
}

export interface AIInsight {
  summary: string
  recommendations: AIRecommendation[]
  strengths: string[]
  improvements: string[]
}

async function generateRecommendationsWithGemini(
  profile: {
    username: string
    name: string | null
    bio: string | null
    followers: number
    following: number
  },
  repositories: Repository[],
  score: ProfileScore
): Promise<AIInsight> {
  try {
    const model = client.getGenerativeModel({ model: 'gemini-pro-vision' })

    // Prepare analysis context
    const repositorySummary = repositories
      .slice(0, 10)
      .map((r) => `- ${r.name}: ${r.stars} stars, ${r.language || 'No language'}, ${r.description || 'No description'}`)
      .join('\n')

    const prompt = `You are a GitHub profile analyzer and career mentor for developers. Analyze this GitHub profile and provide actionable recommendations.

GitHub Profile:
- Username: ${profile.username}
- Name: ${profile.name || 'Not provided'}
- Bio: ${profile.bio || 'Not provided'}
- Followers: ${profile.followers}
- Following: ${profile.following}
- Total Public Repositories: ${repositories.length}

Top Repositories:
${repositorySummary}

Profile Score Analysis:
${Object.entries(score.dimensions)
  .map(([key, dim]) => `- ${dim.name}: ${dim.score}/100 (${dim.details})`)
  .join('\n')}

Please provide:
1. A brief summary of the developer's GitHub presence
2. 3-5 specific, actionable recommendations to improve their GitHub profile
3. Key strengths based on the analysis
4. Areas for improvement

Format your response as JSON with this structure:
{
  "summary": "Brief overview",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "recommendations": [
    {
      "category": "category name",
      "title": "recommendation title",
      "description": "detailed description",
      "priority": "high|medium|low",
      "actionItems": ["action1", "action2"],
      "estimatedImpact": "how this will help"
    }
  ]
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response')
    }

    const insights = JSON.parse(jsonMatch[0])

    return {
      summary: insights.summary,
      recommendations: insights.recommendations,
      strengths: insights.strengths,
      improvements: insights.improvements,
    }
  } catch (error) {
    console.error('Error generating recommendations with Gemini:', error)

    // Return fallback recommendations
    return {
      summary: `${profile.username} has ${repositories.length} public repositories with a total score of ${score.overall}/100.`,
      recommendations: [
        {
          category: 'Documentation',
          title: 'Improve Repository Documentation',
          description: 'Add comprehensive README files to all repositories',
          priority: 'high',
          actionItems: [
            'Add README.md to repositories without documentation',
            'Include setup instructions and usage examples',
            'Add badges for build status and version',
          ],
          estimatedImpact: 'Significantly improve repository quality score and usability',
        },
        {
          category: 'Code Quality',
          title: 'Add Project Organization',
          description: 'Use topics and consistent folder structure',
          priority: 'high',
          actionItems: [
            'Add relevant topics to repositories',
            'Standardize folder structure across projects',
            'Add contributing guidelines',
          ],
          estimatedImpact: 'Better project visibility and contributor engagement',
        },
      ],
      strengths: [
        `${repositories.length} public repositories showing active development`,
        `${score.dimensions.projectImpact.score}/100 project impact score`,
      ],
      improvements: [
        'Improve documentation on existing projects',
        'Increase frequency of repository updates',
      ],
    }
  }
}

export async function generateAndSaveRecommendations(
  userId: string,
  profile: {
    username: string
    name: string | null
    bio: string | null
    followers: number
    following: number
  },
  repositories: Repository[],
  score: ProfileScore
): Promise<AIInsight> {
  const insights = await generateRecommendationsWithGemini(profile, repositories, score)

  try {
    await sql`
      INSERT INTO ai_recommendations (user_id, analysis_id, recommendations_data, created_at)
      VALUES (${userId}, ${score.analysisId}, ${JSON.stringify(insights)}, NOW())
    `
  } catch (error) {
    console.error('Error saving recommendations:', error)
  }

  return insights
}

export async function getLatestRecommendations(userId: string): Promise<AIInsight | null> {
  try {
    const result = await sql`
      SELECT recommendations_data FROM ai_recommendations
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (result.length === 0) return null

    return result[0].recommendations_data
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return null
  }
}
