import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2 } from "lucide-react"
import { mockStyleProfiles } from "@/data/tweets"
import type { StyleProfile } from "@/types"

export function StyleAnalyzer() {
  const [handle, setHandle] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [profile, setProfile] = useState<StyleProfile | null>(null)

  const handleAnalyze = () => {
    if (!handle.trim()) return
    setIsAnalyzing(true)
    // Simulate API call
    setTimeout(() => {
      setProfile({
        ...mockStyleProfiles[0],
        handle: handle.startsWith("@") ? handle : `@${handle}`,
        analyzedAt: new Date().toISOString(),
      })
      setIsAnalyzing(false)
    }, 1500)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-sm mb-2">Your Reply Style</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Enter your Twitter handle to analyze your writing style for auto-replies
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="@yourhandle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
        />
        <Button onClick={handleAnalyze} disabled={isAnalyzing || !handle.trim()} size="sm">
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="ml-1">Analyze</span>
        </Button>
      </div>

      {profile && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Style Profile: {profile.handle}</span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground">Tone</span>
              <p className="text-sm font-medium">{profile.tone}</p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground">Topics</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.topics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-muted-foreground">Sample Phrases</span>
              <div className="space-y-1 mt-1">
                {profile.samplePhrases.map((phrase, i) => (
                  <p key={i} className="text-xs italic text-muted-foreground">
                    &ldquo;{phrase}&rdquo;
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
