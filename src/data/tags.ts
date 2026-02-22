import { tweetResponses } from "./tweets"

// Derive unique tags from all users (kept for backward compat)
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

// 3-category grouped filters
export const KOL_CATEGORIES: Record<string, string[]> = {
  Language: ["English", "Chinese", "Japanese", "Korean", "Spanish", "French"],
  Ecosystem: ["Ethereum", "Solana", "Bitcoin", "BNB Chain", "Polygon", "Arbitrum", "Base"],
  user_type: ["Influencer", "Developer", "Trader", "Analyst", "Founder", "VC"],
}

export const CATEGORY_LABELS: Record<string, string> = {
  Language: "Language",
  Ecosystem: "Ecosystem",
  user_type: "User Type",
}
