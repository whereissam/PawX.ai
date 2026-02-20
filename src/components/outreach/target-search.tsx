import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LANGUAGE_TAGS, ECOSYSTEM_TAGS, USER_TYPE_TAGS } from "@/data/tags"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FilterState, LanguageTag, EcosystemTag, UserTypeTag } from "@/types"

interface TargetSearchProps {
  filters: FilterState
  onToggleLanguage: (lang: LanguageTag) => void
  onToggleEcosystem: (eco: EcosystemTag) => void
  onToggleUserType: (type: UserTypeTag) => void
  onSearchChange: (query: string) => void
  matchCount: number
}

export function TargetSearch({
  filters,
  onToggleLanguage,
  onToggleEcosystem,
  onToggleUserType,
  onSearchChange,
  matchCount,
}: TargetSearchProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Target Filters</h3>
        <span className="text-xs text-muted-foreground">{matchCount} matched</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search KOLs..."
          value={filters.searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
          <span className="text-xs text-muted-foreground sm:w-14 shrink-0">Ecosystem</span>
          <div className="flex gap-1.5 flex-wrap">
            {ECOSYSTEM_TAGS.slice(0, 6).map((eco) => (
              <Badge
                key={eco.value}
                variant={filters.ecosystems.includes(eco.value) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs",
                  filters.ecosystems.includes(eco.value) && "bg-primary text-primary-foreground"
                )}
                onClick={() => onToggleEcosystem(eco.value)}
              >
                {eco.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
          <span className="text-xs text-muted-foreground sm:w-14 shrink-0">Language</span>
          <div className="flex gap-1.5 flex-wrap">
            {LANGUAGE_TAGS.slice(0, 5).map((lang) => (
              <Badge
                key={lang.value}
                variant={filters.languages.includes(lang.value) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs",
                  filters.languages.includes(lang.value) && "bg-primary text-primary-foreground"
                )}
                onClick={() => onToggleLanguage(lang.value)}
              >
                {lang.emoji} {lang.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
          <span className="text-xs text-muted-foreground sm:w-14 shrink-0">Type</span>
          <div className="flex gap-1.5 flex-wrap">
            {USER_TYPE_TAGS.slice(0, 5).map((type) => (
              <Badge
                key={type.value}
                variant={filters.userTypes.includes(type.value) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs",
                  filters.userTypes.includes(type.value) && "bg-primary text-primary-foreground"
                )}
                onClick={() => onToggleUserType(type.value)}
              >
                {type.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
