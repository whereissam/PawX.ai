// Tag types
export type LanguageTag =
  | "chinese"
  | "japanese"
  | "korean"
  | "english"
  | "russian"
  | "spanish"
  | "french"
  | "vietnamese"
  | "thai"
  | "arabic"

export type EcosystemTag =
  | "ethereum"
  | "solana"
  | "monad"
  | "base"
  | "bitcoin"
  | "polygon"
  | "arbitrum"
  | "avalanche"
  | "sui"
  | "aptos"
  | "ton"
  | "cosmos"

export type UserTypeTag =
  | "developer"
  | "trader"
  | "community"
  | "investor"
  | "researcher"
  | "influencer"
  | "founder"
  | "artist"

export interface KOL {
  id: string
  handle: string
  displayName: string
  avatar: string
  bio: string
  followers: number
  following: number
  website?: string
  location?: string
  joinedDate: string
  verified: boolean
  languages: LanguageTag[]
  ecosystems: EcosystemTag[]
  userTypes: UserTypeTag[]
}

export interface Tweet {
  id: string
  kolId: string
  content: string
  timestamp: string
  likes: number
  retweets: number
  replies: number
}

export interface CategorySummary {
  category: string
  summary: string
  tweetCount: number
  topTopics: string[]
  lastUpdated: string
}

export interface Interaction {
  id: string
  kolId: string
  tweet: Tweet
  replyContent: string
  replyStyle: string
  status: "pending" | "sent" | "failed"
  timestamp: string
}

export interface StyleProfile {
  handle: string
  tone: string
  topics: string[]
  samplePhrases: string[]
  analyzedAt: string
}

export interface OutreachCampaign {
  id: string
  name: string
  template: string
  targetFilters: FilterState
  targets: KOL[]
  status: "draft" | "sending" | "completed"
  sentCount: number
  totalCount: number
  createdAt: string
}

export interface FilterState {
  languages: LanguageTag[]
  ecosystems: EcosystemTag[]
  userTypes: UserTypeTag[]
  searchQuery: string
}
