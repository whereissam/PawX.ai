import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KolSelector } from "@/components/interact/kol-selector"
import { StyleAnalyzer } from "@/components/interact/style-analyzer"
import { InteractionFeed } from "@/components/interact/interaction-feed"
import { Play, Square } from "lucide-react"
import { kols } from "@/data/kols"
import type { KolUser } from "@/types"

function InteractPage() {
  const [selectedKols, setSelectedKols] = useState<KolUser[]>(() => kols.slice(0, 2))
  const [isRunning, setIsRunning] = useState(false)

  const handleRemove = (id: string) => {
    setSelectedKols((prev) => prev.filter((k) => k.id !== id))
  }

  const handleClearAll = () => {
    setSelectedKols([])
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">KOL Interaction</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Auto-reply to KOL tweets with AI-generated responses
          </p>
        </div>

        {/* Mobile: controls first, then feed */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Sidebar / Controls */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6 order-1 lg:order-1">
            {/* Controls card - shown first on mobile for quick action */}
            <Card>
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-medium text-sm mb-3">Interaction Controls</h3>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant={isRunning ? "destructive" : "default"}
                    onClick={() => setIsRunning(!isRunning)}
                    disabled={selectedKols.length === 0}
                  >
                    {isRunning ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Stop Interaction
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Interaction
                      </>
                    )}
                  </Button>
                  {isRunning && (
                    <p className="text-xs text-center text-muted-foreground">
                      Monitoring {selectedKols.length} KOLs for new tweets...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <KolSelector
                  selectedKols={selectedKols}
                  onRemove={handleRemove}
                  onClearAll={handleClearAll}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <StyleAnalyzer />
              </CardContent>
            </Card>
          </div>

          {/* Main feed */}
          <div className="lg:col-span-8 order-2 lg:order-2">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="font-semibold text-sm sm:text-base">Interaction Feed</h2>
              {isRunning && (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              )}
            </div>
            <InteractionFeed selectedKols={selectedKols} />
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/interact")({
  component: InteractPage,
})
