import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ─── Email validation ─────────────────────────────────────────────────────────

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_RE.test(value.trim()) && value.length <= 254;
}

// ─── In-memory rate limiter ───────────────────────────────────────────────────
// Allows MAX_REQUESTS per WINDOW_MS per IP.
// Simple sliding-window counter — resets on server restart.
// For production, replace with Redis / Upstash.

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;

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

// ─── POST /api/subscribe ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Body size guard — reject obviously empty or huge payloads
  const contentLength = req.headers.get("content-length");
  if (contentLength !== null && (Number(contentLength) === 0 || Number(contentLength) > 1_000)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // 2. Rate limiting by IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // 3. Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = (body as Record<string, unknown>)?.email;

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Введите корректный email-адрес." }, { status: 422 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 4. Persist to DB
  try {
    await prisma.subscriber.create({
      data: { email: normalizedEmail },
    });
  } catch (err) {
    // Duplicate email — treat as success so we don't leak subscriber info
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ ok: true, message: "Вы уже подписаны." });
    }
    console.error("[subscribe] DB error:", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Вы успешно подписались!" }, { status: 201 });
}

// Reject non-POST methods explicitly
export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
