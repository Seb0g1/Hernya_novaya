import { auth } from "@/auth";
import { enqueuePublishJob } from "@/lib/pg-boss";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const job = await prisma.publishJob.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (job.status !== JobStatus.FAILED) {
    return NextResponse.json(
      { error: "Only failed jobs can be retried" },
      { status: 400 },
    );
  }
  await prisma.publishJob.update({
    where: { id },
    data: {
      status: JobStatus.PENDING,
      errorMessage: null,
      completedAt: null,
      startedAt: null,
    },
  });
  await enqueuePublishJob(id);
  return NextResponse.json({ ok: true });
}
