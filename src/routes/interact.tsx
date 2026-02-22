import { useState, useCallback } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InteractionFeed } from "@/components/interact/interaction-feed"
import {
  Play,
  Square,
  Wifi,
  WifiOff,
  Radio,
  AlertCircle,
  Settings,
} from "lucide-react"
import { mockInteractions } from "@/data/tweets"
import { wsSubscribe, wsUnsubscribe } from "@/lib/api"
import { useWebSocket } from "@/hooks/use-websocket"
import { useKolSelection } from "@/hooks/use-kol-selection"
import { useInteractionConfig } from "@/hooks/use-interaction-config"

function InteractPage() {
  const { selectedKols } = useKolSelection()
  const { config, isConfigured } = useInteractionConfig()

  const [isRunning, setIsRunning] = useState(false)
  const [subscribeError, setSubscribeError] = useState<string | null>(null)

  const {
    status: wsStatus,
    messages: wsMessages,
    connect,
    disconnect,
    clearMessages,
  } = useWebSocket()

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
    disconnected: { icon: WifiOff, label: "Offline", color: "text-muted-foreground" },
    connecting: { icon: Wifi, label: "Connecting...", color: "text-yellow-600" },
    connected: { icon: Wifi, label: "Connected", color: "text-green-600" },
    error: { icon: AlertCircle, label: "Error", color: "text-red-600" },
  }

  const currentStatus = statusConfig[wsStatus]
  const StatusIcon = currentStatus.icon

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Monitor</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Watching {selectedKols.length} account{selectedKols.length !== 1 ? "s" : ""} for new tweets
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <StatusIcon className={`h-4 w-4 ${currentStatus.color}`} />
              <span className={`text-xs font-medium ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
            <Link to="/configure">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                Configure
              </Button>
            </Link>
          </div>
        </div>

        {/* Controls bar */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Button
                  variant={isRunning ? "destructive" : "default"}
                  onClick={isRunning ? handleStop : handleStart}
                  disabled={selectedKols.length === 0}
                  className="gap-2"
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
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-xs text-green-700 font-medium">Live</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {isConfigured && config.stylePrompt && (
                  <Badge variant="secondary" className="text-xs">
                    Style: {config.presetStyle ?? config.styleMode}
                  </Badge>
                )}
                {config.replyCondition === "conditional" && (
                  <Badge variant="outline" className="text-xs">
                    Conditional replies
                  </Badge>
                )}
                {selectedKols.length > 0 && (
                  <Badge variant="default" className="text-xs">
                    {selectedKols.length} KOL{selectedKols.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>

            {subscribeError && (
              <div className="flex items-center gap-2 p-2 mt-3 bg-red-500/10 rounded-lg">
                <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                <p className="text-xs text-red-700">{subscribeError}</p>
              </div>
            )}

            {!isRunning && selectedKols.length === 0 && (
              <div className="mt-3 text-center">
                <p className="text-xs text-muted-foreground">
                  No KOLs selected.{" "}
                  <Link to="/" className="text-primary hover:underline">
                    Go to Directory
                  </Link>{" "}
                  to select accounts.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feed header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="font-semibold text-sm sm:text-base">Interaction Feed</h2>
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
                <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">Listening...</span>
              </div>
            )}
          </div>
        </div>

        {/* Full-width feed */}
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
  )
}

export const Route = createFileRoute("/interact")({
  component: InteractPage,
})
