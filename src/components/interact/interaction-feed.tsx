import { ReplyPreview } from "./reply-preview"
import { mockInteractions } from "@/data/tweets"
import { MessageSquare } from "lucide-react"
import type { KolUser } from "@/types"

interface InteractionFeedProps {
  selectedKols: KolUser[]
}

export function InteractionFeed({ selectedKols }: InteractionFeedProps) {
  const selectedIds = new Set(selectedKols.map((k) => k.id))

  const filteredInteractions =
    selectedKols.length > 0
      ? mockInteractions.filter((i) => selectedIds.has(i.kolId))
      : mockInteractions

  if (filteredInteractions.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-muted-foreground">
        <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium">No interactions yet</p>
        <p className="text-xs mt-1">
          Select KOLs and start interacting to see the feed here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {filteredInteractions.map((interaction) => (
        <ReplyPreview key={interaction.id} interaction={interaction} />
      ))}
    </div>
  )
}
