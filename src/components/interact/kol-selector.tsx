import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Users, Plus } from "lucide-react"
import { Link } from "@tanstack/react-router"
import type { KolUser } from "@/types"

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "0"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

interface KolSelectorProps {
  selectedKols: KolUser[]
  onRemove: (id: string) => void
  onClearAll: () => void
  disabled?: boolean
}

export function KolSelector({ selectedKols, onRemove, onClearAll, disabled = false }: KolSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          Monitoring ({selectedKols.length})
        </h3>
        {selectedKols.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs h-7"
            disabled={disabled}
          >
            Clear all
          </Button>
        )}
      </div>

      {selectedKols.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">No accounts selected</p>
          <p className="text-xs mt-1 mb-3">Select accounts to auto-interact with</p>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Browse KOL Directory
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <ScrollArea className="h-[180px] sm:h-[220px] lg:h-[280px]">
            <div className="space-y-1.5 pr-3">
              {selectedKols.map((kol) => (
                <div
                  key={kol.id}
                  className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg bg-surface-2/50 group transition-all duration-150"
                >
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarImage
                      src={kol.profileImageUrlHttps?.replace("_normal", "_bigger") ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${kol.screenName}`}
                      alt={kol.name}
                    />
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
                    className="h-6 w-6 shrink-0 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemove(kol.id)}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add more from Directory
            </Button>
          </Link>
        </>
      )}
    </div>
  )
}
