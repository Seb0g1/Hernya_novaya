import { prisma } from "@/lib/prisma";
import { encryptString } from "@/lib/crypto";
import {
  createOAuth2Client,
  exchangeYoutubeCode,
  fetchAuthorizedChannel,
} from "@/lib/youtube-oauth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const base = process.env.PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL;
  if (!base) {
    return NextResponse.json(
      { error: "PUBLIC_APP_URL not configured" },
      { status: 500 },
    );
  }
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const err = req.nextUrl.searchParams.get("error");
  const jar = await cookies();
  const expected = jar.get("youtube_oauth_state")?.value;
  jar.delete("youtube_oauth_state");

  if (err) {
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=${encodeURIComponent(err)}`, base),
    );
  }
  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=invalid_oauth_state", base),
    );
  }

  try {
    const tokens = await exchangeYoutubeCode(code);
    const client = createOAuth2Client();
    client.setCredentials(tokens);
    const { channelId, title } = await fetchAuthorizedChannel(client);

    if (!tokens.access_token) {
      throw new Error("No access token from Google");
    }
    const accessEnc = encryptString(tokens.access_token);
    const refreshEnc = tokens.refresh_token
      ? encryptString(tokens.refresh_token)
      : null;
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000);
    const sc = tokens.scope as string | string[] | undefined;
    const scopeStr = Array.isArray(sc)
      ? sc.join(" ")
      : typeof sc === "string"
        ? sc
        : null;

    await prisma.youtubeAccount.upsert({
      where: { channelId },
      create: {
        channelId,
        channelTitle: title,
        accessToken: accessEnc,
        refreshToken: refreshEnc,
        expiresAt,
        scope: scopeStr,
        active: true,
      },
      update: {
        channelTitle: title ?? undefined,
        accessToken: accessEnc,
        refreshToken: refreshEnc ?? undefined,
        expiresAt,
        scope: scopeStr ?? undefined,
        active: true,
      },
    });

    return NextResponse.redirect(new URL("/dashboard/accounts?connected=1", base));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "oauth_failed";
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=${encodeURIComponent(msg)}`, base),
    );
  }
}
