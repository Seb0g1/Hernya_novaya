import { auth } from "@/auth";
import { encryptString } from "@/lib/crypto";
import type { TikTokAppCredentials } from "@/lib/env";
import { getTikTokCredentialsFromEnv } from "@/lib/env";
import { buildAuthorizeUrl } from "@/lib/tiktok";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

const APP_COOKIE = "tiktok_oauth_app";

function accountsErrorRedirect(base: string, message: string) {
  return NextResponse.redirect(
    new URL(`/dashboard/accounts?error=${encodeURIComponent(message)}`, base),
  );
}

/** JSON — для fetch из браузера (иначе redirect на TikTok даёт opaque-ответ и status 0). */
type ResponseMode = "redirect" | "json";

async function startOAuthFlow(
  creds: TikTokAppCredentials | null,
  mode: ResponseMode,
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const base = process.env.PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL;
  if (!base) {
    return NextResponse.json(
      { error: "PUBLIC_APP_URL or NEXTAUTH_URL not configured" },
      { status: 500 },
    );
  }
  const redirectUri = new URL("/api/tiktok/callback", base).toString();
  const state = randomBytes(24).toString("hex");
  const jar = await cookies();
  jar.set("tiktok_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });
  if (creds) {
    jar.set(APP_COOKIE, encryptString(JSON.stringify(creds)), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
      secure: process.env.NODE_ENV === "production",
    });
  } else {
    jar.delete(APP_COOKIE);
  }

  const useCreds = creds ?? getTikTokCredentialsFromEnv();
  if (!useCreds) {
    const msg =
      "Нет ключей TikTok: задайте TIKTOK_CLIENT_KEY/SECRET в .env или укажите Client Key и Client Secret в форме ниже.";
    if (mode === "json") {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return accountsErrorRedirect(base, msg);
  }

  try {
    const url = buildAuthorizeUrl(state, redirectUri, creds ?? undefined);
    if (mode === "json") {
      return NextResponse.json({ url });
    }
    return NextResponse.redirect(url);
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Не удалось начать OAuth TikTok";
    if (mode === "json") {
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    return accountsErrorRedirect(base, msg);
  }
}

export async function GET() {
  return startOAuthFlow(null, "redirect");
}

export async function POST(req: Request) {
  let body: { clientKey?: string; clientSecret?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const key = body.clientKey?.trim() ?? "";
  const secret = body.clientSecret?.trim() ?? "";
  if (key && secret) {
    return startOAuthFlow({ clientKey: key, clientSecret: secret }, "json");
  }
  if (!key && !secret) {
    return startOAuthFlow(null, "json");
  }
  return NextResponse.json(
    {
      error:
        "Укажите оба поля (Client Key и Client Secret) или оставьте пустыми для ключей из .env",
    },
    { status: 400 },
  );
}
