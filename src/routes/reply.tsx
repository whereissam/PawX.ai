import { useState, useCallback } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Send,
  MessageCircle,
  Repeat2,
  Heart,
  Bookmark,
  BarChart3,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react"
import { useKolSelection } from "@/hooks/use-kol-selection"
import { useInteractionConfig } from "@/hooks/use-interaction-config"
import { useAuth } from "@/hooks/use-auth"
import { getTweetsInfo } from "@/lib/api"
import { generateReply } from "@/lib/gemini"
import { postTweet } from "@/lib/twitter-api"
import type { TweetResponse } from "@/types"

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

function ReplyPage() {
  const { selectedKols } = useKolSelection()
  const { config } = useInteractionConfig()
  const { isTwitterConnected } = useAuth()

  const [selectedKolIndex, setSelectedKolIndex] = useState<number | null>(null)
  const [tweets, setTweets] = useState<TweetResponse[]>([])
  const [isLoadingTweets, setIsLoadingTweets] = useState(false)
  const [tweetsError, setTweetsError] = useState<string | null>(null)
  const [replyStates, setReplyStates] = useState<Record<string, TweetReplyState>>({})
  const [expandedTweet, setExpandedTweet] = useState<string | null>(null)

  const selectedKol = selectedKolIndex !== null ? selectedKols[selectedKolIndex] : null

  const handleSelectKol = useCallback(
    async (index: number) => {
      const kol = selectedKols[index]
      if (!kol) return

      setSelectedKolIndex(index)
      setTweets([])
      setReplyStates({})
      setExpandedTweet(null)
      setIsLoadingTweets(true)
      setTweetsError(null)

      try {
        const data = await getTweetsInfo([kol.screenName])
        // Filter out retweets and replies, show original tweets only
        const originalTweets = data.filter(
          (t) => !t.tweet.retweetedTweetId && !t.tweet.inReplyToTweetId
        )
        setTweets(originalTweets.slice(0, 10))
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
          error: undefined,
          sent: false,
          skipped: false,
        },
      }))

      try {
        const conditionPrompt =
          config.replyCondition === "conditional" ? config.conditionPrompt : undefined
        const result = await generateReply(
          config.stylePrompt,
          tweetText,
          tweetAuthor,
          conditionPrompt
        )

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

  const handleSendReply = useCallback(async (tweetId: string) => {
    const state = replyStates[tweetId]
    if (!state?.editedReply) return

    setReplyStates((prev) => ({
      ...prev,
      [tweetId]: { ...prev[tweetId], isSending: true, error: undefined },
    }))

    try {
      const result = await postTweet(state.editedReply, tweetId)
      if (!result.success) {
        throw new Error(result.error || "Failed to post reply")
      }
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
  }, [replyStates])

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
          <Link to="/configure">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Reply to Tweets</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pick a KOL, choose a tweet, generate & send your AI reply
            </p>
          </div>
        </div>

        {/* Style summary */}
        {config.stylePrompt && (
          <div className="mb-4 p-3 bg-surface-2/60 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-xs">Active Style</span>
              {config.replyCondition === "conditional" && (
                <Badge variant="outline" className="text-[10px]">
                  Conditional
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {config.stylePrompt}
            </p>
          </div>
        )}

        {/* KOL selector */}
        <div className="mb-6">
          <h2 className="font-semibold text-sm mb-3">Select a KOL</h2>
          {selectedKols.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No KOLs selected.{" "}
              <Link to="/" className="text-primary hover:underline">
                Go to Directory
              </Link>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedKols.map((kol, i) => (
                <button
                  key={kol.id}
                  onClick={() => handleSelectKol(i)}
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
                  <span className="text-muted-foreground text-xs">@{kol.screenName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tweets */}
        {selectedKol && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">
                Recent tweets from @{selectedKol.screenName}
              </h2>
              <a
                href={`https://x.com/${selectedKol.screenName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                View profile <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {isLoadingTweets && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Fetching tweets...</span>
              </div>
            )}

            {tweetsError && (
              <p className="text-sm text-destructive text-center py-4">{tweetsError}</p>
            )}

            {!isLoadingTweets && tweets.length === 0 && !tweetsError && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tweets found. Try another KOL.
              </p>
            )}

            {tweets.map((item) => {
              const tweet = item.tweet
              const state = replyStates[tweet.id]
              const isExpanded = expandedTweet === tweet.id

              return (
                <Card key={tweet.id} className="overflow-hidden">
                  <CardContent className="p-3 sm:p-4 space-y-2.5">
                    {/* Tweet header */}
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage
                          src={
                            item.user.profileImageUrlHttps ??
                            `https://api.dicebear.com/9.x/initials/svg?seed=${item.user.name}`
                          }
                          alt={item.user.name}
                        />
                        <AvatarFallback className="text-[10px]">
                          {item.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1.5 min-w-0 text-sm flex-1">
                        <span className="font-semibold truncate">{item.user.name}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground text-xs">
                          {formatDate(tweet.createdAt)}
                        </span>
                      </div>
                      <a
                        href={`https://x.com/${item.user.screenName}/status/${tweet.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    {/* Tweet text */}
                    <p className="text-sm leading-relaxed">
                      {tweet.fullText || tweet.text}
                    </p>

                    {/* Engagement metrics */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {formatNumber(tweet.replyCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="h-3.5 w-3.5" />
                        {formatNumber(tweet.retweetCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {formatNumber(tweet.favoriteCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3.5 w-3.5" />
                        {formatNumber(tweet.bookmarkCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5" />
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
                        <Badge variant="secondary" className="gap-1">
                          <X className="h-3 w-3" />
                          Skipped: {state.skipReason}
                        </Badge>
                      ) : (
                        <>
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

                          {state?.generatedReply && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs"
                              onClick={() =>
                                setExpandedTweet(isExpanded ? null : tweet.id)
                              }
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                              {isExpanded ? "Collapse" : "Show Reply"}
                            </Button>
                          )}
                        </>
                      )}
                    </div>

                    {state?.error && (
                      <p className="text-xs text-destructive">{state.error}</p>
                    )}

                    {/* Reply editor */}
                    {isExpanded && state?.generatedReply && !state.sent && (
                      <div className="ml-4 mt-2 space-y-2 border-l-2 border-primary/30 pl-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">Your Reply</span>
                          <span className="text-[10px] text-muted-foreground">
                            {(state.editedReply || "").length}/280
                          </span>
                        </div>
                        <Textarea
                          value={state.editedReply}
                          onChange={(e) => updateEditedReply(tweet.id, e.target.value)}
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
                              Connect Twitter in{" "}
                              <Link to="/configure" className="text-primary hover:underline">
                                Configure
                              </Link>{" "}
                              to send
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* No style warning */}
        {!config.stylePrompt && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              No reply style configured.{" "}
              <Link to="/configure" className="text-primary hover:underline">
                Set up your style first
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/reply")({
  component: ReplyPage,
})
