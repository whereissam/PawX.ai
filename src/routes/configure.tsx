import { useState, useCallback } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  PenLine,
  MessageSquareText,
  Sparkles,
  Loader2,
  ArrowLeft,
  Zap,
  CheckCircle2,
  LinkIcon,
  Send,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart3,
  ExternalLink,
  Check,
  X,
  RefreshCw,
} from "lucide-react"
import { useKolSelection } from "@/hooks/use-kol-selection"
import { useInteractionConfig } from "@/hooks/use-interaction-config"
import { useAuth } from "@/hooks/use-auth"
import { getTweetsInfo } from "@/lib/api"
import { analyzeTwitterStyle, generateSampleReplies, generateReply } from "@/lib/gemini"
import { postTweet } from "@/lib/twitter-api"
import type { TweetResponse } from "@/types"

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

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "0"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  if (diffH < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}m ago`
  if (diffH < 24) return `${diffH}h ago`
  return date.toLocaleDateString()
}

interface TweetReplyState {
  isGenerating: boolean
  isSending: boolean
  generatedReply: string
  editedReply: string
  sent: boolean
  skipped: boolean
  skipReason?: string
  error?: string
}

function ConfigurePage() {
  const { selectedKols } = useKolSelection()
  const { config, updateConfig } = useInteractionConfig()
  const { user, isTwitterConnected, signInWithTwitter } = useAuth()

  const [twitterHandle, setTwitterHandle] = useState(config.twitterHandle ?? "")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSamples, setShowSamples] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sampleReplies, setSampleReplies] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Tweet reply state
  const [selectedKolIndex, setSelectedKolIndex] = useState<number | null>(null)
  const [kolTweets, setKolTweets] = useState<TweetResponse[]>([])
  const [isLoadingTweets, setIsLoadingTweets] = useState(false)
  const [tweetsError, setTweetsError] = useState<string | null>(null)
  const [replyStates, setReplyStates] = useState<Record<string, TweetReplyState>>({})
  const [expandedTweet, setExpandedTweet] = useState<string | null>(null)

  const selectedKol = selectedKolIndex !== null ? selectedKols[selectedKolIndex] : null

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

  const handleFetchTweets = useCallback(
    async (index: number) => {
      const kol = selectedKols[index]
      if (!kol) return

      setSelectedKolIndex(index)
      setKolTweets([])
      setReplyStates({})
      setExpandedTweet(null)
      setIsLoadingTweets(true)
      setTweetsError(null)

      try {
        const data = await getTweetsInfo([kol.screenName])
        const originalTweets = data.filter(
          (t) => !t.tweet.retweetedTweetId && !t.tweet.inReplyToTweetId
        )
        setKolTweets(originalTweets.slice(0, 10))
      } catch (err) {
        setTweetsError(err instanceof Error ? err.message : "Failed to fetch tweets")
      } finally {
        setIsLoadingTweets(false)
      }
    },
    [selectedKols]
  )

  const handleGenerateReply = useCallback(
    async (tweetId: string, tweetText: string, tweetAuthor: string) => {
      setReplyStates((prev) => ({
        ...prev,
        [tweetId]: {
          ...prev[tweetId],
          isGenerating: true,
          isSending: false,
          error: undefined,
          sent: false,
          skipped: false,
          generatedReply: "",
          editedReply: "",
        },
      }))

      try {
        const conditionPrompt =
          config.replyCondition === "conditional" ? config.conditionPrompt : undefined
        const result = await generateReply(config.stylePrompt, tweetText, tweetAuthor, conditionPrompt)

        setReplyStates((prev) => ({
          ...prev,
          [tweetId]: {
            ...prev[tweetId],
            isGenerating: false,
            generatedReply: result.reply,
            editedReply: result.reply,
            skipped: !result.shouldReply,
            skipReason: result.reason,
          },
        }))
        setExpandedTweet(tweetId)
      } catch (err) {
        setReplyStates((prev) => ({
          ...prev,
          [tweetId]: {
            ...prev[tweetId],
            isGenerating: false,
            error: err instanceof Error ? err.message : "Failed to generate reply",
          },
        }))
      }
    },
    [config]
  )

  const handleSendReply = useCallback(
    async (tweetId: string) => {
      const state = replyStates[tweetId]
      if (!state?.editedReply) return

      setReplyStates((prev) => ({
        ...prev,
        [tweetId]: { ...prev[tweetId], isSending: true, error: undefined },
      }))

      try {
        const result = await postTweet(state.editedReply, tweetId)
        if (!result.success) throw new Error(result.error || "Failed to post reply")
        setReplyStates((prev) => ({
          ...prev,
          [tweetId]: { ...prev[tweetId], isSending: false, sent: true },
        }))
      } catch (err) {
        setReplyStates((prev) => ({
          ...prev,
          [tweetId]: {
            ...prev[tweetId],
            isSending: false,
            error: err instanceof Error ? err.message : "Failed to send reply",
          },
        }))
      }
    },
    [replyStates]
  )

  const updateEditedReply = useCallback((tweetId: string, value: string) => {
    setReplyStates((prev) => ({
      ...prev,
      [tweetId]: { ...prev[tweetId], editedReply: value },
    }))
  }, [])

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

          {/* Section 4: Get KOL Tweets & Reply */}
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-base mb-1">Get Tweets & Reply</h2>
                <p className="text-xs text-muted-foreground">
                  Select a KOL to fetch their latest tweets, then generate & send AI replies
                </p>
              </div>

              {!config.stylePrompt && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <Sparkles className="h-4 w-4 text-yellow-600 shrink-0" />
                  <p className="text-xs text-yellow-700">
                    Configure your AI reply style above before generating replies
                  </p>
                </div>
              )}

              {selectedKols.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No KOLs selected.{" "}
                  <Link to="/" className="text-primary hover:underline">
                    Go to Directory
                  </Link>
                </p>
              ) : (
                <>
                  {/* KOL chips */}
                  <div className="flex flex-wrap gap-2">
                    {selectedKols.map((kol, i) => (
                      <button
                        key={kol.id}
                        onClick={() => handleFetchTweets(i)}
                        disabled={isLoadingTweets}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                          selectedKolIndex === i
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={
                              kol.profileImageUrlHttps ??
                              `https://api.dicebear.com/9.x/initials/svg?seed=${kol.name}`
                            }
                            alt={kol.name}
                          />
                          <AvatarFallback className="text-[10px]">
                            {kol.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{kol.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Loading */}
                  {isLoadingTweets && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Fetching tweets...
                      </span>
                    </div>
                  )}

                  {tweetsError && (
                    <p className="text-sm text-destructive text-center py-2">{tweetsError}</p>
                  )}

                  {/* Tweet list */}
                  {selectedKol && !isLoadingTweets && kolTweets.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {kolTweets.length} tweets from @{selectedKol.screenName}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1 h-7"
                          onClick={() => handleFetchTweets(selectedKolIndex!)}
                        >
                          <RefreshCw className="h-3 w-3" />
                          Refresh
                        </Button>
                      </div>

                      {kolTweets.map((item) => {
                        const tweet = item.tweet
                        const state = replyStates[tweet.id]
                        const isExpanded = expandedTweet === tweet.id

                        return (
                          <div
                            key={tweet.id}
                            className="p-3 rounded-lg border space-y-2"
                          >
                            {/* Tweet header */}
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarImage
                                  src={
                                    item.user.profileImageUrlHttps
                                    ?? (item.user as any).profile_image_url_https
                                    ?? selectedKol?.profileImageUrlHttps
                                    ?? `https://api.dicebear.com/9.x/initials/svg?seed=${item.user.name}`
                                  }
                                  alt={item.user.name}
                                />
                                <AvatarFallback className="text-[10px]">
                                  {item.user.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm truncate">
                                {item.user.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(tweet.createdAt)}
                              </span>
                              <a
                                href={`https://x.com/${item.user.screenName}/status/${tweet.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto text-muted-foreground hover:text-primary shrink-0"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>

                            {/* Tweet text */}
                            <p className="text-sm leading-relaxed">
                              {tweet.fullText || tweet.text}
                            </p>

                            {/* Metrics */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {formatNumber(tweet.replyCount)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Repeat2 className="h-3 w-3" />
                                {formatNumber(tweet.retweetCount)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {formatNumber(tweet.favoriteCount)}
                              </span>
                              <span className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                {formatNumber(tweet.viewCount)}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-1">
                              {state?.sent ? (
                                <Badge className="bg-green-500/10 text-green-700 gap-1">
                                  <Check className="h-3 w-3" />
                                  Reply Sent
                                </Badge>
                              ) : state?.skipped ? (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                  <X className="h-3 w-3" />
                                  Skipped{state.skipReason ? `: ${state.skipReason}` : ""}
                                </Badge>
                              ) : (
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="gap-1.5 text-xs"
                                          onClick={() =>
                                            handleGenerateReply(
                                              tweet.id,
                                              tweet.fullText || tweet.text,
                                              item.user.screenName
                                            )
                                          }
                                          disabled={state?.isGenerating || !config.stylePrompt}
                                        >
                                          {state?.isGenerating ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          ) : (
                                            <Sparkles className="h-3.5 w-3.5" />
                                          )}
                                          {state?.generatedReply ? "Regenerate" : "Generate Reply"}
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    {!config.stylePrompt && (
                                      <TooltipContent>
                                        Set up your AI reply style first
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {state?.generatedReply && !state.sent && !state.skipped && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs h-7"
                                  onClick={() =>
                                    setExpandedTweet(isExpanded ? null : tweet.id)
                                  }
                                >
                                  {isExpanded ? "Collapse" : "Show Reply"}
                                </Button>
                              )}
                            </div>

                            {state?.error && (
                              <p className="text-xs text-destructive">{state.error}</p>
                            )}

                            {/* Reply editor */}
                            {isExpanded && state?.generatedReply && !state.sent && (
                              <div className="ml-3 mt-1 space-y-2 border-l-2 border-primary/30 pl-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">Your Reply</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {(state.editedReply || "").length}/280
                                  </span>
                                </div>
                                <Textarea
                                  value={state.editedReply}
                                  onChange={(e) =>
                                    updateEditedReply(tweet.id, e.target.value)
                                  }
                                  rows={2}
                                  className="text-sm resize-none"
                                />
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => handleSendReply(tweet.id)}
                                    disabled={
                                      state.isSending ||
                                      !state.editedReply?.trim() ||
                                      !isTwitterConnected
                                    }
                                  >
                                    {state.isSending ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Send className="h-3.5 w-3.5" />
                                    )}
                                    Send Reply
                                  </Button>
                                  {!isTwitterConnected && (
                                    <span className="text-[10px] text-muted-foreground">
                                      Connect Twitter above to send
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {selectedKol && !isLoadingTweets && kolTweets.length === 0 && !tweetsError && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tweets found for @{selectedKol.screenName}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/configure")({
  component: ConfigurePage,
})
