import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.youtubeAccount.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      channelId: true,
      channelTitle: true,
      active: true,
      expiresAt: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ accounts: rows });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as { id?: string; active?: boolean };
  if (!body.id || typeof body.active !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  await prisma.youtubeAccount.update({
    where: { id: body.id },
    data: { active: body.active },
  });
  return NextResponse.json({ ok: true });
}
