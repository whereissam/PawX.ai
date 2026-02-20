import type { LanguageTag, EcosystemTag, UserTypeTag } from "@/types"

export const LANGUAGE_TAGS: { value: LanguageTag; label: string; emoji: string }[] = [
  { value: "chinese", label: "Chinese", emoji: "🇨🇳" },
  { value: "japanese", label: "Japanese", emoji: "🇯🇵" },
  { value: "korean", label: "Korean", emoji: "🇰🇷" },
  { value: "english", label: "English", emoji: "🇺🇸" },
  { value: "russian", label: "Russian", emoji: "🇷🇺" },
  { value: "spanish", label: "Spanish", emoji: "🇪🇸" },
  { value: "french", label: "French", emoji: "🇫🇷" },
  { value: "vietnamese", label: "Vietnamese", emoji: "🇻🇳" },
  { value: "thai", label: "Thai", emoji: "🇹🇭" },
  { value: "arabic", label: "Arabic", emoji: "🇸🇦" },
]

export const ECOSYSTEM_TAGS: { value: EcosystemTag; label: string; color: string }[] = [
  { value: "ethereum", label: "Ethereum", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  { value: "solana", label: "Solana", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { value: "monad", label: "Monad", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { value: "base", label: "Base", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { value: "bitcoin", label: "Bitcoin", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  { value: "polygon", label: "Polygon", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { value: "arbitrum", label: "Arbitrum", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  { value: "avalanche", label: "Avalanche", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  { value: "sui", label: "Sui", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  { value: "aptos", label: "Aptos", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
  { value: "ton", label: "TON", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  { value: "cosmos", label: "Cosmos", color: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400" },
]

export const USER_TYPE_TAGS: { value: UserTypeTag; label: string; icon: string }[] = [
  { value: "developer", label: "Developer", icon: "code" },
  { value: "trader", label: "Trader", icon: "trending-up" },
  { value: "community", label: "Community", icon: "users" },
  { value: "investor", label: "Investor", icon: "wallet" },
  { value: "researcher", label: "Researcher", icon: "search" },
  { value: "influencer", label: "Influencer", icon: "megaphone" },
  { value: "founder", label: "Founder", icon: "rocket" },
  { value: "artist", label: "Artist", icon: "palette" },
]
