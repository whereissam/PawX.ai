import { useState, useMemo, useCallback } from "react"
import type { FilterState, LanguageTag, EcosystemTag, UserTypeTag } from "@/types"
import { kols } from "@/data/kols"

const initialFilter: FilterState = {
  languages: [],
  ecosystems: [],
  userTypes: [],
  searchQuery: "",
}

export function useKolFilter() {
  const [filters, setFilters] = useState<FilterState>(initialFilter)
  const [selectedKolIds, setSelectedKolIds] = useState<Set<string>>(new Set())

  const toggleLanguage = useCallback((lang: LanguageTag) => {
    setFilters((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }))
  }, [])

  const toggleEcosystem = useCallback((eco: EcosystemTag) => {
    setFilters((prev) => ({
      ...prev,
      ecosystems: prev.ecosystems.includes(eco)
        ? prev.ecosystems.filter((e) => e !== eco)
        : [...prev.ecosystems, eco],
    }))
  }, [])

  const toggleUserType = useCallback((type: UserTypeTag) => {
    setFilters((prev) => ({
      ...prev,
      userTypes: prev.userTypes.includes(type)
        ? prev.userTypes.filter((t) => t !== type)
        : [...prev.userTypes, type],
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
        filters.languages.length > 0 &&
        !filters.languages.some((l) => kol.languages.includes(l))
      ) {
        return false
      }
      if (
        filters.ecosystems.length > 0 &&
        !filters.ecosystems.some((e) => kol.ecosystems.includes(e))
      ) {
        return false
      }
      if (
        filters.userTypes.length > 0 &&
        !filters.userTypes.some((t) => kol.userTypes.includes(t))
      ) {
        return false
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        return (
          kol.displayName.toLowerCase().includes(q) ||
          kol.handle.toLowerCase().includes(q) ||
          kol.bio.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [filters])

  const selectedKols = useMemo(() => {
    return kols.filter((kol) => selectedKolIds.has(kol.id))
  }, [selectedKolIds])

  const hasActiveFilters =
    filters.languages.length > 0 ||
    filters.ecosystems.length > 0 ||
    filters.userTypes.length > 0 ||
    filters.searchQuery.length > 0

  return {
    filters,
    filteredKols,
    selectedKolIds,
    selectedKols,
    hasActiveFilters,
    toggleLanguage,
    toggleEcosystem,
    toggleUserType,
    setSearchQuery,
    clearFilters,
    toggleKolSelection,
    clearSelection,
  }
}
