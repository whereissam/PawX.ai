import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Radio,
  MessageSquare,
  MessageCircle,
  Repeat2,
  Heart,
  Bookmark,
  Quote,
  BarChart3,
  Check,
  X,
  Sparkles,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { WsMessage } from "@/hooks/use-websocket"
import type { KolUser } from "@/types"
import { useInteractionConfig } from "@/hooks/use-interaction-config"
import { useAuth } from "@/hooks/use-auth"
import { generateReply } from "@/lib/gemini"
import { postTweet } from "@/lib/twitter-api"

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "0"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function formatDate(timestamp: string | number): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

/** Extract tweet info from various WebSocket message formats */
function parseTweetData(message: WsMessage, selectedKols: KolUser[]) {
  const raw = message.data as Record<string, any>
  const inner = raw?.data as Record<string, any> | undefined

  if (!inner?.status) {
    // Fallback: generic format
    const text = (raw?.text ?? raw?.full_text ?? raw?.message ?? JSON.stringify(raw)) as string
    const userObj = raw?.user as Record<string, any> | undefined
    return {
      text,
      name: (userObj?.name ?? raw?.name ?? "Unknown") as string,
      screenName: (userObj?.screen_name ?? userObj?.screenName ?? "unknown") as string,
      avatarUrl: (userObj?.profile_image_url_https ?? userObj?.profileImageUrlHttps) as string | undefined,
      createdAt: formatDate(message.receivedAt),
      replyCount: 0, retweetCount: 0, favoriteCount: 0,
      bookmarkCount: 0, quoteCount: 0, viewCount: 0,
      relatedTweets: undefined as Record<string, any>[] | undefined,
    }
  }

  const status = inner.status as Record<string, any>
  const statusUser = status.user as Record<string, any> | undefined
  const relatedTweets = inner.relatedFullTweets as Record<string, any>[] | undefined

  // "user-update" has data.twitterUser with full profile info
  const twitterUser = inner.twitterUser as Record<string, any> | undefined

  // "user-full-tweet" has data.userId + status.user
  const userId = (inner.userId ?? twitterUser?.id) as string | undefined

  // Resolve user info from best available source
  const kol = selectedKols.find((k) => k.id === userId)
    ?? selectedKols.find((k) => twitterUser?.screenName && k.screenName === twitterUser.screenName)
    ?? selectedKols.find((k) => statusUser?.screen_name && k.screenName === statusUser.screen_name)
  const relatedUser = relatedTweets?.find((t) => t.userId === userId)?.user as Record<string, any> | undefined

  // Priority: twitterUser (user-update) > kol (selectedKols) > status.user > relatedUser
  const userName = twitterUser?.name
    ?? kol?.name
    ?? statusUser?.name
    ?? relatedUser?.name
    ?? "Unknown"
  const userScreenName = twitterUser?.screenName
    ?? kol?.screenName
    ?? statusUser?.screen_name ?? statusUser?.screenName
    ?? relatedUser?.screenName
    ?? "unknown"
  const userAvatar = twitterUser?.profileImageUrlHttps
    ?? kol?.profileImageUrlHttps
    ?? statusUser?.profile_image_url_https ?? statusUser?.profileImageUrlHttps
    ?? relatedUser?.profileImageUrlHttps
    ?? undefined

  const text = (status.full_text ?? status.text ?? "") as string
  const createdAt = status.created_at as string | undefined

  return {
    text,
    name: userName as string,
    screenName: userScreenName as string,
    avatarUrl: userAvatar
      ? (userAvatar as string).replace("_normal", "_bigger")
      : undefined,
    createdAt: createdAt ? formatDate(createdAt) : formatDate(inner.timestamp ?? message.receivedAt),
    replyCount: (status.reply_count ?? 0) as number,
    retweetCount: (status.retweet_count ?? 0) as number,
    favoriteCount: (status.favorite_count ?? 0) as number,
    bookmarkCount: (status.bookmark_count ?? 0) as number,
    quoteCount: (status.quote_count ?? 0) as number,
    viewCount: (status.views?.count ?? 0) as number,
    relatedTweets,
  }
}

interface LiveTweetCardProps {
  message: WsMessage
  selectedKols: KolUser[]
}

