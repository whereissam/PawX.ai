import axios from "axios";

export async function getTwitterStatus(): Promise<{ connected: boolean }> {
  const resp = await axios.get("/api/twitter/status");
  return resp.data;
}

export async function postTweet(
  text: string,
  replyToTweetId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const resp = await axios.post("/api/twitter/tweet", {
    text,
    replyToTweetId,
  });
  return resp.data;
}
