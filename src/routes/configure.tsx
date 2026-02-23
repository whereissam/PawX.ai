import { useState, useCallback } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  PenLine,
  MessageSquareText,
  Sparkles,
  Loader2,
  Play,
  ArrowLeft,
  Zap,
  CheckCircle2,
  LinkIcon,
} from "lucide-react"
import { useKolSelection } from "@/hooks/use-kol-selection"
import { useInteractionConfig } from "@/hooks/use-interaction-config"
import { useAuth } from "@/hooks/use-auth"
import { getTweetsInfo } from "@/lib/api"
import { analyzeTwitterStyle, generateSampleReplies } from "@/lib/gemini"

const PRESET_STYLES = [
  {
    id: "professional",
    label: "Professional",
    description: "Clear, insightful, and data-driven responses",
  },
  {
    id: "casual",
    label: "Casual / Crypto-native",
    description: "Use slang like 'ser', 'gm', 'wagmi'. Fun and approachable",
  },
  {
    id: "analytical",
    label: "Analytical",
    description: "Technical analysis, metrics-focused, chart references",
  },
  {
    id: "supportive",
    label: "Supportive",
    description: "Encouraging, community-focused, positive engagement",
  },
]

function ConfigurePage() {
  const navigate = useNavigate()
  const { selectedKols } = useKolSelection()
  const { config, updateConfig } = useInteractionConfig()
  const { user, isTwitterConnected, signInWithTwitter } = useAuth()

  const [twitterHandle, setTwitterHandle] = useState(config.twitterHandle ?? "")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSamples, setShowSamples] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sampleReplies, setSampleReplies] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleAnalyzeHandle = useCallback(async () => {
    if (!twitterHandle.trim()) return
    setIsAnalyzing(true)
    setError(null)
    const handle = twitterHandle.startsWith("@") ? twitterHandle : `@${twitterHandle}`
    const screenName = handle.replace("@", "")
    try {
      const tweetsData = await getTweetsInfo([screenName])
      const tweetTexts = tweetsData.map((t) => t.tweet.text || t.tweet.fullText).filter(Boolean)
      if (tweetTexts.length === 0) {
        throw new Error("No tweets found for this handle")
      }
      const styleAnalysis = await analyzeTwitterStyle(tweetTexts)
      updateConfig({
        styleMode: "learn",
        twitterHandle: handle,
        stylePrompt: styleAnalysis,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze tweets")
    } finally {
      setIsAnalyzing(false)
    }
  }, [twitterHandle, updateConfig])

  const handlePresetSelect = useCallback(
    (presetId: string) => {
      const preset = PRESET_STYLES.find((p) => p.id === presetId)
      if (!preset) return
      updateConfig({
        styleMode: "preset",
        presetStyle: presetId,
        stylePrompt: `Reply in a ${preset.label.toLowerCase()} style. ${preset.description}.`,
      })
    },
    [updateConfig]
  )

  const handleGenerateSamples = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const replies = await generateSampleReplies(config.stylePrompt)
      setSampleReplies(replies)
      setShowSamples(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate samples")
    } finally {
      setIsGenerating(false)
    }
  }, [config.stylePrompt])

  const handleStart = () => {
    navigate({ to: "/interact" })
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Configure Interaction</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Set your reply style and rules for{" "}
              <span className="font-medium text-foreground">
                {selectedKols.length} selected KOL{selectedKols.length !== 1 ? "s" : ""}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Section 0: Twitter Account */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-foreground/5">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-base">Twitter Account</h2>
                    {isTwitterConnected ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Connected{user?.name ? ` as ${user.name}` : ""}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Connect to post tweets on your behalf
                      </p>
                    )}
                  </div>
                </div>
                {!isTwitterConnected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signInWithTwitter}
                    className="gap-1.5"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 1: Reply Style */}
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-base mb-1">Reply Style</h2>
                <p className="text-xs text-muted-foreground">
                  Define how the AI should reply on your behalf
                </p>
              </div>

              <Tabs
                value={config.styleMode}
                onValueChange={(v) =>
                  updateConfig({ styleMode: v as "describe" | "learn" | "preset" })
                }
              >
                <TabsList className="w-full">
                  <TabsTrigger value="describe" className="flex-1 gap-1.5">
                    <PenLine className="h-3.5 w-3.5" />
                    Describe
                  </TabsTrigger>
                  <TabsTrigger value="learn" className="flex-1 gap-1.5">
                    <MessageSquareText className="h-3.5 w-3.5" />
                    Learn from Twitter
                  </TabsTrigger>
                  <TabsTrigger value="preset" className="flex-1 gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Presets
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="describe">
                  <Textarea
                    placeholder="Describe your reply style in natural language...&#10;&#10;e.g. &quot;Reply in a casual, witty crypto-native tone. Use slang like 'ser', 'gm', 'wagmi'. Be supportive but add alpha insights.&quot;"
                    value={config.stylePrompt}
                    onChange={(e) => updateConfig({ stylePrompt: e.target.value })}
                    rows={5}
                    className="resize-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Be specific about tone, vocabulary, emoji usage, and content focus
                  </p>
                </TabsContent>

                <TabsContent value="learn">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="@yourhandle or Twitter link"
                        value={twitterHandle}
                        onChange={(e) => setTwitterHandle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAnalyzeHandle()}
                        className="text-sm"
                      />
                      <Button
                        onClick={handleAnalyzeHandle}
                        disabled={isAnalyzing || !twitterHandle.trim()}
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
                      Enter a Twitter handle to analyze their tweet style and apply it
                    </p>
                    {config.styleMode === "learn" && config.stylePrompt && (
                      <div className="p-3 bg-surface-2/60 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span className="font-medium text-xs">Style Learned</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {config.stylePrompt}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="preset">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_STYLES.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset.id)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          config.presetStyle === preset.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className="font-medium text-sm">{preset.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {preset.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Section 2: Interaction Rules */}
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-base mb-1">Interaction Rules</h2>
                <p className="text-xs text-muted-foreground">
                  When should the AI reply to tweets?
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-surface-2/30">
                  <input
                    type="radio"
                    name="replyCondition"
                    value="all"
                    checked={config.replyCondition === "all"}
                    onChange={() => updateConfig({ replyCondition: "all", conditionPrompt: "" })}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">Reply to every tweet</p>
                    <p className="text-xs text-muted-foreground">
                      Auto-reply to all tweets from selected KOLs
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-surface-2/30">
                  <input
                    type="radio"
                    name="replyCondition"
                    value="conditional"
                    checked={config.replyCondition === "conditional"}
                    onChange={() => updateConfig({ replyCondition: "conditional" })}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Only reply when...</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Set conditions for when to engage
                    </p>
                    {config.replyCondition === "conditional" && (
                      <Textarea
                        placeholder="e.g. Only reply to tweets about DeFi, technical analysis, or market sentiment"
                        value={config.conditionPrompt}
                        onChange={(e) =>
                          updateConfig({ conditionPrompt: e.target.value })
                        }
                        rows={3}
                        className="resize-none text-sm"
                      />
                    )}
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Sample Reply Preview */}
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-base mb-1">Sample Replies</h2>
                  <p className="text-xs text-muted-foreground">
                    Preview how your AI will respond
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSamples}
                  disabled={isGenerating || !config.stylePrompt}
                  className="gap-1.5"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                  Generate Samples
                </Button>
              </div>

              {!config.stylePrompt && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Set a reply style above to generate sample replies
                </p>
              )}

              {error && (
                <p className="text-xs text-destructive text-center py-2">{error}</p>
              )}

              {showSamples && (
                <div className="space-y-2">
                  {sampleReplies.map((reply, i) => (
                    <div
                      key={i}
                      className="p-3 bg-surface-2/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          Sample {i + 1}
                        </Badge>
                      </div>
                      <p className="text-sm">{reply}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Start */}
          <div className="flex items-center justify-between p-4 bg-surface shadow-raised-sm rounded-lg">
            <div>
              <p className="text-sm font-medium">Ready to start monitoring?</p>
              <p className="text-xs text-muted-foreground">
                {selectedKols.length} KOL{selectedKols.length !== 1 ? "s" : ""} selected
                {config.stylePrompt ? " · Style configured" : ""}
              </p>
            </div>
            <Button
              onClick={handleStart}
              disabled={selectedKols.length === 0}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Start Monitoring
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/configure")({
  component: ConfigurePage,
})
