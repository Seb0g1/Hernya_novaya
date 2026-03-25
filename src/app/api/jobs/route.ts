import { auth } from "@/auth";
import { enqueuePublishJob } from "@/lib/pg-boss";
import { prisma } from "@/lib/prisma";
import { JobStatus, PublishPlatform } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as JobStatus | null;
  const where = status ? { status } : {};
  const jobs = await prisma.publishJob.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      tiktokAccount: {
        select: { id: true, openId: true, displayName: true },
      },
      youtubeAccount: {
        select: { id: true, channelId: true, channelTitle: true },
      },
      media: {
        select: { id: true, kind: true, publicUrl: true, caption: true },
      },
    },
  });
  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    platform?: string;
    accountIds?: string[];
    mediaIds?: string[];
  };
  const platform =
    body.platform === "YOUTUBE" ? PublishPlatform.YOUTUBE : PublishPlatform.TIKTOK;
  if (
    !Array.isArray(body.accountIds) ||
    !Array.isArray(body.mediaIds) ||
    body.accountIds.length === 0 ||
    body.mediaIds.length === 0
  ) {
    return NextResponse.json(
      { error: "accountIds and mediaIds (non-empty) required" },
      { status: 400 },
    );
  }
  const created: string[] = [];
  for (const accountId of body.accountIds) {
    for (const mediaId of body.mediaIds) {
      const job = await prisma.publishJob.create({
        data: {
          platform,
          tiktokAccountId: platform === PublishPlatform.TIKTOK ? accountId : null,
          youtubeAccountId:
            platform === PublishPlatform.YOUTUBE ? accountId : null,
          mediaId,
          status: JobStatus.PENDING,
        },
      });
      created.push(job.id);
      await enqueuePublishJob(job.id);
    }
  }
  return NextResponse.json({ created: created.length, jobIds: created });
}
