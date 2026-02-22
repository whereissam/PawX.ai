import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Linkedin, ExternalLink, Loader2, Sparkles } from "lucide-react"
import type { SearchResult } from "@/types"

interface LinkedInSearchResultsProps {
  items: SearchResult[]
  usernames: (string | null)[]
  selectedUsernames: Set<string>
  onToggle: (username: string) => void
  onEnrich: () => void
  isEnriching: boolean
}

export function LinkedInSearchResults({
  items,
  usernames,
  selectedUsernames,
  onToggle,
  onEnrich,
  isEnriching,
}: LinkedInSearchResultsProps) {
  const maxSelection = 3

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} result{items.length !== 1 ? "s" : ""} found
        </p>
        {selectedUsernames.size > 0 && (
          <Badge variant="default" className="text-xs">
            {selectedUsernames.size} / {maxSelection} selected
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item, index) => {
          const username = usernames[index]
          if (!username) return null

          const isSelected = selectedUsernames.has(username)
          const isDisabled =
            !isSelected && selectedUsernames.size >= maxSelection

          return (
            <Card
              key={`${username}-${index}`}
              className={`transition-all cursor-pointer ${
                isSelected
                  ? "ring-1 ring-primary border-primary"
                  : isDisabled
                    ? "opacity-50"
                    : "hover:shadow-raised-sm"
              }`}
              onClick={() => !isDisabled && onToggle(username)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <Checkbox
                  checked={isSelected}
                  disabled={isDisabled}
                  onCheckedChange={() => onToggle(username)}
                  className="shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-[#0A66C2] shrink-0" />
                    <span className="font-medium text-sm truncate">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    @{username}
                  </p>
                </div>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Button
        onClick={onEnrich}
        disabled={selectedUsernames.size === 0 || isEnriching}
        className="w-full gap-2"
      >
        {isEnriching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Enrich Selected ({selectedUsernames.size})
      </Button>
    </div>
  )
}
