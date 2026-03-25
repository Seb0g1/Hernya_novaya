import { prisma } from "@/lib/prisma";
import { decryptString, encryptString } from "@/lib/crypto";
import type { TikTokAppCredentials } from "@/lib/env";
import { exchangeCode, fetchTikTokUserProfile } from "@/lib/tiktok";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const APP_COOKIE = "tiktok_oauth_app";

export async function GET(req: NextRequest) {
  const base = process.env.PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL;
  if (!base) {
    return NextResponse.json(
      { error: "PUBLIC_APP_URL not configured" },
      { status: 500 },
    );
  }
  const redirectUri = new URL("/api/tiktok/callback", base).toString();
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const err = req.nextUrl.searchParams.get("error");
  const jar = await cookies();
  const expected = jar.get("tiktok_oauth_state")?.value;
  jar.delete("tiktok_oauth_state");
  const rawApp = jar.get(APP_COOKIE)?.value;
  jar.delete(APP_COOKIE);

  let oauthApp: TikTokAppCredentials | undefined;
  if (rawApp) {
    try {
      const parsed = JSON.parse(decryptString(rawApp)) as TikTokAppCredentials;
      const k = parsed.clientKey?.trim();
      const s = parsed.clientSecret?.trim();
      if (k && s) oauthApp = { clientKey: k, clientSecret: s };
    } catch {
      /* ignore */
    }
  }

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
    const token = await exchangeCode(code, redirectUri, oauthApp);
    let displayName: string | null = null;
    let avatarUrl: string | null = null;
    try {
      const profile = await fetchTikTokUserProfile(token.access_token);
      displayName = profile.displayName ?? null;
      avatarUrl = profile.avatarUrl ?? null;
    } catch {
      /* profile optional */
    }
    const accessEnc = encryptString(token.access_token);
    const refreshEnc = token.refresh_token
      ? encryptString(token.refresh_token)
      : null;
    const expiresAt = new Date(Date.now() + (token.expires_in ?? 86400) * 1000);

    const appKey = oauthApp?.clientKey ?? null;
    const appSecretEnc = oauthApp
      ? encryptString(oauthApp.clientSecret)
      : null;

    await prisma.tikTokAccount.upsert({
      where: { openId: token.open_id },
      create: {
        openId: token.open_id,
        displayName,
        avatarUrl,
        appClientKey: appKey,
        appClientSecret: appSecretEnc,
        accessToken: accessEnc,
        refreshToken: refreshEnc,
        expiresAt,
        scope: token.scope ?? null,
        active: true,
      },
      update: {
        displayName: displayName ?? undefined,
        avatarUrl: avatarUrl ?? undefined,
        appClientKey: appKey,
        appClientSecret: appSecretEnc,
        accessToken: accessEnc,
        refreshToken: refreshEnc ?? undefined,
        expiresAt,
        scope: token.scope ?? undefined,
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
