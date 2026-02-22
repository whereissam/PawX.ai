import { useState, useCallback } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LinkedInSearchForm } from "@/components/outreach/linkedin-search-form"
import { LinkedInSearchResults } from "@/components/outreach/linkedin-search-results"
import { LinkedInProfileCard } from "@/components/outreach/linkedin-profile-card"
import { searchLinkedIn, enrichProfiles } from "@/lib/api"
import { ArrowLeft, Linkedin } from "lucide-react"
import type {
  LinkedInSearchParams,
  SearchResult,
  LinkedInProfile,
} from "@/types"

function OutreachPage() {
  // Search state
  const [searchItems, setSearchItems] = useState<SearchResult[]>([])
  const [searchUsernames, setSearchUsernames] = useState<(string | null)[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Selection state
  const [selectedUsernames, setSelectedUsernames] = useState<Set<string>>(
    new Set()
  )

  // Enrich state
  const [enrichedProfiles, setEnrichedProfiles] = useState<LinkedInProfile[]>(
    []
  )
  const [isEnriching, setIsEnriching] = useState(false)
  const [enrichError, setEnrichError] = useState<string | null>(null)

  const handleSearch = useCallback(async (params: LinkedInSearchParams) => {
    setIsSearching(true)
    setSearchError(null)
    setHasSearched(true)
    setEnrichedProfiles([])
    setSelectedUsernames(new Set())

    try {
      const result = await searchLinkedIn(params)
      setSearchItems(result.items)
      setSearchUsernames(result.usernames)
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : "Search failed. Please try again."
      )
      setSearchItems([])
      setSearchUsernames([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleToggleUsername = useCallback((username: string) => {
    setSelectedUsernames((prev) => {
      const next = new Set(prev)
      if (next.has(username)) {
        next.delete(username)
      } else if (next.size < 3) {
        next.add(username)
      }
      return next
    })
  }, [])

  const handleEnrich = useCallback(async () => {
    const usernames = Array.from(selectedUsernames)
    if (usernames.length === 0) return

    setIsEnriching(true)
    setEnrichError(null)

    try {
      const profiles = await enrichProfiles(usernames)
      setEnrichedProfiles(profiles)
    } catch (err) {
      setEnrichError(
        err instanceof Error
          ? err.message
          : "Failed to enrich profiles. Please try again."
      )
    } finally {
      setIsEnriching(false)
    }
  }, [selectedUsernames])

  const handleBackToSearch = () => {
    setEnrichedProfiles([])
  }

  const showEnrichedView = enrichedProfiles.length > 0

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {showEnrichedView && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleBackToSearch}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Outreach</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {showEnrichedView
                ? "Enriched LinkedIn profiles"
                : "Search and enrich LinkedIn profiles"}
            </p>
          </div>
        </div>

        {showEnrichedView ? (
          /* Step 2: Enriched Profile View */
          <div className="space-y-4">
            {enrichedProfiles.map((profile) => (
              <LinkedInProfileCard key={profile.username} profile={profile} />
            ))}
          </div>
        ) : (
          /* Step 1: Search & Select */
          <div className="space-y-6">
            {/* Search Form */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                  <h2 className="font-semibold text-base">
                    LinkedIn People Search
                  </h2>
                </div>
                <LinkedInSearchForm
                  onSearch={handleSearch}
                  isLoading={isSearching}
                />
              </CardContent>
            </Card>

            {/* Error */}
            {searchError && (
              <div className="p-3 bg-red-500/10 rounded-lg">
                <p className="text-sm text-red-700">{searchError}</p>
              </div>
            )}

            {enrichError && (
              <div className="p-3 bg-red-500/10 rounded-lg">
                <p className="text-sm text-red-700">{enrichError}</p>
              </div>
            )}

            {/* Results */}
            {hasSearched && !isSearching && searchItems.length > 0 && (
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <LinkedInSearchResults
                    items={searchItems}
                    usernames={searchUsernames}
                    selectedUsernames={selectedUsernames}
                    onToggle={handleToggleUsername}
                    onEnrich={handleEnrich}
                    isEnriching={isEnriching}
                  />
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {hasSearched && !isSearching && searchItems.length === 0 && !searchError && (
              <div className="text-center py-12 text-muted-foreground">
                <Linkedin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs mt-1">
                  Try different search terms
                </p>
              </div>
            )}

            {/* Initial state */}
            {!hasSearched && (
              <div className="text-center py-16 text-muted-foreground">
                <Linkedin className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">
                  Search for LinkedIn profiles
                </p>
                <p className="text-xs mt-1">
                  Enter a job title to start searching. Select up to 3 profiles
                  to enrich.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/outreach")({
  component: OutreachPage,
})