export function LiveTweetCard({ message, selectedKols }: LiveTweetCardProps) {
  const tweet = parseTweetData(message, selectedKols)
  const { config } = useInteractionConfig()
  const { isTwitterConnected } = useAuth()

  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [generatedReply, setGeneratedReply] = useState("")
  const [editedReply, setEditedReply] = useState("")
  const [sent, setSent] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const [skipReason, setSkipReason] = useState<string>()
  const [error, setError] = useState<string>()
  const [isExpanded, setIsExpanded] = useState(false)

  const tweetId = message.tweetId

  const avatarSrc = tweet.avatarUrl
    ?? `https://api.dicebear.com/9.x/initials/svg?seed=${tweet.name}`

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setError(undefined)
    setSent(false)
    setSkipped(false)

    try {
      const conditionPrompt =
        config.replyCondition === "conditional" ? config.conditionPrompt : undefined
      const result = await generateReply(
        config.stylePrompt,
        tweet.text,
        tweet.screenName,
        conditionPrompt
      )

      setGeneratedReply(result.reply)
      setEditedReply(result.reply)
      setSkipped(!result.shouldReply)
      setSkipReason(result.reason)
      setIsExpanded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate reply")
    } finally {
      setIsGenerating(false)
    }
  }, [config, tweet.text, tweet.screenName])

  const handleSend = useCallback(async () => {
    if (!editedReply?.trim() || !tweetId) return

    setIsSending(true)
    setError(undefined)

    try {
      const result = await postTweet(editedReply, tweetId)
      if (!result.success) {
        throw new Error(result.error || "Failed to post reply")
      }
      setSent(true)
      setIsExpanded(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply")
    } finally {
      setIsSending(false)
    }
  }, [editedReply, tweetId])

  return (
    <Card className="border-l-4 border-l-primary/60 animate-in slide-in-from-top-2 duration-300">
      <CardContent className="p-3 sm:p-4 space-y-2.5">
        {/* Header: avatar + name + handle + date + LIVE badge */}
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={avatarSrc} alt={tweet.name} />
            <AvatarFallback className="text-xs">
              {tweet.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1.5 min-w-0 text-sm flex-1">
            <span className="font-semibold truncate">{tweet.name}</span>
            <span className="text-muted-foreground truncate">@{tweet.screenName}</span>
            <span className="text-muted-foreground shrink-0">·</span>
            <span className="text-muted-foreground shrink-0 text-xs">{tweet.createdAt}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Radio className="h-3 w-3 text-primary animate-pulse" />
            <Badge variant="default" className="text-xs py-0 px-1.5">
              LIVE
            </Badge>
          </div>
        </div>

        {/* Tweet text */}
        <p className="text-sm leading-relaxed">{tweet.text}</p>

        {/* Engagement metrics with icons */}
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
            <Quote className="h-3.5 w-3.5" />
            {formatNumber(tweet.quoteCount)}
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5" />
            {formatNumber(tweet.viewCount)}
          </span>
        </div>

        {/* Reply actions */}
        <div className="flex items-center gap-2 pt-1">
          {sent ? (
            <Badge className="bg-green-500/10 text-green-700 gap-1">
              <Check className="h-3 w-3" />
              Reply Sent
            </Badge>
          ) : skipped ? (
            <Badge variant="secondary" className="gap-1">
              <X className="h-3 w-3" />
              Skipped: {skipReason}
            </Badge>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={handleGenerate}
                disabled={isGenerating || !config.stylePrompt}
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {generatedReply ? "Regenerate" : "Generate Reply"}
              </Button>

              {generatedReply && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => setIsExpanded(!isExpanded)}
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

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        {/* Reply editor */}
        {isExpanded && generatedReply && !sent && !skipped && (
          <div className="ml-4 mt-2 space-y-2 border-l-2 border-primary/30 pl-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium">Your Reply</span>
              <span className="text-[10px] text-muted-foreground">
                {editedReply.length}/280
              </span>
            </div>
            <Textarea
              value={editedReply}
              onChange={(e) => setEditedReply(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleSend}
                disabled={isSending || !editedReply?.trim() || !tweetId || !isTwitterConnected}
              >
                {isSending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send Reply
              </Button>
              {!isTwitterConnected && (
                <span className="text-[10px] text-muted-foreground">
                  Connect Twitter in Configure to send
                </span>
              )}
              {!tweetId && isTwitterConnected && (
                <span className="text-[10px] text-muted-foreground">
                  No tweet ID available for reply
                </span>
              )}
            </div>
          </div>
        )}

        {/* Show sent reply */}
        {sent && editedReply && (
          <div className="ml-4 p-2.5 bg-surface-2/50 rounded-md border-l-2 border-green-500/50">
            <p className="text-xs text-muted-foreground">{editedReply}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
