import axios from "axios"
import type { TweetResponse, KolUser } from "@/types"
import { tweetResponses } from "@/data/tweets"
import { kols } from "@/data/kols"

const api = axios.create({
  baseURL: "https://api.example.com", // placeholder — swap when API is ready
  timeout: 10000,
})

export async function fetchTweets(): Promise<TweetResponse[]> {
  // TODO: swap to real API call when endpoint is ready
  // const { data } = await api.get<TweetResponse[]>("/tweets")
  // return data
  void api // suppress unused warning
  return Promise.resolve(tweetResponses)
}

export async function fetchKols(): Promise<KolUser[]> {
  // TODO: swap to real API call when endpoint is ready
  // const { data } = await api.get<KolUser[]>("/kols")
  // return data
  return Promise.resolve(kols)
}
