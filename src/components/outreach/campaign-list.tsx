import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Send, FileText, Trash2 } from "lucide-react"
import type { OutreachCampaign } from "@/types"

const statusConfig = {
  draft: { label: "Draft", color: "bg-foreground/10 text-foreground/70" },
  sending: { label: "Sending", color: "bg-blue-500/10 text-blue-700" },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-700" },
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return "just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface CampaignListProps {
  campaigns: OutreachCampaign[]
  onSend: (id: string) => void
  onDelete: (id: string) => void
}

export function CampaignList({ campaigns, onSend, onDelete }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-muted-foreground">
        <FileText className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium">No campaigns yet</p>
        <p className="text-xs mt-1">Create a campaign above to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">Campaigns ({campaigns.length})</h3>
      {campaigns.map((campaign) => {
        const status = statusConfig[campaign.status]
        return (
          <Card key={campaign.id}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm truncate">{campaign.name}</h4>
                    <Badge className={`text-xs shrink-0 ${status.color}`}>
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {campaign.template}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{campaign.totalCount} targets</span>
                    <span>{campaign.sentCount}/{campaign.totalCount} sent</span>
                    <span>{timeAgo(campaign.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  {campaign.status === "draft" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onSend(campaign.id)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(campaign.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {campaign.status === "sending" && (
                <div className="mt-2.5 sm:mt-3">
                  <div className="w-full bg-surface-2 shadow-neu-inset rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(campaign.sentCount / campaign.totalCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
