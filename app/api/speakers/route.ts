import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

// ── GET /api/speakers ─────────────────────────────────────────────────────────
// Public: returns only visible speakers (for landing page).
// Admin (valid session cookie): returns ALL speakers including hidden.

export async function GET(req: NextRequest) {
  const token   = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const isAdmin = token
    ? await verifySessionToken(token, process.env.ADMIN_PASSWORD ?? "")
    : false;

  try {
    const speakers = await prisma.speaker.findMany({
      where:   isAdmin ? undefined : { visible: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(speakers, {
      headers: isAdmin
        ? {}
        : { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json({ error: "Ошибка базы данных." }, { status: 500 });
  }
}

// ── POST /api/speakers ────────────────────────────────────────────────────────
// Protected by middleware.

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();

    if (!b.name?.trim() || !b.position?.trim() || !b.description?.trim() || !b.imageUrl) {
      return NextResponse.json(
        { error: "Обязательные поля: name, position, description, imageUrl" },
        { status: 400 }
      );
    }

    const speaker = await prisma.speaker.create({
      data: {
        name:        b.name.trim(),
        position:    b.position.trim(),
        company:     b.company?.trim()     || null,
        description: b.description.trim(),
        imageUrl:    b.imageUrl,
        country:     b.country?.trim()     || null,
        continent:   b.continent           || null,
        featured:    Boolean(b.featured),
        visible:     b.visible !== false,
        sortOrder:   Number(b.sortOrder)   || 0,
      },
    });

    return NextResponse.json(speaker, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ошибка создания спикера." }, { status: 500 });
  }
}
