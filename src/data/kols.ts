import type { KolUser } from "@/types"
import { tweetResponses } from "./tweets"

// Derive unique users from tweetResponses
const userMap = new Map<string, KolUser>()
for (const r of tweetResponses) {
  if (!userMap.has(r.user.id)) {
    userMap.set(r.user.id, r.user)
  }
}

export const kols: KolUser[] = Array.from(userMap.values())
