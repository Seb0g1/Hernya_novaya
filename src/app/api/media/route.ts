import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MediaKind } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function kindFromMime(mime: string): MediaKind | null {
  if (mime.startsWith("video/")) return MediaKind.VIDEO;
  if (mime.startsWith("image/")) return MediaKind.PHOTO;
  return null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ media: items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const base = process.env.PUBLIC_APP_URL;
  if (!base) {
    return NextResponse.json(
      { error: "PUBLIC_APP_URL not configured" },
      { status: 500 },
    );
  }
  const form = await req.formData();
  const file = form.get("file");
  const caption = (form.get("caption") as string | null) ?? "";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  const mime = file.type || "application/octet-stream";
  const kind = kindFromMime(mime);
  if (!kind) {
    return NextResponse.json(
      { error: "Only image or video files are allowed" },
      { status: 400 },
    );
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 120 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 120MB)" }, { status: 400 });
  }
  const ext = path.extname(file.name || "").slice(0, 16) || (kind === MediaKind.VIDEO ? ".mp4" : ".jpg");
  const safe = `${randomUUID()}${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  const storageKey = safe;
  await writeFile(path.join(UPLOAD_DIR, safe), buf);
  const publicUrl = new URL(`/uploads/${encodeURIComponent(safe)}`, base).toString();
  const row = await prisma.mediaAsset.create({
    data: {
      kind,
      storageKey,
      publicUrl,
      mimeType: mime,
      sizeBytes: buf.length,
      caption: caption.trim() || null,
    },
  });
  return NextResponse.json({ media: row });
}
