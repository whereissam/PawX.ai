import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Sparkles, Loader2, MessageSquareText, PenLine } from "lucide-react"

interface StyleAnalyzerProps {
  stylePrompt: string
  onStylePromptChange: (value: string) => void
  onAnalyzeHandle?: (handle: string) => void
  isAnalyzing?: boolean
  analyzedStyle?: {
    tone: string
    topics: string[]
    samplePhrases: string[]
  } | null
}

export function StyleAnalyzer({
  stylePrompt,
  onStylePromptChange,
  onAnalyzeHandle,
  isAnalyzing = false,
  analyzedStyle = null,
}: StyleAnalyzerProps) {
  const [handle, setHandle] = useState("")
  const [activeTab, setActiveTab] = useState<string>("describe")

  const handleAnalyze = () => {
    if (!handle.trim() || !onAnalyzeHandle) return
    onAnalyzeHandle(handle.startsWith("@") ? handle : `@${handle}`)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-1">Your Reply Style</h3>
        <p className="text-xs text-muted-foreground">
          Define how the AI should reply on your behalf
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="describe" className="flex-1 gap-1.5">
            <PenLine className="h-3.5 w-3.5" />
            Describe
          </TabsTrigger>
          <TabsTrigger value="learn" className="flex-1 gap-1.5">
            <MessageSquareText className="h-3.5 w-3.5" />
            Learn from Tweets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="describe">
          <div className="space-y-3">
            <Textarea
              placeholder="Describe your reply style in natural language...&#10;&#10;e.g. &quot;Reply in a casual, witty crypto-native tone. Use slang like 'ser', 'gm', 'wagmi'. Be supportive but add alpha insights. Keep replies under 280 chars.&quot;"
              value={stylePrompt}
              onChange={(e) => onStylePromptChange(e.target.value)}
              rows={5}
              className="resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Be specific about tone, vocabulary, emoji usage, and content focus
            </p>
          </div>
        </TabsContent>

        <TabsContent value="learn">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="@yourhandle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="text-sm"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !handle.trim()}
                size="sm"
                className="shrink-0"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span className="ml-1">Analyze</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a Twitter handle to analyze their tweet style and apply it to your replies
            </p>

            {analyzedStyle && (
              <div className="p-3 bg-surface-2/60 rounded-lg space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-xs">Style Learned</span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">Tone</span>
                  <p className="text-sm font-medium">{analyzedStyle.tone}</p>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">Topics</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analyzedStyle.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs py-0.5 px-2">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">Sample Phrases</span>
                  <div className="space-y-0.5 mt-1">
                    {analyzedStyle.samplePhrases.slice(0, 3).map((phrase, i) => (
                      <p key={i} className="text-xs italic text-muted-foreground">
                        &ldquo;{phrase}&rdquo;
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Textarea
              placeholder="Or paste sample tweets here to teach the AI your style...&#10;&#10;Paste multiple tweets, one per line."
              value={stylePrompt}
              onChange={(e) => onStylePromptChange(e.target.value)}
              rows={4}
              className="resize-none text-sm"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
