import {
  requireTikTokConfig,
  type TikTokAppCredentials,
} from "@/lib/env";

export type { TikTokAppCredentials } from "@/lib/env";

function resolveAppCredentials(
  creds?: TikTokAppCredentials,
): TikTokAppCredentials {
  if (creds) return creds;
  return requireTikTokConfig();
}

const TIKTOK_AUTH = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const API_BASE = "https://open.tiktokapis.com";

/** Совпадайте с разделом Scopes в портале (иначе ошибка «scope» при входе). */
export const TIKTOK_SCOPES = [
  "user.info.basic",
  "video.upload",
].join(",");

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_token?: string;
  refresh_expires_in?: number;
  scope?: string;
  token_type?: string;
};

export function buildAuthorizeUrl(
  state: string,
  redirectUri: string,
  creds?: TikTokAppCredentials,
): string {
  const { clientKey } = resolveAppCredentials(creds);
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: TIKTOK_SCOPES,
    redirect_uri: redirectUri,
    state,
  });
  return `${TIKTOK_AUTH}?${params.toString()}`;
}

export async function exchangeCode(
  code: string,
  redirectUri: string,
  creds?: TikTokAppCredentials,
): Promise<TokenResponse> {
  const { clientKey, clientSecret } = resolveAppCredentials(creds);
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const json = (await res.json()) as {
    access_token?: string;
    error?: string;
    description?: string;
    message?: string;
    data?: TokenResponse;
  };
  if (!res.ok) {
    throw new Error(
      json.description ??
        json.message ??
        json.error ??
        `Token exchange failed: ${res.status}`,
    );
  }
  const data = (json.data ?? json) as TokenResponse;
  if (!data.access_token || !data.open_id) {
    throw new Error("Invalid token response from TikTok");
  }
  return data;
}

export async function refreshAccessToken(
  refreshToken: string,
  creds?: TikTokAppCredentials,
): Promise<TokenResponse> {
  const { clientKey, clientSecret } = resolveAppCredentials(creds);
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const json = (await res.json()) as {
    access_token?: string;
    error?: string;
    description?: string;
    data?: TokenResponse;
  };
  if (!res.ok) {
    throw new Error(
      json.description ?? json.error ?? `Token refresh failed: ${res.status}`,
    );
  }
  const data = (json.data ?? json) as TokenResponse;
  if (!data.access_token) {
    throw new Error("Invalid refresh response from TikTok");
  }
  return data;
}

export async function fetchTikTokUserProfile(accessToken: string): Promise<{
  displayName?: string;
  avatarUrl?: string;
}> {
  const url = new URL(`${API_BASE}/v2/user/info/`);
  url.searchParams.set(
    "fields",
    "open_id,union_id,avatar_url,display_name",
  );
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = (await res.json()) as {
    data?: { user?: { display_name?: string; avatar_url?: string } };
  };
  const u = json.data?.user;
  return {
    displayName: u?.display_name,
    avatarUrl: u?.avatar_url,
  };
}

export function parsePostInitResponse(json: unknown): {
  publishId?: string;
  error?: string;
} {
  const j = json as {
    data?: { publish_id?: string };
    error?: { code?: string; message?: string };
  };
  const code = j.error?.code;
  if (code && code !== "ok") {
    return { error: j.error?.message ?? code };
  }
  const id = j.data?.publish_id;
  if (id) return { publishId: id };
  return { error: j.error?.message ?? "Unexpected TikTok post response" };
}

export async function queryCreatorInfo(accessToken: string): Promise<unknown> {
  const res = await fetch(
    `${API_BASE}/v2/post/publish/creator_info/query/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: "{}",
    },
  );
  return res.json();
}

export async function initVideoFromUrl(
  accessToken: string,
  params: {
    videoUrl: string;
    title: string;
    privacyLevel: string;
  },
): Promise<{ publish_id?: string; error?: { message?: string } }> {
  const body = {
    post_info: {
      title: params.title,
      privacy_level: params.privacyLevel,
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
    },
    source_info: {
      source: "PULL_FROM_URL",
      video_url: params.videoUrl,
    },
  };
  const res = await fetch(`${API_BASE}/v2/post/publish/video/init/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function initPhotoFromUrls(
  accessToken: string,
  params: {
    imageUrls: string[];
    title: string;
    privacyLevel: string;
  },
): Promise<{ publish_id?: string; error?: { message?: string } }> {
  const body = {
    post_info: {
      title: params.title,
      privacy_level: params.privacyLevel,
      disable_comment: false,
    },
    source_info: {
      source: "PULL_FROM_URL",
      photo_images: params.imageUrls,
      photo_cover_index: 0,
    },
    post_mode: "DIRECT_POST",
    media_type: "PHOTO",
  };
  const res = await fetch(`${API_BASE}/v2/post/publish/content/init/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

/** Pick a privacy level from creator_info response; fallback for sandbox */
export function defaultPrivacyFromCreatorInfo(info: unknown): string {
  const o = info as {
    data?: {
      privacy_level_options?: string[];
      max_video_post_duration_sec?: number;
    };
  };
  const opts = o?.data?.privacy_level_options;
  if (Array.isArray(opts) && opts.length > 0) {
    if (opts.includes("PUBLIC_TO_EVERYONE")) return "PUBLIC_TO_EVERYONE";
    return opts[0]!;
  }
  return "SELF_ONLY";
}
