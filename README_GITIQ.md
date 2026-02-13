# GitIQ - GitHub Profile Analyzer & Enhancer

GitIQ is a hackathon-winning GitHub profile analysis and enhancement tool powered by AI. It analyzes your GitHub portfolio, provides personalized recommendations, and tracks improvements over time.

## Features

✨ **AI-Powered Analysis** - Google Gemini Pro Vision integration for intelligent insights
🔐 **GitHub OAuth Authentication** - Secure access to public and private repositories
📊 **Comprehensive Scoring** - 9 dimensions of profile evaluation
📈 **Progress Tracking** - Historical score comparisons and improvement metrics
💡 **Smart Recommendations** - Actionable insights to improve your GitHub presence
🎨 **Modern Dashboard** - Beautiful, responsive interface with data visualizations

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── github/route.ts       # GitHub OAuth callback
│   │   │   └── logout/route.ts       # Logout handler
│   │   ├── analyze/route.ts          # Profile analysis API
│   │   └── dashboard/route.ts        # Dashboard data API
│   ├── auth/
│   │   └── error/page.tsx            # Auth error page
│   ├── dashboard/
│   │   └── page.tsx                  # Main dashboard
│   ├── page.tsx                      # Login page
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles & theme
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── score-card.tsx                # Score display component
│   ├── dimensions-radar.tsx          # Profile dimensions chart
│   ├── recommendations.tsx           # AI recommendations display
│   ├── repositories-list.tsx         # Repository listing
│   └── score-history-chart.tsx       # Score progression chart
├── lib/
│   ├── auth.ts                       # Authentication utilities
│   ├── github.ts                     # GitHub API integration
│   ├── scoring.ts                    # Profile scoring engine
│   └── gemini.ts                     # Google Gemini AI integration
├── scripts/
│   └── init-db.js                    # Database initialization
├── middleware.ts                     # Authentication middleware
├── package.json                      # Project dependencies
└── tailwind.config.ts                # Tailwind configuration
```

## Scoring Dimensions

GitIQ evaluates GitHub profiles across 9 weighted dimensions:

| Dimension | Weight | Evaluation |
|-----------|--------|-----------|
| Repository Quality | 25% | Public repos, stars, descriptions |
| Documentation | 15% | README files and detailed descriptions |
| Contribution Activity | 15% | Followers, following, account age |
| Code Quality | 15% | Languages, recent updates, diversity |
| Project Impact | 10% | Total stars and forks |
| Engineering Practices | 8% | Project organization, topics |
| Tech Diversity | 5% | Language variety and topics |
| Collaboration | 4% | Following count and forks |
| Profile Presentation | 3% | Name and bio completeness |

## Technology Stack

**Frontend:**
- Next.js 16 with React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Recharts for data visualization

**Backend:**
- Next.js API Routes
- Neon PostgreSQL (serverless)
- GitHub API v3 + GraphQL
- Google Generative AI (Gemini Pro Vision)

**Authentication:**
- GitHub OAuth 2.0
- Secure HTTP-only cookies
- Database-backed sessions

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=your_neon_postgres_connection_string

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_app_client_id
GITHUB_CLIENT_SECRET=your_github_app_client_secret

# Google Gemini
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Session
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000  # or your production URL
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- npm/pnpm/yarn
- Neon PostgreSQL account
- GitHub OAuth application
- Google Gemini API key

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/github`
4. Copy Client ID and Client Secret to `.env.local`

### 4. Setup Google Gemini API

1. Go to Google AI Studio (https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local`

### 5. Setup Neon Database

1. Create a Neon project
2. Copy connection string to `DATABASE_URL`
3. Initialize database: `pnpm run init-db`

### 6. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses these tables:

- **users** - User authentication and GitHub profile
- **gitiq_profiles** - Latest analysis results
- **score_history** - Historical scores for tracking
- **analysis_results** - Detailed analysis data
- **repositories** - Cached repository information
- **ai_recommendations** - Generated recommendations

## How It Works

1. **User logs in** with GitHub OAuth
2. **App fetches** pinned repos, top starred repos, and recent updates
3. **Calculates scores** using weighted dimensions algorithm
4. **Generates recommendations** using Google Gemini AI
5. **Displays dashboard** with visualizations and insights
6. **Tracks improvements** by comparing with previous scores

## AI Recommendations

GitIQ uses Google Gemini Pro Vision to generate personalized recommendations by analyzing:

- Repository quality and descriptions
- Documentation completeness
- Code language diversity
- Project organization
- Collaboration patterns
- Profile presentation

Recommendations are prioritized as high, medium, or low and include:
- Specific action items
- Estimated impact on profile score
- Category classification

## Performance Optimizations

- Parallel API requests for repository data
- Database connection pooling via Neon
- Efficient score caching
- Client-side data visualization
- Optimized middleware for authentication checks

## Security Considerations

- GitHub OAuth for secure authentication
- HTTP-only cookies for session management
- Secure password hashing (bcryptjs)
- Parameterized database queries
- Environment variable secrets management
- CSRF protection via middleware

## Future Enhancements

- [ ] Dark mode theme toggle
- [ ] Email notifications for score changes
- [ ] Batch analysis for multiple users
- [ ] Custom recommendation filters
- [ ] Export analysis as PDF
- [ ] Community benchmarking
- [ ] Integration with more AI providers

## License

MIT License - Feel free to use for hackathons and personal projects.

## Support

For issues or questions:
1. Check GitHub discussions
2. Review database logs
3. Verify API key configurations
4. Check GitHub OAuth app settings

---

Built with ❤️ for developers. Happy analyzing!
