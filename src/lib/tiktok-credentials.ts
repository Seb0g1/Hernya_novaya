import type { TikTokAccount } from "@prisma/client";
import { decryptString } from "@/lib/crypto";
import { getTikTokCredentialsFromEnv, type TikTokAppCredentials } from "@/lib/env";

export type { TikTokAppCredentials } from "@/lib/env";

/** Ключи API для аккаунта: свои или из .env */
export function getCredentialsForTikTokAccount(
  acc: Pick<TikTokAccount, "appClientKey" | "appClientSecret">,
): TikTokAppCredentials {
  if (acc.appClientKey?.trim() && acc.appClientSecret?.trim()) {
    return {
      clientKey: acc.appClientKey.trim(),
      clientSecret: decryptString(acc.appClientSecret),
    };
  }
  const fromEnv = getTikTokCredentialsFromEnv();
  if (!fromEnv) {
    throw new Error(
      "Нет ключей TikTok: задайте TIKTOK_CLIENT_KEY/SECRET в .env или подключите аккаунт со своими ключами приложения.",
    );
  }
  return fromEnv;
}
