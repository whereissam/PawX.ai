import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Users } from "lucide-react"
import type { KolUser } from "@/types"

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

interface KolSelectorProps {
  selectedKols: KolUser[]
  onRemove: (id: string) => void
  onClearAll: () => void
}

export function KolSelector({ selectedKols, onRemove, onClearAll }: KolSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Selected KOLs ({selectedKols.length})</h3>
        {selectedKols.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs h-7">
            Clear all
          </Button>
        )}
      </div>

      {selectedKols.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No KOLs selected</p>
          <p className="text-xs mt-1">Go to KOL Directory to select KOLs</p>
        </div>
      ) : (
        <ScrollArea className="h-[200px] sm:h-[250px] lg:h-[300px]">
          <div className="space-y-2 pr-3">
            {selectedKols.map((kol) => (
              <div
                key={kol.id}
                className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-md bg-surface-2/60 group"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${kol.screenName}`} alt={kol.name} />
                  <AvatarFallback>{kol.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{kol.name}</p>
                  <p className="text-xs text-muted-foreground">
                    @{kol.screenName} · {formatNumber(kol.followersCount)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemove(kol.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
