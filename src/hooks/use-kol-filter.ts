import { useState, useMemo, useCallback } from "react"
import type { FilterState } from "@/types"
import { kols } from "@/data/kols"

const initialFilter: FilterState = {
  tags: [],
  searchQuery: "",
}

export function useKolFilter() {
  const [filters, setFilters] = useState<FilterState>(initialFilter)
  const [selectedKolIds, setSelectedKolIds] = useState<Set<string>>(new Set())

  const toggleTag = useCallback((tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(initialFilter)
  }, [])

  const toggleKolSelection = useCallback((kolId: string) => {
    setSelectedKolIds((prev) => {
      const next = new Set(prev)
      if (next.has(kolId)) {
        next.delete(kolId)
      } else {
        next.add(kolId)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedKolIds(new Set())
  }, [])

  const filteredKols = useMemo(() => {
    return kols.filter((kol) => {
      if (
        filters.tags.length > 0 &&
        !filters.tags.some((t) => kol.tags.includes(t))
      ) {
        return false
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        return (
          kol.name.toLowerCase().includes(q) ||
          kol.screenName.toLowerCase().includes(q) ||
          kol.description.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [filters])

  const selectedKols = useMemo(() => {
    return kols.filter((kol) => selectedKolIds.has(kol.id))
  }, [selectedKolIds])

  const hasActiveFilters =
    filters.tags.length > 0 ||
    filters.searchQuery.length > 0

  return {
    filters,
    filteredKols,
    selectedKolIds,
    selectedKols,
    hasActiveFilters,
    toggleTag,
    setSearchQuery,
    clearFilters,
    toggleKolSelection,
    clearSelection,
  }
}
