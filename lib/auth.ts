import { neon } from '@neondatabase/serverless'
import { hash, compare } from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL!)

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

export interface GitHubUser {
  id: string
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
}

export async function getGitHubUser(accessToken: string): Promise<GitHubUser | null> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching GitHub user:', error)
    return null
  }
}

export async function saveOrUpdateUser(gitHubUser: GitHubUser, accessToken: string) {
  try {
    console.log('[v0] Saving user:', gitHubUser.login)
    const result = await sql`
      INSERT INTO users (github_id, github_username, avatar_url, bio)
      VALUES (${gitHubUser.id}, ${gitHubUser.login}, ${gitHubUser.avatar_url}, ${gitHubUser.bio})
      ON CONFLICT (github_id) 
      DO UPDATE SET 
        github_username = ${gitHubUser.login},
        avatar_url = ${gitHubUser.avatar_url},
        bio = ${gitHubUser.bio},
        updated_at = NOW()
      RETURNING id, github_id, github_username, avatar_url
    `

    console.log('[v0] User saved successfully:', result)
    return result[0] || null
  } catch (error) {
    console.error('[v0] Error saving user:', error)
    throw error // Re-throw to be caught by callback handler
  }
}

export async function getUserByGitHubId(githubId: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE github_id = ${githubId}
    `

    return result[0] || null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getUserById(userId: string) {
  try {
    const result = await sql`
      SELECT id, github_id, github_username, avatar_url, bio, created_at, updated_at FROM users WHERE id = ${userId}
    `

    return result[0] || null
  } catch (error) {
    console.error('[v0] Error getting user by ID:', error)
    return null
  }
}
