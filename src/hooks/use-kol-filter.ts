import { useState, useMemo, useCallback, useEffect } from "react"
import type { FilterState, KolUser } from "@/types"
import { kols as mockKols } from "@/data/kols"
import { fetchKols } from "@/lib/api"

const initialFilter: FilterState = {
  tags: [],
  searchQuery: "",
}

export function useKolFilter() {
  const [filters, setFilters] = useState<FilterState>(initialFilter)
  const [kols, setKols] = useState<KolUser[]>(mockKols)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      const data = await fetchKols()
      if (!cancelled) {
        setKols(data)
        setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

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
  }, [filters, kols])

  const hasActiveFilters =
    filters.tags.length > 0 ||
    filters.searchQuery.length > 0

  return {
    filters,
    filteredKols,
    isLoading,
    hasActiveFilters,
    toggleTag,
    setSearchQuery,
    clearFilters,
  }
}
