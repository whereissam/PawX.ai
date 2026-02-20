import { KolCard } from "./kol-card"
import type { KolUser } from "@/types"

interface KolGridProps {
  kols: KolUser[]
  selectedKolIds: Set<string>
  onToggleSelect: (id: string) => void
  onViewDetail: (kol: KolUser) => void
}

export function KolGrid({ kols, selectedKolIds, onToggleSelect, onViewDetail }: KolGridProps) {
  if (kols.length === 0) {
    return (
      <div className="text-center py-10 sm:py-16">
        <p className="text-muted-foreground text-base sm:text-lg">No KOLs match your filters</p>
        <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or filter criteria</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {kols.map((kol) => (
        <KolCard
          key={kol.id}
          kol={kol}
          isSelected={selectedKolIds.has(kol.id)}
          onToggleSelect={onToggleSelect}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  )
}
