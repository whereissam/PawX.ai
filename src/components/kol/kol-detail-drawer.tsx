import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TagBadge } from "@/components/tag-badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  UserPlus,
  MapPin,
  Globe,
  Loader2,
  MessageCircle,
  Repeat2,
  Heart,
  Bookmark,
  Quote,
  BarChart3,
} from "lucide-react"
import { getTweetsInfo } from "@/lib/api"
import type { KolUser, Tweet, TweetResponse } from "@/types"

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "0"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

interface KolDetailDrawerProps {
  kol: KolUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isSelected: boolean
  onToggleSelect: (kol: KolUser) => void
}

export function KolDetailDrawer({
  kol,
  open,
  onOpenChange,
  isSelected,
  onToggleSelect,
}: KolDetailDrawerProps) {
  const [tweetResponses, setTweetResponses] = useState<TweetResponse[]>([])
  const [loadingTweets, setLoadingTweets] = useState(false)

  useEffect(() => {
    if (!kol || !open) return
    let cancelled = false

    async function loadTweets() {
      setLoadingTweets(true)
      try {
        const data = await getTweetsInfo([kol!.screenName])
        if (!cancelled) {
          setTweetResponses(data.slice(0, 10))
        }
      } catch {
        // Keep empty on error
      } finally {
        if (!cancelled) setLoadingTweets(false)
      }
    }

    loadTweets()
    return () => { cancelled = true }
  }, [kol, open])

  if (!kol) return null

  const avatarSrc = kol.profileImageUrlHttps
    ? kol.profileImageUrlHttps.replace("_normal", "_bigger")
    : `https://api.dicebear.com/9.x/avataaars/svg?seed=${kol.screenName}`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-4 sm:px-6">
        <SheetHeader>
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              <AvatarImage src={avatarSrc} alt={kol.name} />
              <AvatarFallback>{kol.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base sm:text-lg truncate">{kol.name}</SheetTitle>
                {kol.isKol && (
                  <svg className="h-4 w-4 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{kol.screenName}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          {kol.description && <p className="text-sm">{kol.description}</p>}

          <div className="flex items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <strong className="text-foreground">{formatNumber(kol.followersCount)}</strong>
              <span className="hidden sm:inline">followers</span>
            </span>
            <span className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              <strong className="text-foreground">{formatNumber(kol.friendsCount)}</strong>
              <span className="hidden sm:inline">following</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {kol.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {kol.location}
              </span>
            )}
            <a
              href={`https://x.com/${kol.screenName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Globe className="h-3 w-3" />
              @{kol.screenName}
            </a>
          </div>

          {kol.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {kol.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            </div>
          )}

          <Button
            variant={isSelected ? "secondary" : "default"}
            className="w-full"
            onClick={() => onToggleSelect(kol)}
          >
            {isSelected ? "Remove from Selection" : "Select for Interaction"}
          </Button>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Recent Tweets</h4>
            {loadingTweets ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading tweets...</span>
              </div>
            ) : tweetResponses.length > 0 ? (
              tweetResponses.map(({ tweet, user }) => (
                  <div key={tweet.id} className="p-3 sm:p-4 bg-surface-2 rounded-lg shadow-neu-inset space-y-2.5">
                    {/* Header: avatar + name + handle + date */}
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={avatarSrc} alt={kol.name} />
                        <AvatarFallback className="text-xs">{kol.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1.5 min-w-0 text-sm">
                        <span className="font-semibold truncate">{kol.name}</span>
                        <span className="text-muted-foreground truncate">@{kol.screenName}</span>
                        <span className="text-muted-foreground shrink-0">·</span>
                        <span className="text-muted-foreground shrink-0 text-xs">{formatDate(tweet.createdAt)}</span>
                      </div>
                    </div>

                    {/* Tweet text */}
                    <p className="text-sm leading-relaxed">{tweet.text}</p>

                    {/* Engagement metrics with icons */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
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
                  </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent tweets found
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
