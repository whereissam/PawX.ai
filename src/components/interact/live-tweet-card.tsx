import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Clock,
  Minus,
} from "lucide-react"
import type { WsMessage } from "@/hooks/use-websocket"
import type { KolUser } from "@/types"

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

  // "user-full-tweet" format: { type, data: { userId, status: {...}, relatedFullTweets, timestamp } }
  if (inner?.status) {
    const status = inner.status as Record<string, any>
    const userId = inner.userId as string | undefined

    // Look up user from selectedKols
    const kol = selectedKols.find((k) => k.id === userId)

    // Try to get user info from relatedFullTweets if the tweet has in_reply_to
    const relatedTweets = inner.relatedFullTweets as Record<string, any>[] | undefined

    const text = (status.full_text ?? status.text ?? "") as string
    const createdAt = status.created_at as string | undefined
    const replyCount = (status.reply_count ?? 0) as number
    const retweetCount = (status.retweet_count ?? 0) as number
    const favoriteCount = (status.favorite_count ?? 0) as number
    const bookmarkCount = (status.bookmark_count ?? 0) as number
    const quoteCount = (status.quote_count ?? 0) as number
    const viewCount = (status.views?.count ?? 0) as number

    return {
      text,
      name: kol?.name ?? "Unknown",
      screenName: kol?.screenName ?? "unknown",
      avatarUrl: kol?.profileImageUrlHttps
        ? kol.profileImageUrlHttps.replace("_normal", "_bigger")
        : undefined,
      createdAt: createdAt ? formatDate(createdAt) : formatDate(inner.timestamp ?? message.receivedAt),
      replyCount,
      retweetCount,
      favoriteCount,
      bookmarkCount,
      quoteCount,
      viewCount,
      relatedTweets,
    }
  }

  // Fallback: generic format
  const text = (raw?.text ?? raw?.full_text ?? raw?.message ?? JSON.stringify(raw)) as string
  const userObj = raw?.user as Record<string, any> | undefined

  return {
    text,
    name: (userObj?.name ?? raw?.name ?? "Unknown") as string,
    screenName: (userObj?.screen_name ?? userObj?.screenName ?? raw?.username ?? raw?.screen_name ?? "unknown") as string,
    avatarUrl: (userObj?.profile_image_url_https ?? userObj?.profileImageUrlHttps) as string | undefined,
    createdAt: formatDate(message.receivedAt),
    replyCount: 0,
    retweetCount: 0,
    favoriteCount: 0,
    bookmarkCount: 0,
    quoteCount: 0,
    viewCount: 0,
    relatedTweets: undefined as Record<string, any>[] | undefined,
  }
}

interface LiveTweetCardProps {
  message: WsMessage
  selectedKols: KolUser[]
}

export function LiveTweetCard({ message, selectedKols }: LiveTweetCardProps) {
  const tweet = parseTweetData(message, selectedKols)

  const avatarSrc = tweet.avatarUrl
    ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${tweet.screenName}`

  // Simulate reply status
  const hash = message.id.charCodeAt(0) % 3
  const replyStatus = hash === 0 ? "replied" : hash === 1 ? "pending" : "skipped"

  const statusConfig = {
    replied: { label: "Replied", color: "bg-green-500/10 text-green-700", icon: Check },
    pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-700", icon: Clock },
    skipped: { label: "Skipped", color: "bg-muted text-muted-foreground", icon: Minus },
  }

  const status = statusConfig[replyStatus]
  const StatusIcon = status.icon

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

        {/* Reply status */}
        <div className="flex items-center justify-between pt-1">
          <Badge variant="secondary" className="text-xs gap-1">
            <MessageSquare className="h-3 w-3" />
            Auto-replying...
          </Badge>
          <Badge className={`text-xs gap-1 ${status.color}`}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>

        {replyStatus === "replied" && (
          <div className="ml-4 p-2.5 bg-surface-2/50 rounded-md border-l-2 border-green-500/50">
            <p className="text-xs text-muted-foreground">
              Great point! The on-chain metrics confirm this trend.
            </p>
          </div>
        )}

        {replyStatus === "skipped" && (
          <p className="text-xs text-muted-foreground ml-4">
            Reason: Does not match reply conditions
          </p>
        )}
      </CardContent>
    </Card>
  )
}
