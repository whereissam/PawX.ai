import { useState, useCallback } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InteractionFeed } from "@/components/interact/interaction-feed"
import {
  Play,
  Square,
  Wifi,
  WifiOff,
  Radio,
  AlertCircle,
  Settings,
  ChevronDown,
  Users,
} from "lucide-react"
import { useWebSocket } from "@/hooks/use-websocket"
import { useKolSelection } from "@/hooks/use-kol-selection"
import { useInteractionConfig } from "@/hooks/use-interaction-config"

function InteractPage() {
  const { selectedKols } = useKolSelection()
  const { config, isConfigured } = useInteractionConfig()

  const [isRunning, setIsRunning] = useState(false)

  // On WS open, subscribe only KOLs not already subscribed server-side
  const subscribeNewKols = useCallback((send: (data: unknown) => void) => {
    for (const kol of selectedKols) {
      send({ type: "subscribe", twitterUsername: kol.screenName })
    }
  }, [selectedKols])

  const {
    status: wsStatus,
    messages: wsMessages,
    subscribedUsers,
    subscriptionCount,
    subscriptionLimit,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  } = useWebSocket({ onOpen: subscribeNewKols })

  const handleStart = useCallback(() => {
    connect()
    setIsRunning(true)
  }, [connect])

  const handleStop = useCallback(() => {
    disconnect()
    setIsRunning(false)
  }, [disconnect])

  const statusConfig = {
    disconnected: { icon: WifiOff, label: "Offline", color: "text-muted-foreground" },
    connecting: { icon: Wifi, label: "Connecting...", color: "text-yellow-600" },
    connected: { icon: Wifi, label: "Connected", color: "text-green-600" },
    error: { icon: AlertCircle, label: "Error", color: "text-red-600" },
  }

  const currentStatus = statusConfig[wsStatus]
  const StatusIcon = currentStatus.icon

  // Show WS subscribed users when connected, otherwise show locally selected KOLs
  const displayUsers = subscribedUsers.length > 0 ? subscribedUsers : selectedKols
  const displayCount = subscribedUsers.length > 0 ? subscriptionCount : selectedKols.length

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Monitor</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Watching {displayCount} account{displayCount !== 1 ? "s" : ""} for new tweets
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
                {displayCount > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium hover:bg-primary/90 transition-colors">
                        <Users className="h-3 w-3" />
                        {displayCount}{subscriptionLimit > 0 ? `/${subscriptionLimit}` : ""} subscribed
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 p-2 max-h-80 overflow-y-auto">
                      <p className="text-xs font-medium text-muted-foreground px-2 pb-2">
                        {displayCount} subscribed account{displayCount !== 1 ? "s" : ""}
                        {subscriptionLimit > 0 && ` (limit ${subscriptionLimit})`}
                      </p>
                      {displayUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors"
                        >
                          <a
                            href={`https://x.com/${user.screenName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 min-w-0 flex-1"
                          >
                            <Avatar className="h-7 w-7 shrink-0">
                              <AvatarImage
                                src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`}
                                alt={user.name}
                              />
                              <AvatarFallback className="text-[10px]">
                                {user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">@{user.screenName}</p>
                            </div>
                          </a>
                          {isRunning && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                sendMessage({ type: "unsubscribe", twitterUsername: user.screenName })
                              }}
                              className="text-[10px] text-muted-foreground hover:text-destructive shrink-0 px-1"
                              title="Unsubscribe"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

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
          <h2 className="font-semibold text-sm sm:text-base">
            Interaction Feed
            {wsMessages.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({wsMessages.length} message{wsMessages.length !== 1 ? "s" : ""})
              </span>
            )}
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
          pastInteractions={[]}
        />
      </div>
    </div>
  )
}

export const Route = createFileRoute("/interact")({
  component: InteractPage,
})
