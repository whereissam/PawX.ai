import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio, MessageSquare, Check, Clock, Minus } from "lucide-react"
import type { WsMessage } from "@/hooks/use-websocket"

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface LiveTweetCardProps {
  message: WsMessage
}

export function LiveTweetCard({ message }: LiveTweetCardProps) {
  const data = message.data as Record<string, any>

  const text = (data?.text ?? data?.full_text ?? data?.message ?? JSON.stringify(data)) as string
  const userObj = data?.user as Record<string, any> | undefined
  const username = (userObj?.screen_name ?? data?.username ?? data?.screen_name ?? "unknown") as string
  const name = (userObj?.name ?? data?.name ?? username) as string

  // Simulate reply status: random for demo
  const hash = message.id.charCodeAt(0) % 3
  const replyStatus = hash === 0 ? "replied" : hash === 1 ? "pending" : "skipped"

  const statusConfig = {
    replied: { label: "Replied", color: "bg-green-500/10 text-green-700", icon: Check },
    pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-700", icon: Clock },
    skipped: { label: "Skipped", color: "bg-muted text-muted-foreground", icon: Minus },
  }

  const status = statusConfig[replyStatus]
  const StatusIcon = status.icon

  return (
    <Card className="border-l-4 border-l-primary/60 animate-in slide-in-from-top-2 duration-300">
      <CardContent className="p-3 sm:p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Radio className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
            <span className="font-medium text-sm truncate">{name}</span>
            <span className="text-xs text-muted-foreground">@{username}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="default" className="text-xs py-0 px-1.5">
              LIVE
            </Badge>
            <span className="text-xs text-muted-foreground">
              {timeAgo(message.receivedAt)}
            </span>
          </div>
        </div>

        <p className="text-sm leading-relaxed">{text}</p>

        <div className="flex items-center justify-between pt-1">
          <Badge variant="secondary" className="text-xs gap-1">
            <MessageSquare className="h-3 w-3" />
            Auto-replying...
          </Badge>
          <Badge className={`text-xs gap-1 ${status.color}`}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>

        {replyStatus === "replied" && (
          <div className="ml-4 p-2.5 bg-surface-2/50 rounded-md border-l-2 border-green-500/50">
            <p className="text-xs text-muted-foreground">
              Great point! The on-chain metrics confirm this trend.
            </p>
          </div>
        )}

        {replyStatus === "skipped" && (
          <p className="text-xs text-muted-foreground ml-4">
            Reason: Does not match reply conditions
          </p>
        )}
      </CardContent>
    </Card>
  )
}
