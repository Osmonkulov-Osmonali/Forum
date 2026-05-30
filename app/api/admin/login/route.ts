import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

// ── Rate limiting (brute-force guard) ─────────────────────────────────────────

const WINDOW_MS    = 60_000;
const MAX_ATTEMPTS = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.resetAt) { hits.set(ip, { count: 1, resetAt: now + WINDOW_MS }); return false; }
  if (rec.count >= MAX_ATTEMPTS) return true;
  rec.count++;
  return false;
}

// ── POST /api/admin/login ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (rateLimit(ip)) {
    return NextResponse.json(
      { error: "Слишком много попыток. Подождите минуту." },
      { status: 429 }
    );
  }

  try {
    const { password } = await req.json();
    const expected = process.env.ADMIN_PASSWORD;

    if (!expected) {
      return NextResponse.json({ error: "ADMIN_PASSWORD не настроен." }, { status: 500 });
    }

    if (password !== expected) {
      return NextResponse.json({ error: "Неверный пароль." }, { status: 401 });
    }

    const token = await createSessionToken(expected);
    const res   = NextResponse.json({ ok: true });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   SESSION_MAX_AGE,
      path:     "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Ошибка сервера." }, { status: 500 });
  }
}
