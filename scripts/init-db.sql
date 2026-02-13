-- GitIQ Database Schema

-- Users table (GitHub users)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  github_id INT UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(255),
  company VARCHAR(255),
  blog VARCHAR(255),
  public_repos INT DEFAULT 0,
  public_gists INT DEFAULT 0,
  followers INT DEFAULT 0,
  following INT DEFAULT 0,
  created_at_github TIMESTAMP,
  updated_at_github TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GitIQ Profiles (User analysis profiles)
CREATE TABLE IF NOT EXISTS gitiq_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  overall_score DECIMAL(5, 2) DEFAULT 0,
  repository_quality_score DECIMAL(5, 2) DEFAULT 0,
  documentation_score DECIMAL(5, 2) DEFAULT 0,
  contribution_activity_score DECIMAL(5, 2) DEFAULT 0,
  code_quality_score DECIMAL(5, 2) DEFAULT 0,
  project_impact_score DECIMAL(5, 2) DEFAULT 0,
  engineering_practices_score DECIMAL(5, 2) DEFAULT 0,
  tech_diversity_score DECIMAL(5, 2) DEFAULT 0,
  collaboration_score DECIMAL(5, 2) DEFAULT 0,
  profile_presentation_score DECIMAL(5, 2) DEFAULT 0,
  improvement_percentage DECIMAL(5, 2) DEFAULT 0,
  last_analyzed TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Score History (Track improvements over time)
CREATE TABLE IF NOT EXISTS score_history (
  id SERIAL PRIMARY KEY,
  profile_id INT NOT NULL REFERENCES gitiq_profiles(id) ON DELETE CASCADE,
  overall_score DECIMAL(5, 2),
  repository_quality_score DECIMAL(5, 2),
  documentation_score DECIMAL(5, 2),
  contribution_activity_score DECIMAL(5, 2),
  code_quality_score DECIMAL(5, 2),
  project_impact_score DECIMAL(5, 2),
  engineering_practices_score DECIMAL(5, 2),
  tech_diversity_score DECIMAL(5, 2),
  collaboration_score DECIMAL(5, 2),
  profile_presentation_score DECIMAL(5, 2),
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis Results (Detailed analysis from Gemini)
CREATE TABLE IF NOT EXISTS analysis_results (
  id SERIAL PRIMARY KEY,
  profile_id INT NOT NULL REFERENCES gitiq_profiles(id) ON DELETE CASCADE,
  pinned_repos_analysis TEXT,
  top_starred_repos_analysis TEXT,
  recent_activity_analysis TEXT,
  code_quality_recommendations TEXT,
  documentation_improvements TEXT,
  collaboration_insights TEXT,
  tech_stack_analysis TEXT,
  overall_recommendations TEXT,
  strengths JSONB,
  weaknesses JSONB,
  opportunities JSONB,
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Repositories (Cache GitHub repo data)
CREATE TABLE IF NOT EXISTS repositories (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_repo_id INT UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(255),
  language VARCHAR(100),
  stars INT DEFAULT 0,
  forks INT DEFAULT 0,
  watchers INT DEFAULT 0,
  open_issues INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_in_top_7_starred BOOLEAN DEFAULT FALSE,
  updated_recently BOOLEAN DEFAULT FALSE,
  pushed_at TIMESTAMP,
  created_at_github TIMESTAMP,
  updated_at_github TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_profiles_user_id ON gitiq_profiles(user_id);
CREATE INDEX idx_score_history_profile_id ON score_history(profile_id);
CREATE INDEX idx_analysis_results_profile_id ON analysis_results(profile_id);
CREATE INDEX idx_repositories_user_id ON repositories(user_id);
CREATE INDEX idx_score_history_analyzed_at ON score_history(analyzed_at);
