'use client'

import { ScoreDimension } from '@/lib/scoring'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PolarAngleAxis, PolarGridAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'

interface DimensionsRadarProps {
  dimensions: Record<string, ScoreDimension>
}

export function DimensionsRadar({ dimensions }: DimensionsRadarProps) {
  const data = Object.values(dimensions).map((dim) => ({
    name: dim.name.substring(0, 12),
    value: dim.score,
  }))

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Profile Dimensions</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">Score breakdown across all evaluation areas</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGridAxis stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-1 gap-2">
          {Object.values(dimensions).map((dim, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{dim.name}</span>
              <span className="font-semibold text-foreground">{Math.round(dim.score)}/100</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
