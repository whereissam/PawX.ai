import { tweetResponses } from "./tweets"

// Derive unique tags from all users
const tagSet = new Set<string>()
for (const r of tweetResponses) {
  for (const tag of r.user.tags) {
    tagSet.add(tag)
  }
}

export const KOL_TAGS: { value: string; label: string }[] = Array.from(tagSet).map((tag) => ({
  value: tag,
  label: tag,
}))
