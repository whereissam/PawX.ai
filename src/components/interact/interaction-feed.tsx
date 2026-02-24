import { ReplyPreview } from "./reply-preview"
import { LiveTweetCard } from "./live-tweet-card"
import { Radio } from "lucide-react"
import type { KolUser } from "@/types"
import type { WsMessage } from "@/hooks/use-websocket"
import type { Interaction } from "@/types"

interface InteractionFeedProps {
  selectedKols: KolUser[]
  isRunning: boolean
  wsMessages: WsMessage[]
  pastInteractions: Interaction[]
}

export function InteractionFeed({
  selectedKols,
  isRunning,
  wsMessages,
  pastInteractions,
}: InteractionFeedProps) {
  if (!isRunning && wsMessages.length === 0 && pastInteractions.length === 0) {
    return (
      <div className="text-center py-10 sm:py-16 text-muted-foreground">
        <Radio className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium">Ready to interact</p>
        <p className="text-xs mt-1">
          Configure your style and hit Start to begin monitoring
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Live WebSocket messages */}
      {wsMessages.map((msg) => (
        <LiveTweetCard key={msg.id} message={msg} selectedKols={selectedKols} />
      ))}

      {/* Past interactions (mock data) */}
      {pastInteractions.map((interaction) => (
        <ReplyPreview key={interaction.id} interaction={interaction} />
      ))}
    </div>
  )
}
