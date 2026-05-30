import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// ── GET /api/speakers/[id] ────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    const speaker = await prisma.speaker.findUnique({ where: { id } });
    if (!speaker) return NextResponse.json({ error: "Не найден." }, { status: 404 });
    return NextResponse.json(speaker);
  } catch {
    return NextResponse.json({ error: "Ошибка базы данных." }, { status: 500 });
  }
}

// ── PATCH /api/speakers/[id] ──────────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    const b = await req.json();

    const speaker = await prisma.speaker.update({
      where: { id },
      data:  {
        ...(b.name        !== undefined && { name:        b.name.trim()        }),
        ...(b.position    !== undefined && { position:    b.position.trim()    }),
        ...(b.company     !== undefined && { company:     b.company?.trim() || null }),
        ...(b.description !== undefined && { description: b.description.trim() }),
        ...(b.imageUrl    !== undefined && { imageUrl:    b.imageUrl            }),
        ...(b.country     !== undefined && { country:     b.country?.trim() || null }),
        ...(b.continent   !== undefined && { continent:   b.continent || null  }),
        ...(b.featured    !== undefined && { featured:    Boolean(b.featured)  }),
        ...(b.visible     !== undefined && { visible:     Boolean(b.visible)   }),
        ...(b.sortOrder   !== undefined && { sortOrder:   Number(b.sortOrder)  }),
      },
    });

    return NextResponse.json(speaker);
  } catch {
    return NextResponse.json({ error: "Ошибка обновления." }, { status: 500 });
  }
}

// ── DELETE /api/speakers/[id] ─────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await prisma.speaker.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления." }, { status: 500 });
  }
}
