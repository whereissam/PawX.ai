import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"
import type { LinkedInSearchParams } from "@/types"

interface LinkedInSearchFormProps {
  onSearch: (params: LinkedInSearchParams) => void
  isLoading: boolean
}

export function LinkedInSearchForm({ onSearch, isLoading }: LinkedInSearchFormProps) {
  const [title, setTitle] = useState("")
  const [country, setCountry] = useState("")
  const [company, setCompany] = useState("")
  const [university, setUniversity] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSearch({
      title: title.trim(),
      ...(country.trim() && { country: country.trim() }),
      ...(company.trim() && { company: company.trim() }),
      ...(university.trim() && { university: university.trim() }),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="e.g. Software Engineer, Product Manager"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-sm border-primary/50 focus-visible:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Country
          </label>
          <Input
            placeholder="e.g. United States"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Company
          </label>
          <Input
            placeholder="e.g. Google"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            University
          </label>
          <Input
            placeholder="e.g. MIT"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm"
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading || !title.trim()} className="w-full gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        Search LinkedIn
      </Button>
    </form>
  )
}
