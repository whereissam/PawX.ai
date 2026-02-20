import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { categorySummaries } from "@/data/tweets"

interface CategorySummaryProps {
  activeTags: string[]
}

export function CategorySummary({ activeTags }: CategorySummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const relevantSummaries = activeTags.length > 0
    ? categorySummaries.filter((s) => activeTags.includes(s.category))
    : categorySummaries.slice(0, 3)

  if (relevantSummaries.length === 0) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-3 sm:p-4">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-xs sm:text-sm">AI Summary of Recent Tweets</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>

        {isExpanded && (
          <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
            {relevantSummaries.map((summary) => (
              <div key={summary.category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{summary.category}</h4>
                  <span className="text-xs text-muted-foreground">
                    {summary.tweetCount} tweets analyzed
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{summary.summary}</p>
                <div className="flex flex-wrap gap-1">
                  {summary.topTopics.map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
