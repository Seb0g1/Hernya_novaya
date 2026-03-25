import {
  JobStatus,
  MediaKind,
  PublishPlatform,
  type MediaAsset,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getValidAccessToken } from "@/lib/account-tokens";
import { getValidYoutubeOAuth2 } from "@/lib/youtube-account-tokens";
import { uploadYoutubeShort } from "@/lib/youtube-upload";
import {
  defaultPrivacyFromCreatorInfo,
  initPhotoFromUrls,
  initVideoFromUrl,
  parsePostInitResponse,
  queryCreatorInfo,
} from "@/lib/tiktok";

export async function processPublishJob(jobId: string): Promise<void> {
  const job = await prisma.publishJob.findUnique({
    where: { id: jobId },
    include: {
      tiktokAccount: true,
      youtubeAccount: true,
      media: true,
    },
  });
  if (!job) return;
  if (job.status === JobStatus.DONE) return;

  await prisma.publishJob.update({
    where: { id: jobId },
    data: {
      status: JobStatus.PROCESSING,
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  try {
    if (job.platform === PublishPlatform.YOUTUBE) {
      await runYoutube(jobId, job);
      return;
    }
    await runTiktok(jobId, job);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await prisma.publishJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        errorMessage: message,
        completedAt: new Date(),
      },
    });
  }
}

async function runYoutube(
  jobId: string,
  job: {
    youtubeAccountId: string | null;
    youtubeAccount: { active: boolean } | null;
    media: MediaAsset;
  },
) {
  if (!job.youtubeAccountId || !job.youtubeAccount) {
    throw new Error("YouTube account missing");
  }
  if (!job.youtubeAccount.active) {
    throw new Error("Account is disabled");
  }
  const auth = await getValidYoutubeOAuth2(job.youtubeAccountId);
  const videoId = await uploadYoutubeShort(auth, job.media);
  await prisma.publishJob.update({
    where: { id: jobId },
    data: {
      status: JobStatus.DONE,
      completedAt: new Date(),
      youtubeVideoId: videoId,
    },
  });
}

async function runTiktok(
  jobId: string,
  job: {
    tiktokAccountId: string | null;
    tiktokAccount: { active: boolean } | null;
    media: MediaAsset;
  },
) {
  if (!job.tiktokAccountId || !job.tiktokAccount) {
    throw new Error("TikTok account missing");
  }
  if (!job.tiktokAccount.active) {
    throw new Error("Account is disabled");
  }
  const access = await getValidAccessToken(job.tiktokAccountId);
  const creatorJson = await queryCreatorInfo(access);
  const privacy = defaultPrivacyFromCreatorInfo(creatorJson);
  const title =
    job.media.caption?.trim() ||
    (job.media.kind === MediaKind.VIDEO ? "Video" : "Photo");

  if (job.media.kind === MediaKind.VIDEO) {
    const raw = await initVideoFromUrl(access, {
      videoUrl: job.media.publicUrl,
      title,
      privacyLevel: privacy,
    });
    const parsed = parsePostInitResponse(raw);
    if (parsed.error) {
      throw new Error(parsed.error);
    }
    await prisma.publishJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.DONE,
        completedAt: new Date(),
        tiktokPublishId: parsed.publishId ?? null,
      },
    });
    return;
  }

  const raw = await initPhotoFromUrls(access, {
    imageUrls: [job.media.publicUrl],
    title,
    privacyLevel: privacy,
  });
  const parsed = parsePostInitResponse(raw);
  if (parsed.error) {
    throw new Error(parsed.error);
  }
  await prisma.publishJob.update({
    where: { id: jobId },
    data: {
      status: JobStatus.DONE,
      completedAt: new Date(),
      tiktokPublishId: parsed.publishId ?? null,
    },
  });
}
