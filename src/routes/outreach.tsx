import { useState, useMemo, useCallback } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { OutreachForm } from "@/components/outreach/outreach-form"
import { TargetSearch } from "@/components/outreach/target-search"
import { CampaignList } from "@/components/outreach/campaign-list"
import { kols } from "@/data/kols"
import type { FilterState, LanguageTag, EcosystemTag, UserTypeTag, OutreachCampaign } from "@/types"

function OutreachPage() {
  const [filters, setFilters] = useState<FilterState>({
    languages: [],
    ecosystems: [],
    userTypes: [],
    searchQuery: "",
  })

  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([
    {
      id: "demo-1",
      name: "Ethereum DeFi KOL Partnerships",
      template: "Hey {{name}}, love your work on {{ecosystem}}. Would love to explore a partnership for our upcoming launch.",
      targetFilters: { languages: [], ecosystems: ["ethereum"], userTypes: ["influencer"], searchQuery: "" },
      targets: kols.filter((k) => k.ecosystems.includes("ethereum")).slice(0, 8),
      status: "sending",
      sentCount: 5,
      totalCount: 8,
      createdAt: "2026-02-19T10:00:00Z",
    },
    {
      id: "demo-2",
      name: "Solana Builder Outreach",
      template: "Hi {{name}}, we're building on Solana and would love to chat about your experience in the ecosystem.",
      targetFilters: { languages: [], ecosystems: ["solana"], userTypes: ["developer"], searchQuery: "" },
      targets: kols.filter((k) => k.ecosystems.includes("solana")).slice(0, 5),
      status: "completed",
      sentCount: 5,
      totalCount: 5,
      createdAt: "2026-02-18T14:00:00Z",
    },
  ])

  const filteredKols = useMemo(() => {
    return kols.filter((kol) => {
      if (
        filters.languages.length > 0 &&
        !filters.languages.some((l) => kol.languages.includes(l))
      )
        return false
      if (
        filters.ecosystems.length > 0 &&
        !filters.ecosystems.some((e) => kol.ecosystems.includes(e))
      )
        return false
      if (
        filters.userTypes.length > 0 &&
        !filters.userTypes.some((t) => kol.userTypes.includes(t))
      )
        return false
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

  const handleCreateCampaign = (name: string, template: string) => {
    const newCampaign: OutreachCampaign = {
      id: `camp-${Date.now()}`,
      name,
      template,
      targetFilters: { ...filters },
      targets: filteredKols,
      status: "draft",
      sentCount: 0,
      totalCount: filteredKols.length,
      createdAt: new Date().toISOString(),
    }
    setCampaigns((prev) => [newCampaign, ...prev])
  }

  const handleSendCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "sending" as const } : c))
    )
    let sent = 0
    const campaign = campaigns.find((c) => c.id === id)
    if (!campaign) return
    const total = campaign.totalCount
    const interval = setInterval(() => {
      sent++
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          if (sent >= total) {
            clearInterval(interval)
            return { ...c, sentCount: total, status: "completed" as const }
          }
          return { ...c, sentCount: sent }
        })
      )
    }, 800)
  }

  const handleDeleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-background text-muted-foreground">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">BD Outreach</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Create and manage cold outreach campaigns to KOLs
          </p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left panel */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <TargetSearch
                  filters={filters}
                  onToggleLanguage={toggleLanguage}
                  onToggleEcosystem={toggleEcosystem}
                  onToggleUserType={toggleUserType}
                  onSearchChange={setSearchQuery}
                  matchCount={filteredKols.length}
                />
              </CardContent>
            </Card>

            <OutreachForm onCreateCampaign={handleCreateCampaign} />
          </div>

          {/* Right panel */}
          <div className="lg:col-span-7">
            <h2 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Campaigns</h2>
            <Separator className="mb-3 sm:mb-4" />
            <CampaignList
              campaigns={campaigns}
              onSend={handleSendCampaign}
              onDelete={handleDeleteCampaign}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/outreach")({
  component: OutreachPage,
})
