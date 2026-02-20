import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { PawXLogo } from "@/components/logo"
import { KolFilterBar } from "@/components/kol/kol-filter-bar"
import { KolGrid } from "@/components/kol/kol-grid"
import { KolDetailDrawer } from "@/components/kol/kol-detail-drawer"
import { CategorySummary } from "@/components/kol/category-summary"
import { Badge } from "@/components/ui/badge"
import { useKolFilter } from "@/hooks/use-kol-filter"
import type { KolUser } from "@/types"

function KolDirectoryPage() {
  const {
    filters,
    filteredKols,
    selectedKolIds,
    hasActiveFilters,
    toggleTag,
    setSearchQuery,
    clearFilters,
    toggleKolSelection,
    clearSelection,
  } = useKolFilter()

  const [detailKol, setDetailKol] = useState<KolUser | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleViewDetail = (kol: KolUser) => {
    setDetailKol(kol)
    setDrawerOpen(true)
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
          <PawXLogo className="h-8 w-8 sm:h-10 sm:w-10" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">KOL Directory</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Discover and engage with crypto KOLs across ecosystems
            </p>
          </div>
        </div>

        {/* Selection bar */}
        {selectedKolIds.size > 0 && (
          <div className="flex items-center gap-2 mb-4 p-2.5 sm:p-3 bg-surface shadow-raised-sm rounded-lg flex-wrap">
            <Badge variant="default">{selectedKolIds.size} selected</Badge>
            <span className="text-xs sm:text-sm text-muted-foreground">
              Ready for interaction
            </span>
            <button
              onClick={clearSelection}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 sm:mb-6">
          <KolFilterBar
            filters={filters}
            onToggleTag={toggleTag}
            onSearchChange={setSearchQuery}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Category Summary */}
        <div className="mb-4 sm:mb-6">
          <CategorySummary activeTags={filters.tags} />
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredKols.length} KOLs found
          </p>
        </div>

        {/* KOL Grid */}
        <KolGrid
          kols={filteredKols}
          selectedKolIds={selectedKolIds}
          onToggleSelect={toggleKolSelection}
          onViewDetail={handleViewDetail}
        />
      </div>

      {/* Detail Drawer */}
      <KolDetailDrawer
        kol={detailKol}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        isSelected={detailKol ? selectedKolIds.has(detailKol.id) : false}
        onToggleSelect={toggleKolSelection}
      />
    </div>
  )
}

export const Route = createFileRoute("/")({
  component: KolDirectoryPage,
})
