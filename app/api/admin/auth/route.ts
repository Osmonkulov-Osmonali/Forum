import { NextRequest, NextResponse } from "next/server";

// ─── Rate limiting (brute-force guard) ────────────────────────────────────────

const WINDOW_MS    = 60_000; // 1 minute
const MAX_ATTEMPTS = 5;      // 5 wrong attempts per IP per window
const authHits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now    = Date.now();
  const record = authHits.get(ip);
  if (!record || now > record.resetAt) {
    authHits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_ATTEMPTS) return true;
  record.count += 1;
  return false;
}

// ─── POST /api/admin/auth ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Слишком много попыток. Попробуйте через минуту." },
      { status: 429 }
    );
  }

  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD не задан в переменных окружения" },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
