import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { KOL_TAGS } from "@/data/tags"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FilterState } from "@/types"

interface TargetSearchProps {
  filters: FilterState
  onToggleTag: (tag: string) => void
  onSearchChange: (query: string) => void
  matchCount: number
}

export function TargetSearch({
  filters,
  onToggleTag,
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
          <span className="text-xs text-muted-foreground sm:w-14 shrink-0">Tags</span>
          <div className="flex gap-1.5 flex-wrap">
            {KOL_TAGS.map((tag) => (
              <Badge
                key={tag.value}
                variant={filters.tags.includes(tag.value) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs",
                  filters.tags.includes(tag.value) && "bg-primary text-primary-foreground"
                )}
                onClick={() => onToggleTag(tag.value)}
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
