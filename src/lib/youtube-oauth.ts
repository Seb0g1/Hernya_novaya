import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
];

export function requireGoogleOAuthConfig(): {
  clientId: string;
  clientSecret: string;
} {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
  }
  return { clientId, clientSecret };
}

export function getYoutubeRedirectUri(): string {
  const base = process.env.PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL;
  if (!base) throw new Error("PUBLIC_APP_URL or NEXTAUTH_URL must be set");
  return new URL("/api/youtube/callback", base).toString();
}

export function createOAuth2Client(): OAuth2Client {
  const { clientId, clientSecret } = requireGoogleOAuthConfig();
  return new OAuth2Client(clientId, clientSecret, getYoutubeRedirectUri());
}

export function buildYoutubeAuthorizeUrl(state: string): string {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeYoutubeCode(code: string) {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function fetchAuthorizedChannel(oauth2: OAuth2Client) {
  const youtube = google.youtube({ version: "v3", auth: oauth2 });
  const r = await youtube.channels.list({ part: ["snippet"], mine: true });
  const ch = r.data.items?.[0];
  if (!ch?.id) {
    throw new Error("Канал YouTube не найден для этой учётной записи");
  }
  return {
    channelId: ch.id,
    title: ch.snippet?.title ?? null,
  };
}
