import { neon } from '@neondatabase/serverless'
import { Repository } from './github'

const sql = neon(process.env.DATABASE_URL!)

export interface ScoreDimension {
  name: string
  weight: number
  score: number
  maxScore: number
  details: string
}

export interface ProfileScore {
  overall: number
  dimensions: Record<string, ScoreDimension>
  improvement: number | null
  lastAnalyzedAt: Date
  analysisId: string
}

const DIMENSIONS = {
  repositoryQuality: { name: 'Repository Quality', weight: 0.25 },
  documentation: { name: 'Documentation', weight: 0.15 },
  contributionActivity: { name: 'Contribution Activity', weight: 0.15 },
  codeQuality: { name: 'Code Quality', weight: 0.15 },
  projectImpact: { name: 'Project Impact', weight: 0.1 },
  engineeringPractices: { name: 'Engineering Practices', weight: 0.08 },
  techDiversity: { name: 'Tech Diversity', weight: 0.05 },
  collaboration: { name: 'Collaboration', weight: 0.04 },
  profilePresentation: { name: 'Profile Presentation', weight: 0.03 },
}

export function scoreRepositoryQuality(repositories: Repository[]): ScoreDimension {
  const maxScore = 100
  let score = 0
  let details = ''

  if (repositories.length === 0) {
    return {
      name: DIMENSIONS.repositoryQuality.name,
      weight: DIMENSIONS.repositoryQuality.weight,
      score: 0,
      maxScore,
      details: 'No public repositories found',
    }
  }

  // Score based on number of repositories
  const repoCount = Math.min(repositories.length / 20 * 100, 40)
  score += repoCount

  // Score based on average stars
  const avgStars = repositories.reduce((sum, repo) => sum + repo.stars, 0) / repositories.length
  const starsScore = Math.min(avgStars / 10 * 100, 30)
  score += starsScore

  // Score based on repositories with descriptions
  const withDescriptions = repositories.filter((r) => r.description).length
  const descriptionScore = (withDescriptions / repositories.length) * 30
  score += descriptionScore

  details = `${repositories.length} repos, avg ${avgStars.toFixed(1)} stars, ${withDescriptions} with descriptions`

  return {
    name: DIMENSIONS.repositoryQuality.name,
    weight: DIMENSIONS.repositoryQuality.weight,
    score: Math.min(score, maxScore),
    maxScore,
    details,
  }
}

export function scoreDocumentation(repositories: Repository[]): ScoreDimension {
  const maxScore = 100
  let score = 0

  if (repositories.length === 0) {
    return {
      name: DIMENSIONS.documentation.name,
      weight: DIMENSIONS.documentation.weight,
      score: 0,
      maxScore,
      details: 'No repositories to analyze',
    }
  }

  // Score based on descriptions
  const withDescriptions = repositories.filter((r) => r.description && r.description.length > 50).length
  const descriptionScore = (withDescriptions / repositories.length) * 50
  score += descriptionScore

  // Score based on README presence (approximated by description length)
  const avgDescLength = repositories.reduce((sum, repo) => sum + (repo.description?.length || 0), 0) / repositories.length
  const readmeScore = Math.min(avgDescLength / 200 * 50, 50)
  score += readmeScore

  const details = `${withDescriptions} repos with detailed descriptions`

  return {
    name: DIMENSIONS.documentation.name,
    weight: DIMENSIONS.documentation.weight,
    score: Math.min(score, maxScore),
    maxScore,
    details,
  }
}

export function scoreContributionActivity(
  followerCount: number,
  followingCount: number,
  accountAge: number
): ScoreDimension {
  const maxScore = 100
  let score = 0

  // Score based on followers
  const followerScore = Math.min(followerCount / 100 * 100, 40)
  score += followerScore

  // Score based on following
  const followingScore = Math.min(followingCount / 200 * 30, 30)
  score += followingScore

  // Score based on account age
  const ageScore = Math.min(accountAge / 10 * 30, 30)
  score += ageScore

  const details = `${followerCount} followers, ${followingCount} following, account age ${accountAge} years`

  return {
    name: DIMENSIONS.contributionActivity.name,
    weight: DIMENSIONS.contributionActivity.weight,
    score: Math.min(score, maxScore),
    maxScore,
    details,
  }
}

