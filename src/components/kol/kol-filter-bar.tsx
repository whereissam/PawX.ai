import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { KOL_CATEGORIES, CATEGORY_LABELS } from "@/data/tags"
import { Search, X, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface KolFilterBarProps {
  selectedCategories: Record<string, string[]>
  onToggleCategory: (category: string, value: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onClear: () => void
  onSearch: () => void
  hasActiveFilters: boolean
}

export function KolFilterBar({
  selectedCategories,
  onToggleCategory,
  searchQuery,
  onSearchChange,
  onClear,
  onSearch,
  hasActiveFilters,
}: KolFilterBarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Language: true,
    Ecosystem: true,
    user_type: true,
  })

  const totalActive = Object.values(selectedCategories).reduce(
    (sum, arr) => sum + arr.length,
    0
  )

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search KOLs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Button size="sm" onClick={onSearch} className="shrink-0">
          Search
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground shrink-0"
          >
            <X className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      {Object.entries(KOL_CATEGORIES).map(([category, values]) => {
        const isExpanded = expandedSections[category]
        const selectedCount = (selectedCategories[category] ?? []).length

        return (
          <div key={category} className="space-y-1.5">
            <button
              onClick={() => toggleSection(category)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {CATEGORY_LABELS[category] ?? category}
              {selectedCount > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full h-4 w-4 text-[10px] flex items-center justify-center ml-1">
                  {selectedCount}
                </span>
              )}
            </button>

            {isExpanded && (
              <div className="flex gap-1.5 flex-wrap pl-4">
                {values.map((value) => {
                  const isSelected = (selectedCategories[category] ?? []).includes(value)
                  return (
                    <Badge
                      key={value}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer text-xs transition-colors",
                        isSelected && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => onToggleCategory(category, value)}
                    >
                      {value}
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {totalActive > 0 && (
        <p className="text-xs text-muted-foreground">
          {totalActive} filter{totalActive !== 1 ? "s" : ""} active — press Search or Enter to apply
        </p>
      )}
    </div>
  )
}
