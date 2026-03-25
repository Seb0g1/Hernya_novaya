export type TikTokAppCredentials = {
  clientKey: string;
  clientSecret: string;
};

/** Глобальные ключи приложения из .env (одно приложение на всю панель). */
export function getTikTokCredentialsFromEnv(): TikTokAppCredentials | null {
  const key = process.env.TIKTOK_CLIENT_KEY?.trim();
  const secret = process.env.TIKTOK_CLIENT_SECRET?.trim();
  if (!key || !secret) return null;
  return { clientKey: key, clientSecret: secret };
}

export function requireTikTokConfig(): TikTokAppCredentials {
  const c = getTikTokCredentialsFromEnv();
  if (!c) {
    throw new Error(
      "TIKTOK_CLIENT_KEY и TIKTOK_CLIENT_SECRET не заданы в .env (или укажите ключи при добавлении аккаунта).",
    );
  }
  return c;
}
