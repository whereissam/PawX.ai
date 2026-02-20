import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { TagBadge } from "@/components/tag-badge"
import { ExternalLink, Users, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { KOL } from "@/types"

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

interface KolCardProps {
  kol: KOL
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onViewDetail: (kol: KOL) => void
}

export function KolCard({ kol, isSelected, onToggleSelect, onViewDetail }: KolCardProps) {
  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all hover:shadow-md hover:border-primary/30 active:scale-[0.98]",
        isSelected && "border-primary ring-1 ring-primary/20"
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
              <AvatarImage src={kol.avatar} alt={kol.displayName} />
              <AvatarFallback>{kol.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute -top-1 -right-1 transition-opacity",
                isSelected ? "opacity-100" : "opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
              )}
            >
              <Checkbox
                checked={isSelected}
                className="h-4 w-4 bg-background"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0" onClick={() => onViewDetail(kol)}>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm truncate">{kol.displayName}</h3>
              {kol.verified && (
                <svg className="h-3.5 w-3.5 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{kol.handle}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{kol.bio}</p>

            <div className="flex items-center gap-2 sm:gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {formatNumber(kol.followers)}
              </span>
              <span className="flex items-center gap-1">
                <UserPlus className="h-3 w-3" />
                {formatNumber(kol.following)}
              </span>
              {kol.website && (
                <ExternalLink className="h-3 w-3" />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2.5 sm:mt-3" onClick={() => onViewDetail(kol)}>
          {kol.ecosystems.slice(0, 3).map((eco) => (
            <TagBadge key={eco} tag={eco} type="ecosystem" />
          ))}
          {kol.ecosystems.length > 3 && (
            <span className="text-xs text-muted-foreground">+{kol.ecosystems.length - 3}</span>
          )}
          {kol.userTypes.slice(0, 2).map((type) => (
            <TagBadge key={type} tag={type} type="userType" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
