import axios from "axios";

const api = axios.create({ withCredentials: true });

export async function getTwitterStatus(): Promise<{ connected: boolean }> {
  const resp = await api.get("/api/twitter/status");
  return resp.data;
}

export async function postTweet(
  text: string,
  replyToTweetId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const resp = await api.post("/api/twitter/tweet", {
    text,
    replyToTweetId,
  });
  return resp.data;
}
