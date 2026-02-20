// API response sub-types
export interface UserMention {
  id: string
  username: string
  displayname: string
}

export interface UrlEntity {
  url: string
  expandedUrl: string
  displayUrl: string
}

export interface Hashtag {
  text: string
}

export interface TweetEntities {
  urls?: UrlEntity[]
  hashtags?: Hashtag[]
  userMentions?: UserMention[]
}

export interface MediaVideoInfo {
  durationMillis?: number
  variants?: { bitrate?: number; contentType: string; url: string }[]
}

export interface Media {
  id: string
  type: string
  url: string
  previewUrl?: string
  videoInfo?: MediaVideoInfo
}

// API tweet object
export interface Tweet {
  id: string
  conversationId: string
  text: string
  entities?: TweetEntities
  medias?: Media[]
  inReplyToTweetId?: string
  inReplyToUser?: string
  quotedTweetId?: string
  retweetedTweetId?: string
  favoriteCount: number
  bookmarkCount: number
  viewCount: number
  quoteCount: number
  replyCount: number
  retweetCount: number
  fullText: string
  notetweetEntities?: TweetEntities
  createdAt: string
}

// API user object
export interface KolUser {
  id: string
  name: string
  screenName: string
  location?: string
  description: string
  website?: string
  followersCount: number
  friendsCount: number
  kolFollowersCount: number
  isKol: boolean
  tags: string[]
}

// API response item: { tweet, user }
export interface TweetResponse {
  tweet: Tweet
  user: KolUser
}

// App types
export interface FilterState {
  tags: string[]
  searchQuery: string
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
  targets: KolUser[]
  status: "draft" | "sending" | "completed"
  sentCount: number
  totalCount: number
  createdAt: string
}
