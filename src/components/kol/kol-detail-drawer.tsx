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
import { Users, UserPlus, MapPin, Globe, Eye, Loader2 } from "lucide-react"
import { getTweetsInfo } from "@/lib/api"
import type { KolUser, Tweet } from "@/types"

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "0"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
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
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loadingTweets, setLoadingTweets] = useState(false)

  useEffect(() => {
    if (!kol || !open) return
    let cancelled = false

    async function loadTweets() {
      setLoadingTweets(true)
      try {
        const data = await getTweetsInfo([kol!.screenName])
        if (!cancelled) {
          setTweets(data.map((r) => r.tweet).slice(0, 10))
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
            ) : tweets.length > 0 ? (
              tweets.map((tweet) => (
                <div key={tweet.id} className="p-3 sm:p-4 bg-surface-2 rounded-md shadow-neu-inset space-y-2">
                  <p className="text-sm">{tweet.text}</p>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{formatNumber(tweet.favoriteCount)} likes</span>
                    <span>{formatNumber(tweet.retweetCount)} RT</span>
                    <span>{formatNumber(tweet.replyCount)} replies</span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" />
                      {formatNumber(tweet.viewCount)}
                    </span>
                    <span className="sm:ml-auto">{timeAgo(tweet.createdAt)}</span>
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
