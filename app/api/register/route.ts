import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_RE = /^[\d\s\+\-\(\)]{7,20}$/;

function isStr(v: unknown, min = 1, max = 255): v is string {
  return typeof v === "string" && v.trim().length >= min && v.trim().length <= max;
}

// ─── In-memory rate limiter ───────────────────────────────────────────────────

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
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
  // Rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      { status: 429 }
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный формат запроса." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name  = typeof b.name  === "string" ? b.name.trim()  : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";

  // Validate
  if (!isStr(name, 2, 100)) {
    return NextResponse.json({ error: "Введите имя (минимум 2 символа)." }, { status: 422 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Введите корректный email-адрес." }, { status: 422 });
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Введите корректный номер телефона." }, { status: 422 });
  }

  // Save
  try {
    await prisma.registration.create({
      data: { name, email: email.toLowerCase(), phone },
    });
  } catch (err) {
    console.error("[register] DB error:", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера. Попробуйте позже." }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, message: "Регистрация прошла успешно! Мы свяжемся с вами." },
    { status: 201 }
  );
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