export function scoreCodeQuality(repositories: Repository[]): ScoreDimension {
  const maxScore = 100
  let score = 0

  if (repositories.length === 0) {
    return {
      name: DIMENSIONS.codeQuality.name,
      weight: DIMENSIONS.codeQuality.weight,
      score: 0,
      maxScore,
      details: 'No repositories to analyze',
    }
  }

  // Score based on primary languages
  const languagesSet = new Set(repositories.filter((r) => r.language).map((r) => r.language))
  const languageScore = Math.min(languagesSet.size / 5 * 40, 40)
  score += languageScore

  // Score based on recent updates
  const now = Date.now()
  const recentRepos = repositories.filter((r) => {
    const diffTime = Math.abs(now - new Date(r.updated_at).getTime())
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return diffDays < 90
  })
  const recencyScore = (recentRepos.length / repositories.length) * 60
  score += recencyScore

  const details = `${languagesSet.size} languages, ${recentRepos.length} recently updated`

  return {
    name: DIMENSIONS.codeQuality.name,
    weight: DIMENSIONS.codeQuality.weight,
    score: Math.min(score, maxScore),
    maxScore,
    details,
  }
}

export function scoreProjectImpact(repositories: Repository[]): ScoreDimension {
  const maxScore = 100
  let score = 0

  if (repositories.length === 0) {
    return {
      name: DIMENSIONS.projectImpact.name,
      weight: DIMENSIONS.projectImpact.weight,
      score: 0,
      maxScore,
      details: 'No repositories to analyze',
    }
  }

  const totalStars = repositories.reduce((sum, repo) => sum + repo.stars, 0)
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks, 0)

  const starsScore = Math.min(totalStars / 100 * 100, 100)
  const forksScore = Math.min(totalForks / 50 * 100, 100)

  score = (starsScore + forksScore) / 2

  const details = `${totalStars} total stars, ${totalForks} total forks`

  return {
    name: DIMENSIONS.projectImpact.name,
    weight: DIMENSIONS.projectImpact.weight,
    score: Math.min(score, maxScore),
    maxScore,
    details,
  }
}

export function scoreEngineeringPractices(repositories: Repository[]): ScoreDimension {
  const maxScore = 100
  let score = 0

  if (repositories.length === 0) {
    return {
      name: DIMENSIONS.engineeringPractices.name,
      weight: DIMENSIONS.engineeringPractices.weight,
      score: 0,
      maxScore,
      details: 'No repositories to analyze',
    }
  }

  // Score based on topics (indicating project organization)
  const reposWithTopics = repositories.filter((r) => r.topics.length > 0).length
  const topicsScore = (reposWithTopics / repositories.length) * 50
  score += topicsScore

  // Score based on multiple languages (best practice)
  const languagesSet = new Set(repositories.filter((r) => r.language).map((r) => r.language))
  const multiLanguageScore = (languagesSet.size > 2 ? 50 : (languagesSet.size / 2) * 50)
  score += multiLanguageScore

  const details = `${reposWithTopics} repos with topics, ${languagesSet.size} languages used`

  return {
    name: DIMENSIONS.engineeringPractices.name,
    weight: DIMENSIONS.engineeringPractices.weight,
    score: Math.min(score, maxScore),
    maxScore,
    details,
  }
}

