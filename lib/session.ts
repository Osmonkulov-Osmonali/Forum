/**
 * HMAC-SHA256 session tokens via Web Crypto API.
 * Works in both Edge (middleware) and Node.js (API routes) runtimes.
 *
 * Token format: {base64url(payload)}.{base64url(signature)}
 * Payload:      JSON { exp: unixMs }
 */

export const SESSION_COOKIE  = "admin_session";
export const SESSION_MAX_AGE = 8 * 3600;          // 8 hours in seconds
const SESSION_MS             = SESSION_MAX_AGE * 1000;

// ── Base64url helpers ──────────────────────────────────────────────────────────

function b64uEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function b64uDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad    = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Uint8Array.from(atob(padded + pad), (c) => c.charCodeAt(0));
}

// ── Crypto helpers ────────────────────────────────────────────────────────────

async function importKey(secret: string, usage: "sign" | "verify"): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function createSessionToken(secret: string): Promise<string> {
  const payload = b64uEncode(
    new TextEncoder().encode(JSON.stringify({ exp: Date.now() + SESSION_MS }))
  );
  const key = await importKey(secret, "sign");
  const sig  = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${b64uEncode(sig)}`;
}

export async function verifySessionToken(
  token: string,
  secret: string
): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;

  const payload = token.slice(0, dot);
  const sigB64u = token.slice(dot + 1);

  try {
    const key   = await importKey(secret, "verify");
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64uDecode(sigB64u),
      new TextEncoder().encode(payload)
    );
    if (!valid) return false;

    const { exp } = JSON.parse(new TextDecoder().decode(b64uDecode(payload)));
    return Date.now() < exp;
  } catch {
    return false;
  }
}
