import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { auth } from './lib/auth';
import { testConnection, getPool } from './lib/db';
import { logger } from './lib/logger';

const app = express();
const PORT = process.env.PORT || 5950;

app.set('trust proxy', 1);

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(hpp());

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5175,http://localhost:3000").split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) }
}));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later.',
}));

// ─── Better Auth Handler ─────────────────────────────────────────────
app.use('/api/auth', async (req, res, next) => {
  try {
    const proto = req.get('x-forwarded-proto') || req.protocol;
    const originHost = (() => {
      const o = req.get('origin');
      try { return o ? new URL(o).host : null; } catch { return null; }
    })();
    const host = originHost || req.get('x-forwarded-host') || req.get('host') || 'localhost:5950';
    const url = `${proto}://${host}${req.originalUrl}`;

    logger.info(`Auth request: ${req.method} ${url}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value) continue;
      headers.set(key, Array.isArray(value) ? value[0] : value);
    }
    headers.set('host', host);
    headers.set('x-forwarded-host', host);
    headers.set('x-forwarded-proto', proto);

    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    if (hasBody) {
      headers.set('content-type', 'application/json');
    }

    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    const response = await auth.handler(webRequest);

    // Set-Cookie handling
    const raw = (response.headers as any).raw?.() ?? {};
    const setCookieArr: string[] =
      raw['set-cookie'] ?? ((response.headers as any).getSetCookie?.() ?? []);
    if (setCookieArr.length) {
      res.setHeader('Set-Cookie', setCookieArr);
    }

    const location = response.headers.get('location');

    // Copy headers
    for (const [key, value] of response.headers.entries()) {
      const k = key.toLowerCase();
      if (k === 'set-cookie' || k === 'content-length' || k === 'transfer-encoding' || k === 'content-encoding') continue;
      res.setHeader(key, value);
    }

    res.status(response.status);

    if (location && [301, 302, 303, 307, 308].includes(response.status)) {
      res.setHeader('Location', location);
      return res.end();
    }

    const bodyText = await response.text();
    return res.send(bodyText);
  } catch (error) {
    logger.error('Auth handler error:', error);
    return next(error);
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────

async function getSession(req: express.Request): Promise<{ userId: string } | null> {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value) continue;
      headers.set(key, Array.isArray(value) ? value[0] : value);
    }
    const proto = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:5950';
    headers.set('host', host);

    const webRequest = new Request(`${proto}://${host}/api/auth/get-session`, {
      method: 'GET',
      headers,
    });
    const response = await auth.handler(webRequest);
    if (!response.ok) return null;
    const session = await response.json() as any;
    if (!session?.user?.id) return null;
    return { userId: session.user.id };
  } catch (error) {
    logger.error('Failed to get session:', error);
    return null;
  }
}

async function refreshTwitterToken(accountId: string, refreshToken: string): Promise<string | null> {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID || '';
    const clientSecret = process.env.TWITTER_CLIENT_SECRET || '';
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const resp = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      logger.error(`Twitter token refresh failed: ${resp.status} ${errText}`);
      return null;
    }

    const data = await resp.json() as any;
    const pool = getPool();
    if (data.refresh_token) {
      await pool.query(
        `UPDATE "account" SET "accessToken" = $1, "refreshToken" = $2, "accessTokenExpiresAt" = $3 WHERE id = $4`,
        [data.access_token, data.refresh_token, new Date(Date.now() + data.expires_in * 1000), accountId]
      );
    } else {
      await pool.query(
        `UPDATE "account" SET "accessToken" = $1, "accessTokenExpiresAt" = $2 WHERE id = $3`,
        [data.access_token, new Date(Date.now() + data.expires_in * 1000), accountId]
      );
    }

    return data.access_token;
  } catch (error) {
    logger.error('Token refresh error:', error);
    return null;
  }
}

// ─── Twitter Endpoints ───────────────────────────────────────────────

app.get('/api/twitter/status', async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: 'Not authenticated' });

    const pool = getPool();
    const result = await pool.query(
      `SELECT id, "providerId" FROM "account" WHERE "userId" = $1 AND "providerId" = 'twitter'`,
      [session.userId]
    );

    return res.json({ connected: result.rows.length > 0 });
  } catch (error) {
    logger.error('Twitter status check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/twitter/tweet', async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: 'Not authenticated' });

    const { text, replyToTweetId } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "text" field' });
    }

    const pool = getPool();
    const result = await pool.query(
      `SELECT id, "accessToken", "refreshToken", "accessTokenExpiresAt" FROM "account" WHERE "userId" = $1 AND "providerId" = 'twitter'`,
      [session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'No Twitter account linked. Connect your Twitter account first.' });
    }

    const account = result.rows[0];
    let accessToken = account.accessToken;

    // Refresh if expired, expiring within 5 min, or no expiry recorded
    const expiresAt = account.accessTokenExpiresAt ? new Date(account.accessTokenExpiresAt) : null;
    if (!expiresAt || expiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
      if (!account.refreshToken) {
        return res.status(400).json({ error: 'Token expired, no refresh token. Please reconnect Twitter.' });
      }
      const newToken = await refreshTwitterToken(account.id, account.refreshToken);
      if (!newToken) {
        return res.status(400).json({ error: 'Failed to refresh token. Please reconnect Twitter.' });
      }
      accessToken = newToken;
    }

    const tweetPayload: any = { text };
    if (replyToTweetId) {
      tweetPayload.reply = { in_reply_to_tweet_id: replyToTweetId };
    }

    const twitterResp = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetPayload),
    });

    const twitterData = await twitterResp.json();

    if (!twitterResp.ok) {
      logger.error(`Twitter API error: ${twitterResp.status} ${JSON.stringify(twitterData)}`);
      return res.status(twitterResp.status).json({ error: 'Twitter API error', details: twitterData });
    }

    return res.json({ success: true, data: twitterData });
  } catch (error) {
    logger.error('Tweet posting error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Health & Error ──────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => { logger.info('SIGTERM received'); process.exit(0); });
process.on('SIGINT', () => { logger.info('SIGINT received'); process.exit(0); });