export function scoreTechDiversity(repositories: Repository[]): ScoreDimension {
  const maxScore = 100

  if (repositories.length === 0) {
    return {
      name: DIMENSIONS.techDiversity.name,
      weight: DIMENSIONS.techDiversity.weight,
      score: 0,
      maxScore,
      details: 'No repositories to analyze',
    }
  }

  const languagesSet = new Set(repositories.filter((r) => r.language).map((r) => r.language))
  const allTopics = new Set<string>()
  repositories.forEach((r) => r.topics.forEach((t) => allTopics.add(t)))

  const languageScore = Math.min(languagesSet.size * 15, 50)
  const topicScore = Math.min(allTopics.size * 2, 50)
  const score = languageScore + topicScore

  const details = `${languagesSet.size} languages, ${allTopics.size} different topics`

  return {
    name: DIMENSIONS.techDiversity.name,
    weight: DIMENSIONS.techDiversity.weight,
    score: Math.min(score, maxScore),
    maxScore,
    details,
  }
}

export function scoreCollaboration(followingCount: number, repositories: Repository[]): ScoreDimension {
  const maxScore = 100
  let score = 0

  // Score based on following (indicates engagement)
  const followingScore = Math.min(followingCount / 100 * 50, 50)
  score += followingScore

  // Score based on forked repositories
  const forkedRepos = repositories.filter((r) => r.forks > 0).length
  const forkScore = (forkedRepos / repositories.length) * 50
  score += forkScore

  const details = `Following ${followingCount}, ${forkedRepos} repos with forks`

  return {
    name: DIMENSIONS.collaboration.name,
    weight: DIMENSIONS.collaboration.weight,
    score: Math.min(score, maxScore),
    maxScore,
    details,
  }
}

export function scoreProfilePresentation(name: string | null, bio: string | null): ScoreDimension {
  const maxScore = 100
  let score = 0

  if (name) {
    score += 50
  }

  if (bio && bio.length > 20) {
    score += 50
  }

  const details = `${name ? 'Has' : 'Missing'} name, ${bio ? 'Has' : 'Missing'} bio`

  return {
    name: DIMENSIONS.profilePresentation.name,
    weight: DIMENSIONS.profilePresentation.weight,
    score,
    maxScore,
    details,
  }
}

export async function calculateProfileScore(
  userId: string,
  repositories: Repository[],
  profile: {
    name: string | null
    bio: string | null
    followers: number
    following: number
    created_at: string
  }
): Promise<ProfileScore> {
  const dimensions: Record<string, ScoreDimension> = {}

  // Calculate account age in years
  const accountAge = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)

  dimensions.repositoryQuality = scoreRepositoryQuality(repositories)
  dimensions.documentation = scoreDocumentation(repositories)
  dimensions.contributionActivity = scoreContributionActivity(profile.followers, profile.following, accountAge)
  dimensions.codeQuality = scoreCodeQuality(repositories)
  dimensions.projectImpact = scoreProjectImpact(repositories)
  dimensions.engineeringPractices = scoreEngineeringPractices(repositories)
  dimensions.techDiversity = scoreTechDiversity(repositories)
  dimensions.collaboration = scoreCollaboration(profile.following, repositories)
  dimensions.profilePresentation = scoreProfilePresentation(profile.name, profile.bio)

  // Calculate weighted overall score
  let overall = 0
  Object.entries(dimensions).forEach(([key, dimension]) => {
    const dimensionKey = key as keyof typeof DIMENSIONS
    if (dimensionKey in DIMENSIONS) {
      overall += dimension.score * DIMENSIONS[dimensionKey].weight
    }
  })

  // Get previous score for improvement calculation
  const previousScores = await sql`
    SELECT overall_score FROM score_history 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC 
    LIMIT 1
  `

  let improvement = null
  if (previousScores.length > 0) {
    improvement = overall - previousScores[0].overall_score
  }

  const analysisId = `analysis_${userId}_${Date.now()}`

  // Save to database
  await sql`
    INSERT INTO score_history (user_id, overall_score, dimensions_data, improvement, created_at)
    VALUES (${userId}, ${overall}, ${JSON.stringify(dimensions)}, ${improvement}, NOW())
  `

  return {
    overall: Math.round(overall),
    dimensions,
    improvement,
    lastAnalyzedAt: new Date(),
    analysisId,
  }
}
