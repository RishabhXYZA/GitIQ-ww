import { AIRecommendation } from '@/lib/gemini'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'

interface RecommendationsProps {
  recommendations: AIRecommendation[]
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-green-50 border-green-200'
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">AI-Powered Recommendations</h2>
        <p className="text-muted-foreground">Personalized insights to improve your GitHub profile</p>
      </div>

      {recommendations.map((rec, idx) => (
        <Card key={idx} className={`rounded-xl border-2 ${getPriorityColor(rec.priority)}`}>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 pt-1">{getPriorityIcon(rec.priority)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{rec.category}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      rec.priority === 'high'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : rec.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          : 'bg-green-100 text-green-800 border-green-300'
                    }
                  >
                    {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                  </Badge>
                </div>

                <p className="text-foreground mb-4">{rec.description}</p>

                {rec.actionItems.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-foreground mb-2">Action Items:</h4>
                    <ul className="space-y-1">
                      {rec.actionItems.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-sm text-foreground flex gap-2">
                          <span className="text-primary font-semibold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-3 border-t border-current border-opacity-10">
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">Estimated Impact: </span>
                    <span className="text-muted-foreground">{rec.estimatedImpact}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
