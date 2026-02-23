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

// 3-category grouped filters — values must match API exactly
export const KOL_CATEGORIES: Record<string, { value: string; label: string }[]> = {
  language_tags: [
    { value: "english", label: "English" },
    { value: "chinese", label: "Chinese" },
    { value: "japanese", label: "Japanese" },
    { value: "korean", label: "Korean" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
  ],
  ecosystem_tags: [
    { value: "ethereum", label: "Ethereum" },
    { value: "solana", label: "Solana" },
    { value: "bitcoin", label: "Bitcoin" },
    { value: "bnb_chain", label: "BNB Chain" },
    { value: "base", label: "Base" },
    { value: "arbitrum", label: "Arbitrum" },
    { value: "polygon_pos", label: "Polygon" },
    { value: "avalanche", label: "Avalanche" },
    { value: "sui", label: "Sui" },
    { value: "near", label: "NEAR" },
    { value: "linea", label: "Linea" },
    { value: "hyperliquid", label: "Hyperliquid" },
    { value: "rollups", label: "Rollups" },
    { value: "zk_rollups", label: "ZK Rollups" },
  ],
  user_type_tags: [
    { value: "community", label: "Community" },
    { value: "trader", label: "Trader" },
    { value: "alpha_hunter", label: "Alpha Hunter" },
    { value: "onchain_analyst", label: "On-chain Analyst" },
    { value: "developer", label: "Developer" },
    { value: "founder & CEO", label: "Founder & CEO" },
    { value: "researcher", label: "Researcher" },
    { value: "defi_user", label: "DeFi User" },
    { value: "meme_creator", label: "Meme Creator" },
    { value: "nft_collector", label: "NFT Collector" },
    { value: "gamefi_player", label: "GameFi Player" },
    { value: "technical_sharer", label: "Technical Sharer" },
  ],
}

export const CATEGORY_LABELS: Record<string, string> = {
  language_tags: "Language",
  ecosystem_tags: "Ecosystem",
  user_type_tags: "User Type",
}
