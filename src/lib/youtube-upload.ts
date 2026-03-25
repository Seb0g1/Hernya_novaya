import { google } from "googleapis";
import { createReadStream } from "node:fs";
import path from "node:path";
import type { OAuth2Client } from "google-auth-library";
import type { MediaAsset } from "@prisma/client";

function shortsTitle(caption: string | null | undefined): string {
  const base = caption?.trim() || "Short";
  return base.includes("#Shorts") || base.includes("#shorts")
    ? base
    : `${base} #Shorts`;
}

export async function uploadYoutubeShort(
  auth: OAuth2Client,
  media: MediaAsset,
): Promise<string> {
  if (media.kind !== "VIDEO") {
    throw new Error("YouTube Shorts: загрузите только видео (не фото).");
  }
  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    media.storageKey,
  );
  const youtube = google.youtube({ version: "v3", auth });
  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: shortsTitle(media.caption),
        description: "Uploaded via Social Farm\n#Shorts",
        categoryId: "22",
        defaultLanguage: "ru",
        defaultAudioLanguage: "ru",
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: createReadStream(filePath),
    },
  });
  const id = res.data.id;
  if (!id) throw new Error("YouTube did not return video id");
  return id;
}
