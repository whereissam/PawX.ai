import { useState, useCallback } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KolSelector } from "@/components/interact/kol-selector"
import { StyleAnalyzer } from "@/components/interact/style-analyzer"
import { InteractionFeed } from "@/components/interact/interaction-feed"
import {
  Play,
  Square,
  Wifi,
  WifiOff,
  Radio,
  AlertCircle,
} from "lucide-react"
import { mockInteractions, mockStyleProfiles } from "@/data/tweets"
import { wsSubscribe, wsUnsubscribe } from "@/lib/api"
import { useWebSocket } from "@/hooks/use-websocket"
import { useKolSelection } from "@/hooks/use-kol-selection"

function InteractPage() {
  const { selectedKols, removeKol, clearSelection } = useKolSelection()

  const [isRunning, setIsRunning] = useState(false)
  const [stylePrompt, setStylePrompt] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedStyle, setAnalyzedStyle] = useState<{
    tone: string
    topics: string[]
    samplePhrases: string[]
  } | null>(null)
  const [subscribeError, setSubscribeError] = useState<string | null>(null)

  const {
    status: wsStatus,
    messages: wsMessages,
    connect,
    disconnect,
    clearMessages,
  } = useWebSocket()

  const handleRemove = (id: string) => {
    if (isRunning) return
    removeKol(id)
  }

  const handleClearAll = () => {
    if (isRunning) return
    clearSelection()
  }

  const handleAnalyzeHandle = useCallback((_handle: string) => {
    setIsAnalyzing(true)
    setTimeout(() => {
      const mock = mockStyleProfiles[0]
      setAnalyzedStyle({
        tone: mock.tone,
        topics: mock.topics,
        samplePhrases: mock.samplePhrases,
      })
      setStylePrompt(
        `Reply in a ${mock.tone} tone. Focus on topics like ${mock.topics.join(", ")}. Use phrases similar to: "${mock.samplePhrases[0]}"`
      )
      setIsAnalyzing(false)
    }, 1500)
  }, [])

  const handleStart = useCallback(async () => {
    if (selectedKols.length === 0) return
    setSubscribeError(null)

    try {
      await Promise.all(
        selectedKols.map((kol) => wsSubscribe(kol.screenName))
      )
      connect()
      setIsRunning(true)
    } catch (err) {
      setSubscribeError(
        err instanceof Error ? err.message : "Failed to subscribe"
      )
    }
  }, [selectedKols, connect])

  const handleStop = useCallback(async () => {
    try {
      await Promise.all(
        selectedKols.map((kol) => wsUnsubscribe(kol.screenName))
      )
    } catch {
      // Best-effort unsubscribe
    }
    disconnect()
    setIsRunning(false)
  }, [selectedKols, disconnect])

  const statusConfig = {
    disconnected: {
      icon: WifiOff,
      label: "Offline",
      color: "text-muted-foreground",
    },
    connecting: {
      icon: Wifi,
      label: "Connecting...",
      color: "text-yellow-600",
    },
    connected: { icon: Wifi, label: "Connected", color: "text-green-600" },
    error: { icon: AlertCircle, label: "Error", color: "text-red-600" },
  }

  const currentStatus = statusConfig[wsStatus]
  const StatusIcon = currentStatus.icon

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Auto Interact</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Monitor accounts and auto-reply when they tweet
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${currentStatus.color}`} />
            <span className={`text-xs font-medium ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* ── Sidebar ── */}
          <div className="lg:col-span-4 space-y-4 order-1">
            {/* Controls */}
            <Card>
              <CardContent className="p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Controls</h3>
                  {isRunning && (
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                      </span>
                      <span className="text-xs text-green-700 font-medium">
                        Live
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full gap-2"
                  variant={isRunning ? "destructive" : "default"}
                  onClick={isRunning ? handleStop : handleStart}
                  disabled={selectedKols.length === 0}
                >
                  {isRunning ? (
                    <>
                      <Square className="h-4 w-4" />
                      Stop Monitoring
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Monitoring
                    </>
                  )}
                </Button>

                {isRunning && (
                  <div className="flex items-center gap-2 p-2 bg-surface-2/50 rounded-lg">
                    <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
                    <p className="text-xs text-muted-foreground">
                      Watching{" "}
                      <span className="font-semibold text-foreground">
                        {selectedKols.length}
                      </span>{" "}
                      account{selectedKols.length !== 1 && "s"} for new tweets
                    </p>
                  </div>
                )}

                {subscribeError && (
                  <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                    <p className="text-xs text-red-700">{subscribeError}</p>
                  </div>
                )}

                {!isRunning && !stylePrompt && selectedKols.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Set your reply style below before starting
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Selected KOLs */}
            <Card>
              <CardContent className="p-3 sm:p-4">
                <KolSelector
                  selectedKols={selectedKols}
                  onRemove={handleRemove}
                  onClearAll={handleClearAll}
                  disabled={isRunning}
                />
              </CardContent>
            </Card>

            {/* Style Configuration */}
            <Card>
              <CardContent className="p-3 sm:p-4">
                <StyleAnalyzer
                  stylePrompt={stylePrompt}
                  onStylePromptChange={setStylePrompt}
                  onAnalyzeHandle={handleAnalyzeHandle}
                  isAnalyzing={isAnalyzing}
                  analyzedStyle={analyzedStyle}
                />
              </CardContent>
            </Card>

            {/* Active style preview */}
            {stylePrompt && (
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm mb-2">Active Style</h3>
                  <div className="p-2.5 bg-surface-2/50 rounded-lg">
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-4">
                      {stylePrompt}
                    </p>
                  </div>
                  {isRunning && (
                    <Badge variant="default" className="mt-2 text-xs">
                      Applied to auto-replies
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Main Feed ── */}
          <div className="lg:col-span-8 order-2">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="font-semibold text-sm sm:text-base">
                Interaction Feed
              </h2>
              <div className="flex items-center gap-2">
                {wsMessages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearMessages}
                    className="text-xs h-7"
                  >
                    Clear
                  </Button>
                )}
                {isRunning && (
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                )}
              </div>
            </div>

            <InteractionFeed
              selectedKols={selectedKols}
              isRunning={isRunning}
              wsMessages={wsMessages}
              pastInteractions={
                isRunning
                  ? mockInteractions.filter((i) =>
                      selectedKols.some((k) => k.id === i.kolId)
                    )
                  : []
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/interact")({
  component: InteractPage,
})
