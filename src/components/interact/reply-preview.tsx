import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Heart, Repeat2, ArrowRight, Eye } from "lucide-react"
import { kols } from "@/data/kols"
import type { Interaction } from "@/types"

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return "just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface ReplyPreviewProps {
  interaction: Interaction
}

export function ReplyPreview({ interaction }: ReplyPreviewProps) {
  const kol = kols.find((k) => k.id === interaction.kolId)
  if (!kol) return null

  const statusColor = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    sent: "bg-green-500/10 text-green-600 dark:text-green-400",
    failed: "bg-red-500/10 text-red-600 dark:text-red-400",
  }

  return (
    <Card>
      <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
        {/* Original tweet */}
        <div className="flex items-start gap-2 sm:gap-3">
          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
            <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${kol.screenName}`} alt={kol.name} />
            <AvatarFallback>{kol.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="font-medium text-sm truncate">{kol.name}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">@{kol.screenName}</span>
              <span className="text-xs text-muted-foreground ml-auto shrink-0">
                {timeAgo(interaction.tweet.createdAt)}
              </span>
            </div>
            <p className="text-sm mt-1">{interaction.tweet.text}</p>
            <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {formatNumber(interaction.tweet.favoriteCount)}
              </span>
              <span className="flex items-center gap-1">
                <Repeat2 className="h-3 w-3" />
                {formatNumber(interaction.tweet.retweetCount)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {formatNumber(interaction.tweet.replyCount)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatNumber(interaction.tweet.viewCount)}
              </span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-4 flex-wrap">
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
          <span className="text-xs text-muted-foreground">Auto-reply</span>
          <Badge variant="secondary" className="text-xs">
            {interaction.replyStyle}
          </Badge>
          <Badge className={`text-xs ml-auto border-0 ${statusColor[interaction.status]}`}>
            {interaction.status}
          </Badge>
        </div>

        {/* Reply */}
        <div className="ml-4 sm:ml-8 p-2.5 sm:p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm">{interaction.replyContent}</p>
          <p className="text-xs text-muted-foreground mt-1.5 sm:mt-2">
            {timeAgo(interaction.timestamp)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
