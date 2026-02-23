import axios from "axios"
import type {
  TweetResponse,
  KolUser,
  KolFilterParams,
  KolFilterResult,
  LinkedInSearchParams,
  LinkedInSearchResponse,
  LinkedInProfile,
} from "@/types"
import { kols as mockKols } from "@/data/kols"

const isDev = import.meta.env.DEV
const API_BASE = isDev ? "/api" : "https://pawx-social-assistant.onrender.com"

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
})

// ── Real API calls ──────────────────────────────────────────────

/** Get user profiles (avatar, followers, etc.) */
export async function getUserInfo(screenNames: string[]): Promise<KolUser[]> {
  const { data } = await api.get("/user_info", {
    params: { screen_names: screenNames.join(",") },
  })
  return data
}

/** Get tweets for specific users — backend handles date ranges */
export async function getTweetsInfo(screenNames: string[]): Promise<TweetResponse[]> {
  const { data } = await api.get("/tweets_info", {
    params: { screen_names: screenNames.join(",") },
  })
  return data
}

export async function wsSubscribe(twitterUsername: string) {
  const { data } = await api.post("/ws/subscribe", { twitterUsername })
  return data
}

export async function wsUnsubscribe(twitterUsername: string) {
  const { data } = await api.post("/ws/unsubscribe", { twitterUsername })
  return data
}

// ── KOL Filter API ──────────────────────────────────────────────

export async function filterKols(
  params: KolFilterParams
): Promise<KolFilterResult[]> {
  const { data } = await api.post("/kol_filter", params)
  return data
}

/** Convert KolFilterResult to KolUser for component compatibility */
export function mapFilterResultToKolUser(result: KolFilterResult): KolUser {
  return {
    id: result.username,
    name: result.username,
    screenName: result.username,
    location: result.location || undefined,
    description: result.description || "",
    website: result.website || undefined,
    followersCount: result.followersCount,
    friendsCount: result.friendsCount,
    kolFollowersCount: result.kolFollowersCount,
    isKol: true,
    tags: [
      ...result.language_tags,
      ...result.ecosystem_tags,
      ...result.user_type_tags,
    ],
  }
}

// ── LinkedIn API calls ──────────────────────────────────────────

export async function searchLinkedIn(
  params: LinkedInSearchParams
): Promise<LinkedInSearchResponse> {
  const { data } = await api.post("/search", params)
  return data
}

export async function enrichProfiles(
  usernames: string[]
): Promise<LinkedInProfile[]> {
  const { data } = await api.post("/enrich_profiles", { usernames })
  return data
}

// ── WebSocket URL ───────────────────────────────────────────────

export const WS_URL = import.meta.env.VITE_WS_URL ?? "wss://ws.pawx.ai/ws"

// ── Fetch KOL profiles from real API, fallback to mock ──────────

export async function fetchKols(): Promise<KolUser[]> {
  try {
    const screenNames = mockKols.map((k) => k.screenName)
    const data = await getUserInfo(screenNames)
    // Merge tags from mock data (real API doesn't return tags)
    return data.map((user) => {
      const mock = mockKols.find(
        (k) => k.screenName.toLowerCase() === user.screenName.toLowerCase()
      )
      return {
        ...user,
        tags: mock?.tags ?? [],
        description: user.description || mock?.description || "",
      }
    })
  } catch {
    return mockKols
  }
}
