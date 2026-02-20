import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { TagBadge } from "@/components/tag-badge"
import { ExternalLink, Users, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { KolUser } from "@/types"

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

interface KolCardProps {
  kol: KolUser
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onViewDetail: (kol: KolUser) => void
}

export function KolCard({ kol, isSelected, onToggleSelect, onViewDetail }: KolCardProps) {
  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-raised-hover hover:-translate-y-0.5 active:shadow-neu-inset active:translate-y-0",
        isSelected && "shadow-raised-hover ring-2 ring-primary/30"
      )}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div
            className="relative shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect(kol.id)
            }}
          >
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${kol.screenName}`} alt={kol.name} />
              <AvatarFallback>{kol.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute -top-1 -right-1 transition-opacity",
                isSelected ? "opacity-100" : "opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
              )}
            >
              <Checkbox
                checked={isSelected}
                className="h-4 w-4"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0" onClick={() => onViewDetail(kol)}>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm truncate">{kol.name}</h3>
              {kol.isKol && (
                <svg className="h-3.5 w-3.5 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="text-xs text-muted-foreground">@{kol.screenName}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{kol.description}</p>

            <div className="flex items-center gap-2 sm:gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {formatNumber(kol.followersCount)}
              </span>
              <span className="flex items-center gap-1">
                <UserPlus className="h-3 w-3" />
                {formatNumber(kol.friendsCount)}
              </span>
              {kol.website && (
                <ExternalLink className="h-3 w-3" />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2.5 sm:mt-3" onClick={() => onViewDetail(kol)}>
          {kol.tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
          {kol.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{kol.tags.length - 3}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
