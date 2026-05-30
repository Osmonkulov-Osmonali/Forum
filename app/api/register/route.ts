import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRegistrationSheet, type SheetRow } from "@/lib/google-sheets";

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_RE = /^[\d\s\+\-\(\)]{7,20}$/;
const FORMATS  = ["Offline", "Online"] as const;
type Format    = (typeof FORMATS)[number];

function str(v: unknown, min = 1, max = 100): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length >= min && t.length <= max ? t : null;
}

// ─── In-memory rate limiter ───────────────────────────────────────────────────

const WINDOW_MS    = 60_000;
const MAX_REQUESTS = 10;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now    = Date.now();
  const record = ipHits.get(ip);
  if (!record || now > record.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_REQUESTS) return true;
  record.count += 1;
  return false;
}

// ─── POST /api/register ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      { status: 429 }
    );
  }

  // 2. Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный формат запроса." }, { status: 400 });
  }

  const b         = body as Record<string, unknown>;
  const firstName = str(b.firstName, 1, 60);
  const lastName  = str(b.lastName,  1, 60);
  const phone     = str(b.phone,     7, 20);
  const email     = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const format    = FORMATS.includes(b.format as Format) ? (b.format as Format) : null;

  // 3. Validate
  if (!firstName) {
    return NextResponse.json({ error: "Введите имя." }, { status: 422 });
  }
  if (!lastName) {
    return NextResponse.json({ error: "Введите фамилию." }, { status: 422 });
  }
  if (!phone || !PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Введите корректный номер телефона." }, { status: 422 });
  }
  if (email && (!EMAIL_RE.test(email) || email.length > 254)) {
    return NextResponse.json({ error: "Введите корректный email-адрес." }, { status: 422 });
  }
  if (!format) {
    return NextResponse.json({ error: "Выберите формат участия." }, { status: 422 });
  }

  // 4. Timestamp in Bishkek time (UTC+6)
  const registeredAt = new Date().toLocaleString("ru-RU", {
    timeZone: "Asia/Bishkek",
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });

  // 5. Write to Google Sheets (primary)
  let sheetsError = false;
  try {
    const sheet = await getRegistrationSheet();
    const row: SheetRow = {
      "Дата регистрации": registeredAt,
      "Имя":              firstName,
      "Фамилия":          lastName,
      "Email":            email || "—",
      "Телефон":          phone,
      "Формат":           format,
    };
    await sheet.addRow(row as Record<string, string>);
  } catch (err) {
    sheetsError = true;
    console.error("[register] Google Sheets error:", err);
    // Non-fatal: fall through to DB backup
  }

  // 6. Save to Prisma DB (backup — always attempt)
  try {
    await prisma.registration.create({
      data: {
        name:  `${firstName} ${lastName}`,
        email: email || `noemail_${Date.now()}@placeholder`,
        phone,
      },
    });
  } catch (err) {
    console.error("[register] DB error:", err);

    // Both integrations failed — report error to user
    if (sheetsError) {
      return NextResponse.json(
        { error: "Не удалось сохранить регистрацию. Попробуйте позже." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { ok: true, message: "Вы успешно зарегистрированы! Мы свяжемся с вами." },
    { status: 201 }
  );
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
