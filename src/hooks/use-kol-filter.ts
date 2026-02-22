import { useState, useMemo, useCallback, useEffect } from "react"
import type { KolUser } from "@/types"
import { kols as mockKols } from "@/data/kols"
import { fetchKols } from "@/lib/api"

export function useKolFilter() {
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string[]>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [searchApplied, setSearchApplied] = useState(false)
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
    return () => {
      cancelled = true
    }
  }, [])

  const toggleCategory = useCallback((category: string, value: string) => {
    setSelectedCategories((prev) => {
      const current = prev[category] ?? []
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [category]: updated }
    })
  }, [])

  const setSearchQueryValue = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const applySearch = useCallback(() => {
    setSearchApplied(true)
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedCategories({})
    setSearchQuery("")
    setSearchApplied(false)
  }, [])

  const hasActiveFilters = useMemo(() => {
    const hasCategoryFilters = Object.values(selectedCategories).some(
      (arr) => arr.length > 0
    )
    return hasCategoryFilters || searchQuery.length > 0
  }, [selectedCategories, searchQuery])

  const filteredKols = useMemo(() => {
    return kols.filter((kol) => {
      // Category filtering: check if KOL tags match any selected category values
      for (const [, values] of Object.entries(selectedCategories)) {
        if (values.length > 0) {
          const hasMatch = values.some((v) =>
            kol.tags.some((t) => t.toLowerCase().includes(v.toLowerCase()))
          )
          if (!hasMatch) return false
        }
      }

      // Text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          kol.name.toLowerCase().includes(q) ||
          kol.screenName.toLowerCase().includes(q) ||
          kol.description.toLowerCase().includes(q) ||
          kol.tags.some((t) => t.toLowerCase().includes(q))
        )
      }

      return true
    })
  }, [selectedCategories, searchQuery, kols])

  return {
    selectedCategories,
    searchQuery,
    searchApplied,
    filteredKols,
    isLoading,
    hasActiveFilters,
    toggleCategory,
    setSearchQuery: setSearchQueryValue,
    applySearch,
    clearFilters,
  }
}
