import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export interface Repository {
  id: number
  name: string
  description: string | null
  url: string
  stars: number
  language: string | null
  updated_at: string
  topics: string[]
  forks: number
}

export interface GitHubProfile {
  username: string
  name: string | null
  avatar_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
}

export async function getGitHubProfile(accessToken: string): Promise<GitHubProfile | null> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) return null

    const data = await response.json()
    return {
      username: data.login,
      name: data.name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following,
      created_at: data.created_at,
    }
  } catch (error) {
    console.error('Error fetching GitHub profile:', error)
    return null
  }
}

export async function getPinnedRepositories(username: string, accessToken: string): Promise<Repository[]> {
  try {
    const query = `
      query {
        user(login: "${username}") {
          pinnedItems(first: 6, types: REPOSITORY) {
            edges {
              node {
                ... on Repository {
                  id
                  name
                  description
                  url
                  stargazerCount
                  primaryLanguage {
                    name
                  }
                  updatedAt
                  repositoryTopics(first: 5) {
                    nodes {
                      topic {
                        name
                      }
                    }
                  }
                  forks {
                    totalCount
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    const data = await response.json()

    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      return []
    }

    const pinnedItems = data.data?.user?.pinnedItems?.edges || []
    return pinnedItems.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      description: edge.node.description,
      url: edge.node.url,
      stars: edge.node.stargazerCount,
      language: edge.node.primaryLanguage?.name || null,
      updated_at: edge.node.updatedAt,
      topics: edge.node.repositoryTopics?.nodes?.map((t: any) => t.topic.name) || [],
      forks: edge.node.forks?.totalCount || 0,
    }))
  } catch (error) {
    console.error('Error fetching pinned repositories:', error)
    return []
  }
}

export async function getTopStarredRepositories(username: string, accessToken: string): Promise<Repository[]> {
  try {
    const query = `
      query {
        user(login: "${username}") {
          repositories(first: 7, orderBy: {field: STARGAZERS, direction: DESC}, privacy: PUBLIC) {
            edges {
              node {
                id
                name
                description
                url
                stargazerCount
                primaryLanguage {
                  name
                }
                updatedAt
                repositoryTopics(first: 5) {
                  nodes {
                    topic {
                      name
                    }
                  }
                }
                forks {
                  totalCount
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    const data = await response.json()

    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      return []
    }

    const repos = data.data?.user?.repositories?.edges || []
    return repos.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      description: edge.node.description,
      url: edge.node.url,
      stars: edge.node.stargazerCount,
      language: edge.node.primaryLanguage?.name || null,
      updated_at: edge.node.updatedAt,
      topics: edge.node.repositoryTopics?.nodes?.map((t: any) => t.topic.name) || [],
      forks: edge.node.forks?.totalCount || 0,
    }))
  } catch (error) {
    console.error('Error fetching top repositories:', error)
    return []
  }
}

export async function getRecentRepositories(username: string, accessToken: string): Promise<Repository[]> {
  try {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const query = `
      query {
        user(login: "${username}") {
          repositories(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}, privacy: PUBLIC) {
            edges {
              node {
                id
                name
                description
                url
                stargazerCount
                primaryLanguage {
                  name
                }
                updatedAt
                repositoryTopics(first: 5) {
                  nodes {
                    topic {
                      name
                    }
                  }
                }
                forks {
                  totalCount
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    const data = await response.json()

    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      return []
    }

    const repos = data.data?.user?.repositories?.edges || []
    return repos
      .filter((edge: any) => new Date(edge.node.updatedAt) > oneYearAgo)
      .map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        description: edge.node.description,
        url: edge.node.url,
        stars: edge.node.stargazerCount,
        language: edge.node.primaryLanguage?.name || null,
        updated_at: edge.node.updatedAt,
        topics: edge.node.repositoryTopics?.nodes?.map((t: any) => t.topic.name) || [],
        forks: edge.node.forks?.totalCount || 0,
      }))
  } catch (error) {
    console.error('Error fetching recent repositories:', error)
    return []
  }
}

export async function saveRepositories(userId: string, repositories: Repository[]) {
  try {
    for (const repo of repositories) {
      await pool.query(
        `INSERT INTO repositories (user_id, repo_name, description, url, stars, language, updated_at, topics)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (user_id, repo_name)
         DO UPDATE SET
           description = $3,
           stars = $5,
           language = $6,
           updated_at = $7,
           topics = $8`,
        [userId, repo.name, repo.description, repo.url, repo.stars, repo.language, repo.updated_at, JSON.stringify(repo.topics)]
      )
    }
    return true
  } catch (error) {
    console.error('Error saving repositories:', error)
    return false
  }
}
