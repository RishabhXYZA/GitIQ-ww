import { Repository } from '@/lib/github'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, GitFork, Code } from 'lucide-react'
import Link from 'next/link'

interface RepositoriesListProps {
  repositories: Repository[]
  maxItems?: number
}

export function RepositoriesList({ repositories, maxItems = 10 }: RepositoriesListProps) {
  const displayedRepos = repositories.slice(0, maxItems)

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Top Repositories</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          {displayedRepos.length} of {repositories.length} repositories shown
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedRepos.map((repo, idx) => (
            <Link key={idx} href={repo.url} target="_blank" rel="noopener noreferrer">
              <div className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{repo.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{repo.description || 'No description'}</p>
                  </div>
                  {repo.language && (
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">
                      <Code className="w-3 h-3 mr-1" />
                      {repo.language}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{repo.stars}</span>
                  </div>
                  {repo.forks > 0 && (
                    <div className="flex items-center gap-1">
                      <GitFork className="w-4 h-4" />
                      <span>{repo.forks}</span>
                    </div>
                  )}
                  {repo.topics.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {repo.topics.slice(0, 2).map((topic, topicIdx) => (
                        <Badge key={topicIdx} variant="outline" className="text-xs py-0">
                          {topic}
                        </Badge>
                      ))}
                      {repo.topics.length > 2 && <span className="text-xs text-muted-foreground">+{repo.topics.length - 2}</span>}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
