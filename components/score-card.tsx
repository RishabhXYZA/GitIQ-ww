import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ScoreCardProps {
  score: number
  improvement?: number | null
  title: string
  subtitle?: string
}

export function ScoreCard({ score, improvement, title, subtitle }: ScoreCardProps) {
  const scorePercentage = Math.round(score)
  const hasImprovement = improvement !== null && improvement !== undefined

  return (
    <Card className="rounded-xl overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-bold text-foreground">{scorePercentage}</div>
            <p className="text-xs text-muted-foreground mt-1">out of 100</p>
          </div>
          {hasImprovement && (
            <div className={`flex items-center gap-1 ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvement >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">{Math.abs(Math.round(improvement))}%</span>
            </div>
          )}
        </div>

        {/* Score Bar */}
        <div className="mt-4 w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
