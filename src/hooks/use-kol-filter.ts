import { useState, useMemo, useCallback } from "react"
import type { KolUser } from "@/types"
import { filterKols, mapFilterResultToKolUser, getTweetsInfo } from "@/lib/api"

export function useKolFilter() {
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string[]>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [searchApplied, setSearchApplied] = useState(false)
  const [filteredKols, setFilteredKols] = useState<KolUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const applySearch = useCallback(async () => {
    const languageTags = selectedCategories.language_tags ?? []
    const ecosystemTags = selectedCategories.ecosystem_tags ?? []
    const userTypeTags = selectedCategories.user_type_tags ?? []

    // Need at least one filter selected
    if (languageTags.length === 0 && ecosystemTags.length === 0 && userTypeTags.length === 0 && !searchQuery.trim()) {
      return
    }

    setIsLoading(true)
    setError(null)
    setSearchApplied(true)

    try {
      const results = await filterKols({
        language_tags: languageTags,
        ecosystem_tags: ecosystemTags,
        user_type_tags: userTypeTags,
      })

      let kols = results.map(mapFilterResultToKolUser)

      // Fetch profile images from tweets_info API (response includes user data)
      const screenNames = kols.map((k) => k.screenName)
      if (screenNames.length > 0) {
        try {
          const tweetsData = await getTweetsInfo(screenNames)
          const profileMap = new Map<string, typeof tweetsData[number]["user"]>()
          for (const item of tweetsData) {
            if (item.user?.screenName) {
              profileMap.set(item.user.screenName.toLowerCase(), item.user)
            }
          }
          kols = kols.map((kol) => {
            const profile = profileMap.get(kol.screenName.toLowerCase())
            if (profile?.profileImageUrlHttps) {
              return {
                ...kol,
                name: profile.name || kol.name,
                profileImageUrlHttps: profile.profileImageUrlHttps,
              }
            }
            return kol
          })
        } catch {
          // Profile images are non-critical, continue without them
        }
      }

      // Client-side text search on top of API results
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        kols = kols.filter(
          (kol) =>
            kol.name.toLowerCase().includes(q) ||
            kol.screenName.toLowerCase().includes(q) ||
            kol.description.toLowerCase().includes(q) ||
            kol.tags.some((t) => t.toLowerCase().includes(q))
        )
      }

      setFilteredKols(kols)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter KOLs")
      setFilteredKols([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategories, searchQuery])

  const clearFilters = useCallback(() => {
    setSelectedCategories({})
    setSearchQuery("")
    setSearchApplied(false)
    setFilteredKols([])
    setError(null)
  }, [])

  const hasActiveFilters = useMemo(() => {
    const hasCategoryFilters = Object.values(selectedCategories).some(
      (arr) => arr.length > 0
    )
    return hasCategoryFilters || searchQuery.length > 0
  }, [selectedCategories, searchQuery])

  return {
    selectedCategories,
    searchQuery,
    searchApplied,
    filteredKols,
    isLoading,
    error,
    hasActiveFilters,
    toggleCategory,
    setSearchQuery: setSearchQueryValue,
    applySearch,
    clearFilters,
  }
}
