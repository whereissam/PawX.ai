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
  // Fields from real API
  profileImageUrlHttps?: string
  profileBannerUrl?: string
  verified?: boolean
  createdAt?: string
  favouritesCount?: number
  statusesCount?: number
  mediaCount?: number
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

// --- KOL Filter ---
export interface KolFilterParams {
  language_tags: string[]
  ecosystem_tags: string[]
  user_type_tags: string[]
}

export interface KolFilterResult {
  language_tags: string[]
  ecosystem_tags: string[]
  user_type_tags: string[]
  MBTI: string
  summary: string
  location: string
  description: string
  website: string
  followersCount: number
  friendsCount: number
  kolFollowersCount: number
  username: string
}

// --- LinkedIn Search ---
export interface LinkedInSearchParams {
  title: string
  country?: string
  company?: string
  university?: string
}

export interface SearchResult {
  title: string
  link: string
}

export interface LinkedInSearchResponse {
  items: SearchResult[]
  usernames: (string | null)[]
}

// --- LinkedIn Enrich ---
export interface LinkedInPosition {
  jobTitle: string
  company: string
  location: string
  duration: string
  companyLink: string
  companyId: string
  jobDescription: string
}

export interface LinkedInEducation {
  duration: string
  university: string
  universityLink: string
  degree: string
  description: string | null
  subDescription: string | null
  durationParsed?: { start: { year: number }; end: { year: number } }
}

export interface LinkedInSkill {
  skillName: string
  endorsementsCount: number
  isPassedLinkedInSkillAssessment: boolean
}

export interface LinkedInExperiencePosition {
  companyName: string
  title: string
  location: string
  duration: string
  description: string
  durationParsed?: {
    start: { year: number; month: number }
    end: { year: number; month: number }
    present: boolean
    period: string
  }
}

export interface LinkedInExperience {
  companyName: string
  companyLogo: string
  companyLink: string
  title: string
  totalDuration: string
  positions: LinkedInExperiencePosition[]
  isMultiPositions: boolean
}

export interface LinkedInOverview {
  firstName: string
  lastName: string
  fullName: string
  headline: string
  publicIdentifier: string
  followerCount: number
  connectionsCount: number
  profilePictureURL?: string
  profileID: string
  CurrentPositions: { id: string; name: string; url: string; logoURL: string }[]
  isTopVoice: boolean
  premium: boolean
  influencer: boolean
}

export interface LinkedInDetails {
  about: string
  positions: LinkedInPosition[]
  education: LinkedInEducation[]
  languages: { languages: { Language: string; Level: string }[] | null }
}

export interface LinkedInProfile {
  username: string
  overview: { success: boolean; statusCode: number; data: LinkedInOverview } | null
  details: { success: boolean; statusCode: number; data: LinkedInDetails } | null
  experience: {
    success: boolean
    statusCode: number
    data: { experience: LinkedInExperience[] }
  } | null
  education: {
    success: boolean
    statusCode: number
    data: { education: LinkedInEducation[] }
  } | null
  skills: {
    success: boolean
    statusCode: number
    data: { skills: LinkedInSkill[] }
  } | null
}

// --- Interaction Config ---
export interface InteractionConfig {
  styleMode: "describe" | "learn" | "preset"
  stylePrompt: string
  replyCondition: "all" | "conditional"
  conditionPrompt: string
  presetStyle?: string
  twitterHandle?: string
}
