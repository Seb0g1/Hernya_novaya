import { prisma } from "@/lib/prisma";
import { decryptString, encryptString } from "@/lib/crypto";
import { getCredentialsForTikTokAccount } from "@/lib/tiktok-credentials";
import { refreshAccessToken } from "@/lib/tiktok";

export async function getValidAccessToken(accountId: string): Promise<string> {
  const acc = await prisma.tikTokAccount.findUniqueOrThrow({
    where: { id: accountId },
  });
  let access = decryptString(acc.accessToken);
  const now = Date.now();
  const expires = acc.expiresAt?.getTime() ?? 0;
  if (expires && now < expires - 60_000) {
    return access;
  }
  if (!acc.refreshToken) {
    throw new Error("Access token expired and no refresh token");
  }
  const refresh = decryptString(acc.refreshToken);
  const appCreds = getCredentialsForTikTokAccount(acc);
  const next = await refreshAccessToken(refresh, appCreds);
  access = next.access_token;
  const encryptedAccess = encryptString(access);
  const encryptedRefresh = next.refresh_token
    ? encryptString(next.refresh_token)
    : acc.refreshToken;
  const expiresAt = new Date(
    Date.now() + (next.expires_in ?? 86400) * 1000,
  );
  await prisma.tikTokAccount.update({
    where: { id: accountId },
    data: {
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      expiresAt,
      scope: next.scope ?? acc.scope,
    },
  });
  return access;
}
