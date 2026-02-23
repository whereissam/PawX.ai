import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { KolFilterBar } from "@/components/kol/kol-filter-bar"
import { KolGrid } from "@/components/kol/kol-grid"
import { KolDetailDrawer } from "@/components/kol/kol-detail-drawer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useKolFilter } from "@/hooks/use-kol-filter"
import { useKolSelection } from "@/hooks/use-kol-selection"
import { ArrowRight, Search, Loader2 } from "lucide-react"
import type { KolUser } from "@/types"

function KolDirectoryPage() {
  const {
    selectedCategories,
    searchQuery,
    searchApplied,
    filteredKols,
    isLoading,
    error,
    hasActiveFilters,
    toggleCategory,
    setSearchQuery,
    applySearch,
    clearFilters,
  } = useKolFilter()

  const {
    selectedKolIds,
    toggleKolSelection,
    clearSelection,
  } = useKolSelection()

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
          <img src="/pawa-logo.svg" alt="PawX.ai" className="h-8 w-8 sm:h-10 sm:w-10" />
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
              Ready for configuration
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
              <Link to="/configure">
                <Button size="sm" className="gap-1.5 text-xs">
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 sm:mb-6">
          <KolFilterBar
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={clearFilters}
            onSearch={applySearch}
            hasActiveFilters={hasActiveFilters}
            isSearching={isLoading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 mb-4 bg-red-500/10 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Filtering KOLs...</p>
          </div>
        )}

        {/* KOL Grid - only shown after search */}
        {!isLoading && searchApplied ? (
          <>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredKols.length} KOLs found
              </p>
            </div>
            <KolGrid
              kols={filteredKols}
              selectedKolIds={selectedKolIds}
              onToggleSelect={toggleKolSelection}
              onViewDetail={handleViewDetail}
            />
          </>
        ) : !isLoading ? (
          <div className="text-center py-16 sm:py-24 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm font-medium">Select categories and press Search</p>
            <p className="text-xs mt-1">
              Choose filters above and hit Enter or the Search button to find KOLs
            </p>
          </div>
        ) : null}
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
