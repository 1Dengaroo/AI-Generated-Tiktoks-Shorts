import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

interface RateLimitRule {
  /** Route prefix to match, e.g. "/api/render" */
  pathPrefix: string;
  /** Max requests in the window */
  maxTokens: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** If true, match the path exactly instead of by prefix */
  exact?: boolean;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

/** Evict stale entries every 5 minutes to prevent unbounded memory growth. */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function getStore(name: string): Map<string, RateLimitEntry> {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);

    const timer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store!) {
        if (now - entry.lastRefill > CLEANUP_INTERVAL_MS) {
          store!.delete(key);
        }
      }
    }, CLEANUP_INTERVAL_MS);
    timer.unref?.();
  }
  return store;
}

function checkLimit(
  store: Map<string, RateLimitEntry>,
  identifier: string,
  maxTokens: number,
  windowMs: number,
): NextResponse | null {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry) {
    store.set(identifier, { tokens: maxTokens - 1, lastRefill: now });
    return null;
  }

  const elapsed = now - entry.lastRefill;
  const refill = Math.floor((elapsed / windowMs) * maxTokens);

  if (refill > 0) {
    entry.tokens = Math.min(maxTokens, entry.tokens + refill);
    entry.lastRefill = now;
  }

  if (entry.tokens <= 0) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) },
      },
    );
  }

  entry.tokens -= 1;
  return null;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Rate-limit rules applied in the middleware.
 * Each rule matches by path prefix; the first match wins.
 * Identified by client IP (use userId in the future for auth'd routes).
 */
const rules: RateLimitRule[] = [
  // Render start — expensive, keep tight
  { pathPrefix: "/api/render", maxTokens: 5, windowMs: 60_000, exact: true },
  // Render status polling — needs to be generous (polled every 2s)
  { pathPrefix: "/api/render/", maxTokens: 120, windowMs: 60_000 },
  { pathPrefix: "/api/story/generate", maxTokens: 10, windowMs: 60_000 },
  { pathPrefix: "/api/narration/generate", maxTokens: 10, windowMs: 60_000 },
  { pathPrefix: "/api/captions/generate", maxTokens: 10, windowMs: 60_000 },
];

/**
 * Checks rate limits for the incoming request.
 * Returns a 429 response if rate-limited, or null to continue.
 */
export function applyRateLimit(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;

  for (const rule of rules) {
    const matches = rule.exact
      ? pathname === rule.pathPrefix
      : pathname.startsWith(rule.pathPrefix);
    if (matches) {
      const store = getStore(rule.pathPrefix);
      const identifier = getClientIp(req);
      return checkLimit(store, identifier, rule.maxTokens, rule.windowMs);
    }
  }

  return null;
}
