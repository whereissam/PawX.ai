import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { TagBadge } from "@/components/tag-badge"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, MapPin, Calendar, Globe } from "lucide-react"
import { tweets } from "@/data/tweets"
import type { KOL } from "@/types"

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return "just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface KolDetailDrawerProps {
  kol: KOL | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isSelected: boolean
  onToggleSelect: (id: string) => void
}

export function KolDetailDrawer({
  kol,
  open,
  onOpenChange,
  isSelected,
  onToggleSelect,
}: KolDetailDrawerProps) {
  if (!kol) return null

  const kolTweets = tweets.filter((t) => t.kolId === kol.id)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-4 sm:px-6">
        <SheetHeader>
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              <AvatarImage src={kol.avatar} alt={kol.displayName} />
              <AvatarFallback>{kol.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base sm:text-lg truncate">{kol.displayName}</SheetTitle>
                {kol.verified && (
                  <svg className="h-4 w-4 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{kol.handle}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <p className="text-sm">{kol.bio}</p>

          <div className="flex items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <strong className="text-foreground">{formatNumber(kol.followers)}</strong>
              <span className="hidden sm:inline">followers</span>
            </span>
            <span className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              <strong className="text-foreground">{formatNumber(kol.following)}</strong>
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
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined {kol.joinedDate}
            </span>
            {kol.website && (
              <a
                href={kol.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Globe className="h-3 w-3" />
                Website
              </a>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Languages</h4>
            <div className="flex flex-wrap gap-1">
              {kol.languages.map((lang) => (
                <TagBadge key={lang} tag={lang} type="language" />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Ecosystems</h4>
            <div className="flex flex-wrap gap-1">
              {kol.ecosystems.map((eco) => (
                <TagBadge key={eco} tag={eco} type="ecosystem" />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Type</h4>
            <div className="flex flex-wrap gap-1">
              {kol.userTypes.map((type) => (
                <TagBadge key={type} tag={type} type="userType" />
              ))}
            </div>
          </div>

          <Separator />

          <Button
            variant={isSelected ? "secondary" : "default"}
            className="w-full"
            onClick={() => onToggleSelect(kol.id)}
          >
            {isSelected ? "Remove from Selection" : "Select for Interaction"}
          </Button>

          {kolTweets.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Recent Tweets</h4>
                {kolTweets.map((tweet) => (
                  <div key={tweet.id} className="p-2.5 sm:p-3 bg-muted rounded-lg space-y-2">
                    <p className="text-sm">{tweet.content}</p>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>{formatNumber(tweet.likes)} likes</span>
                      <span>{formatNumber(tweet.retweets)} RT</span>
                      <span>{formatNumber(tweet.replies)} replies</span>
                      <span className="sm:ml-auto">{timeAgo(tweet.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
