import { auth } from "@/auth";
import { encryptString } from "@/lib/crypto";
import type { TikTokAppCredentials } from "@/lib/env";
import { getTikTokCredentialsFromEnv } from "@/lib/env";
import { buildAuthorizeUrl } from "@/lib/tiktok";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

const APP_COOKIE = "tiktok_oauth_app";

function getRequestOrigin(req: Request): string {
  const h = req.headers;
  const forwardedHost = h.get("x-forwarded-host");
  const host = forwardedHost ?? h.get("host") ?? "localhost";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

function accountsErrorRedirect(base: string, message: string) {
  return NextResponse.redirect(
    new URL(`/dashboard/accounts?error=${encodeURIComponent(message)}`, base),
  );
}

/** redirect — HTML-форма (надёжно). json — только для программного клиента. */
type ResponseMode = "redirect" | "json";

async function startOAuthFlow(
  creds: TikTokAppCredentials | null,
  mode: ResponseMode,
  origin: string,
) {
  const session = await auth();
  if (!session?.user) {
    if (mode === "json") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", origin));
  }
  const base = process.env.PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? origin;
  if (!base) {
    return mode === "json"
      ? NextResponse.json(
          { error: "PUBLIC_APP_URL or NEXTAUTH_URL not configured" },
          { status: 500 },
        )
      : accountsErrorRedirect(origin, "PUBLIC_APP_URL / NEXTAUTH_URL не заданы");
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

export async function GET(req: Request) {
  const origin = getRequestOrigin(req);
  return startOAuthFlow(null, "redirect", origin);
}

export async function POST(req: Request) {
  const origin = getRequestOrigin(req);
  const contentType = req.headers.get("content-type") ?? "";

  let body: { clientKey?: string; clientSecret?: string } = {};
  let mode: ResponseMode = "redirect";

  if (contentType.includes("application/json")) {
    mode = "json";
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  } else {
    const fd = await req.formData();
    body = {
      clientKey: fd.get("clientKey")?.toString() ?? "",
      clientSecret: fd.get("clientSecret")?.toString() ?? "",
    };
  }

  const key = body.clientKey?.trim() ?? "";
  const secret = body.clientSecret?.trim() ?? "";
  if (key && secret) {
    return startOAuthFlow({ clientKey: key, clientSecret: secret }, mode, origin);
  }
  if (!key && !secret) {
    return startOAuthFlow(null, mode, origin);
  }
  const err =
    "Укажите оба поля (Client Key и Client Secret) или оставьте пустыми для ключей из .env";
  if (mode === "json") {
    return NextResponse.json({ error: err }, { status: 400 });
  }
  const base = process.env.PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? origin;
  return accountsErrorRedirect(base, err);
}
