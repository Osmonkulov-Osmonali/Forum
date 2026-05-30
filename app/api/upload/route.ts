import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB

// Auth is enforced by middleware — this route only runs for authenticated admins.
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Файл не передан." }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Файл превышает 4 МБ." }, { status: 413 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Допустимые форматы: JPEG, PNG, WebP, GIF." },
      { status: 415 }
    );
  }

  const ext      = file.name.split(".").pop() ?? "jpg";
  const filename = `speakers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const blob     = await put(filename, file, { access: "public" });

  return NextResponse.json({ url: blob.url });
}
