import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LANGUAGE_TAGS, ECOSYSTEM_TAGS, USER_TYPE_TAGS } from "@/data/tags"
import { Search, X, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FilterState, LanguageTag, EcosystemTag, UserTypeTag } from "@/types"

interface KolFilterBarProps {
  filters: FilterState
  onToggleLanguage: (lang: LanguageTag) => void
  onToggleEcosystem: (eco: EcosystemTag) => void
  onToggleUserType: (type: UserTypeTag) => void
  onSearchChange: (query: string) => void
  onClear: () => void
  hasActiveFilters: boolean
}

export function KolFilterBar({
  filters,
  onToggleLanguage,
  onToggleEcosystem,
  onToggleUserType,
  onSearchChange,
  onClear,
  hasActiveFilters,
}: KolFilterBarProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(true)

  const activeCount =
    filters.languages.length + filters.ecosystems.length + filters.userTypes.length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search KOLs..."
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="sm:hidden shrink-0"
        >
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full h-4 w-4 text-xs flex items-center justify-center mr-1">
              {activeCount}
            </span>
          )}
          Filters
          {filtersExpanded ? (
            <ChevronUp className="h-3 w-3 ml-1" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-1" />
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground shrink-0">
            <X className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      <div className={cn(
        "space-y-2 overflow-hidden transition-all",
        filtersExpanded ? "max-h-96" : "max-h-0 sm:max-h-96"
      )}>
        <FilterRow label="Language">
          <div className="flex gap-1.5 flex-wrap">
            {LANGUAGE_TAGS.map((lang) => (
              <Badge
                key={lang.value}
                variant={filters.languages.includes(lang.value) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs transition-colors",
                  filters.languages.includes(lang.value) && "bg-primary text-primary-foreground"
                )}
                onClick={() => onToggleLanguage(lang.value)}
              >
                {lang.emoji} {lang.label}
              </Badge>
            ))}
          </div>
        </FilterRow>

        <FilterRow label="Ecosystem">
          <div className="flex gap-1.5 flex-wrap">
            {ECOSYSTEM_TAGS.map((eco) => {
              const isActive = filters.ecosystems.includes(eco.value)
              return (
                <Badge
                  key={eco.value}
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer text-xs transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : eco.color
                  )}
                  onClick={() => onToggleEcosystem(eco.value)}
                >
                  {eco.label}
                </Badge>
              )
            })}
          </div>
        </FilterRow>

        <FilterRow label="Type">
          <div className="flex gap-1.5 flex-wrap">
            {USER_TYPE_TAGS.map((type) => (
              <Badge
                key={type.value}
                variant={filters.userTypes.includes(type.value) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs transition-colors",
                  filters.userTypes.includes(type.value) && "bg-primary text-primary-foreground"
                )}
                onClick={() => onToggleUserType(type.value)}
              >
                {type.label}
              </Badge>
            ))}
          </div>
        </FilterRow>
      </div>
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
      <span className="text-xs font-medium text-muted-foreground sm:w-16 shrink-0">{label}</span>
      {children}
    </div>
  )
}
