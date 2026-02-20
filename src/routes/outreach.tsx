import { useState, useMemo, useCallback } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { OutreachForm } from "@/components/outreach/outreach-form"
import { TargetSearch } from "@/components/outreach/target-search"
import { CampaignList } from "@/components/outreach/campaign-list"
import { kols } from "@/data/kols"
import type { FilterState, OutreachCampaign } from "@/types"

function OutreachPage() {
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    searchQuery: "",
  })

  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([
    {
      id: "demo-1",
      name: "Elon Musk Engagement Campaign",
      template: "Hey {{name}}, love your work on {{topic}}. Would love to explore a partnership for our upcoming launch.",
      targetFilters: { tags: ["Elon Musk"], searchQuery: "" },
      targets: kols.filter((k) => k.tags.includes("Elon Musk")),
      status: "sending",
      sentCount: 1,
      totalCount: 1,
      createdAt: "2026-02-19T10:00:00Z",
    },
    {
      id: "demo-2",
      name: "CZ Outreach",
      template: "Hi {{name}}, we're building in the crypto space and would love to chat about your experience.",
      targetFilters: { tags: ["CZ"], searchQuery: "" },
      targets: kols.filter((k) => k.tags.includes("CZ")),
      status: "completed",
      sentCount: 1,
      totalCount: 1,
      createdAt: "2026-02-18T14:00:00Z",
    },
  ])

  const filteredKols = useMemo(() => {
    return kols.filter((kol) => {
      if (
        filters.tags.length > 0 &&
        !filters.tags.some((t) => kol.tags.includes(t))
      )
        return false
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
                  onToggleTag={toggleTag}
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
