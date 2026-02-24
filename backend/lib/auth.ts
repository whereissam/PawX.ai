import { betterAuth } from "better-auth";
import { getPool } from "./db";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set. Generate one with: openssl rand -base64 32");
}
if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
  console.warn("WARNING: TWITTER_CLIENT_ID or TWITTER_CLIENT_SECRET is not set. Twitter OAuth will not work.");
}

export const auth = betterAuth({
  database: getPool(),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5950",

  trustedOrigins: [
    process.env.TRUSTED_ORIGIN || "http://localhost:5175",
    "http://localhost:5175",
    "http://localhost:3000",
  ],

  socialProviders: {
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      redirectURI: `${process.env.APP_URL || "http://localhost:5175"}/api/auth/callback/twitter`,
      scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  logger: {
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
    logger: {
      error: (message: any, data?: any) => {
        console.error("Better Auth Error:", message);
        if (data) console.error("Details:", JSON.stringify(data, null, 2));
      },
      warn: (message: any) => console.warn(message),
      info: (message: any) => console.info(message),
    },
  },
});
