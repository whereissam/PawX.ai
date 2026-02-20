import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ECOSYSTEM_TAGS, LANGUAGE_TAGS, USER_TYPE_TAGS } from "@/data/tags"
import type { LanguageTag, EcosystemTag, UserTypeTag } from "@/types"

interface TagBadgeProps {
  tag: LanguageTag | EcosystemTag | UserTypeTag
  type: "language" | "ecosystem" | "userType"
  className?: string
}

export function TagBadge({ tag, type, className }: TagBadgeProps) {
  if (type === "ecosystem") {
    const eco = ECOSYSTEM_TAGS.find((t) => t.value === tag)
    if (!eco) return null
    return (
      <Badge variant="secondary" className={cn(eco.color, "border-0 text-xs", className)}>
        {eco.label}
      </Badge>
    )
  }

  if (type === "language") {
    const lang = LANGUAGE_TAGS.find((t) => t.value === tag)
    if (!lang) return null
    return (
      <Badge variant="outline" className={cn("text-xs gap-1", className)}>
        <span>{lang.emoji}</span>
        {lang.label}
      </Badge>
    )
  }

  const userType = USER_TYPE_TAGS.find((t) => t.value === tag)
  if (!userType) return null
  return (
    <Badge variant="secondary" className={cn("text-xs", className)}>
      {userType.label}
    </Badge>
  )
}
