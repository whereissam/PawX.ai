import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, Eye } from "lucide-react"

interface OutreachFormProps {
  onCreateCampaign: (name: string, template: string) => void
}

export function OutreachForm({ onCreateCampaign }: OutreachFormProps) {
  const [name, setName] = useState("")
  const [template, setTemplate] = useState(
    "Hey {{name}}, I've been following your work on {{ecosystem}} and love your insights on {{topic}}. Would love to connect and explore potential collaboration opportunities."
  )
  const [showPreview, setShowPreview] = useState(false)

  const variables = ["{{name}}", "{{handle}}", "{{ecosystem}}", "{{topic}}", "{{followers}}"]

  const previewText = template
    .replace("{{name}}", "Vitalik Buterin")
    .replace("{{handle}}", "@vitalikbuterin")
    .replace("{{ecosystem}}", "Ethereum")
    .replace("{{topic}}", "scaling solutions")
    .replace("{{followers}}", "5.2M")

  return (
    <Card>
      <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div>
          <h3 className="font-medium text-sm mb-1">Campaign Name</h3>
          <Input
            placeholder="e.g., Q1 KOL Partnership Outreach"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm">Message Template</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-3 w-3 mr-1" />
              {showPreview ? "Edit" : "Preview"}
            </Button>
          </div>

          {showPreview ? (
            <div className="p-2.5 sm:p-3 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{previewText}</p>
            </div>
          ) : (
            <Textarea
              rows={4}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Write your outreach template..."
              className="resize-none"
            />
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs text-muted-foreground mr-1">Variables:</span>
            {variables.map((v) => (
              <Badge
                key={v}
                variant="outline"
                className="text-xs cursor-pointer"
                onClick={() => {
                  setTemplate((prev) => prev + ` ${v}`)
                  setShowPreview(false)
                }}
              >
                {v}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => {
            if (name.trim() && template.trim()) {
              onCreateCampaign(name, template)
              setName("")
            }
          }}
          disabled={!name.trim() || !template.trim()}
        >
          <Send className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </CardContent>
    </Card>
  )
}
