import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function initializeDatabase() {
  try {
    console.log('[v0] Starting database initialization...');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        github_id VARCHAR(255) UNIQUE NOT NULL,
        github_username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        avatar_url TEXT,
        bio TEXT,
        location VARCHAR(255),
        company VARCHAR(255),
        blog VARCHAR(255),
        twitter_username VARCHAR(255),
        public_repos INTEGER DEFAULT 0,
        followers INTEGER DEFAULT 0,
        following INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('[v0] Created users table');

    // Create gitiq_profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS gitiq_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_score DECIMAL(5, 2) DEFAULT 0,
        repository_quality_score DECIMAL(5, 2) DEFAULT 0,
        documentation_score DECIMAL(5, 2) DEFAULT 0,
        contribution_activity_score DECIMAL(5, 2) DEFAULT 0,
        code_quality_score DECIMAL(5, 2) DEFAULT 0,
        project_impact_score DECIMAL(5, 2) DEFAULT 0,
        engineering_practices_score DECIMAL(5, 2) DEFAULT 0,
        tech_diversity_score DECIMAL(5, 2) DEFAULT 0,
        collaboration_score DECIMAL(5, 2) DEFAULT 0,
        profile_presentation_score DECIMAL(5, 2) DEFAULT 0,
        last_analyzed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `;
    console.log('[v0] Created gitiq_profiles table');

    // Create score_history table
    await sql`
      CREATE TABLE IF NOT EXISTS score_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_score DECIMAL(5, 2) NOT NULL,
        repository_quality_score DECIMAL(5, 2),
        documentation_score DECIMAL(5, 2),
        contribution_activity_score DECIMAL(5, 2),
        code_quality_score DECIMAL(5, 2),
        project_impact_score DECIMAL(5, 2),
        engineering_practices_score DECIMAL(5, 2),
        tech_diversity_score DECIMAL(5, 2),
        collaboration_score DECIMAL(5, 2),
        profile_presentation_score DECIMAL(5, 2),
        improvement_percentage DECIMAL(5, 2) DEFAULT 0,
        analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('[v0] Created score_history table');

    // Create analysis_results table
    await sql`
      CREATE TABLE IF NOT EXISTS analysis_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pinned_repos_count INTEGER DEFAULT 0,
        top_starred_repos_count INTEGER DEFAULT 0,
        repos_updated_last_year INTEGER DEFAULT 0,
        key_findings TEXT,
        recommendations TEXT,
        strengths TEXT,
        areas_for_improvement TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('[v0] Created analysis_results table');

    // Create repositories table
    await sql`
      CREATE TABLE IF NOT EXISTS repositories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        repo_id VARCHAR(255) NOT NULL,
        repo_name VARCHAR(255) NOT NULL,
        repo_url TEXT NOT NULL,
        description TEXT,
        language VARCHAR(255),
        stars INTEGER DEFAULT 0,
        forks INTEGER DEFAULT 0,
        watchers INTEGER DEFAULT 0,
        open_issues INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_top_starred BOOLEAN DEFAULT FALSE,
        updated_in_last_year BOOLEAN DEFAULT FALSE,
        last_pushed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, repo_id)
      )
    `;
    console.log('[v0] Created repositories table');

    // Create ai_recommendations table
    await sql`
      CREATE TABLE IF NOT EXISTS ai_recommendations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        analysis_id INTEGER REFERENCES analysis_results(id) ON DELETE CASCADE,
        recommendation_type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        implemented BOOLEAN DEFAULT FALSE,
        implementation_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('[v0] Created ai_recommendations table');

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_users_github_username ON users(github_username)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gitiq_profiles_user_id ON gitiq_profiles(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_score_history_user_id ON score_history(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON analysis_results(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON repositories(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id)`;
    console.log('[v0] Created database indexes');

    console.log('[v0] Database initialization completed successfully!');
  } catch (error) {
    console.error('[v0] Database initialization error:', error);
    throw error;
  }
}

initializeDatabase().catch((err) => {
  console.error('[v0] Fatal error:', err);
  process.exit(1);
});
