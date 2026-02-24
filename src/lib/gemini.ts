import { GoogleGenAI } from "@google/genai"

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

function getClient() {
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set in environment variables")
  }
  return new GoogleGenAI({ apiKey })
}

const MODEL = "gemini-3-flash-preview"

/**
 * Analyze tweets to produce a style summary describing tone, vocabulary,
 * topics, and sample phrases.
 */
export async function analyzeTwitterStyle(tweets: string[]): Promise<string> {
  const ai = getClient()

  const prompt = `You are an expert social media analyst. Analyze the following tweets and produce a concise style guide that an AI can use to replicate this person's writing style when composing tweet replies.

Tweets:
${tweets.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Provide a style guide covering:
- Overall tone and personality
- Common vocabulary and phrases
- Typical topics and interests
- Emoji and punctuation habits
- Sentence structure tendencies

Write the style guide as a single paragraph prompt that could instruct an AI to reply in this style. Start directly with "Reply in..." — no preamble.`

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  })
  return response.text ?? ""
}

/**
 * Generate a reply for a specific tweet using the configured style.
 */
export async function generateReply(
  stylePrompt: string,
  tweetText: string,
  tweetAuthor: string,
  conditionPrompt?: string
): Promise<{ reply: string; shouldReply: boolean; reason?: string }> {
  const ai = getClient()

  const conditionBlock = conditionPrompt
    ? `\n\nBefore replying, check if this tweet matches the following condition: "${conditionPrompt}"\nIf it does NOT match, respond with exactly: SKIP: <reason>\nIf it matches, respond with your reply.`
    : ""

  const prompt = `You are a Twitter reply bot. Your style instructions are:

"${stylePrompt}"${conditionBlock}

Reply to the following tweet by @${tweetAuthor}:
"${tweetText}"

Write a single reply tweet (1-2 sentences, under 280 characters). Be authentic and engaging. Return ONLY the reply text — no quotes, no preamble.`

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  })
  const text = (response.text ?? "").trim()

  if (text.startsWith("SKIP:")) {
    return { reply: "", shouldReply: false, reason: text.replace("SKIP:", "").trim() }
  }

  return { reply: text, shouldReply: true }
}

/**
 * Generate 3 sample tweet replies based on a style prompt.
 */
export async function generateSampleReplies(
  stylePrompt: string,
  sampleTweets?: string[]
): Promise<string[]> {
  const ai = getClient()

  const contextBlock = sampleTweets?.length
    ? `\n\nHere are some example tweets for context:\n${sampleTweets.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
    : ""

  const prompt = `You are a Twitter reply bot. Your style instructions are:

"${stylePrompt}"${contextBlock}

Generate exactly 3 different sample tweet replies that demonstrate this style. The replies should be to generic crypto/web3 tweets. Each reply should be 1-2 sentences and feel authentic.

Return ONLY the 3 replies, one per line, numbered 1. 2. 3. — no other text.`

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  })
  const text = response.text ?? ""

  const replies = text
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, 3)

  return replies.length > 0 ? replies : ["Could not generate samples. Try again."]
}
