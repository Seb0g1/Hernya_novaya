import { prisma } from "@/lib/prisma";
import { decryptString, encryptString } from "@/lib/crypto";
import { createOAuth2Client } from "@/lib/youtube-oauth";

export async function getValidYoutubeOAuth2(
  youtubeAccountId: string,
): Promise<ReturnType<typeof createOAuth2Client>> {
  const acc = await prisma.youtubeAccount.findUniqueOrThrow({
    where: { id: youtubeAccountId },
  });
  const client = createOAuth2Client();
  const access = decryptString(acc.accessToken);
  const refresh = acc.refreshToken ? decryptString(acc.refreshToken) : undefined;
  client.setCredentials({
    access_token: access,
    refresh_token: refresh,
    expiry_date: acc.expiresAt?.getTime(),
  });

  const exp = acc.expiresAt?.getTime() ?? 0;
  if (exp && Date.now() < exp - 60_000) {
    return client;
  }
  if (!refresh) {
    throw new Error("YouTube access expired and no refresh token");
  }
  const { credentials } = await client.refreshAccessToken();
  if (!credentials.access_token) {
    throw new Error("YouTube token refresh failed");
  }
  const newAccess = credentials.access_token;
  const newRefresh = credentials.refresh_token ?? refresh;
  const expiresAt = credentials.expiry_date
    ? new Date(credentials.expiry_date)
    : new Date(Date.now() + 3600 * 1000);

  await prisma.youtubeAccount.update({
    where: { id: youtubeAccountId },
    data: {
      accessToken: encryptString(newAccess),
      refreshToken: encryptString(newRefresh),
      expiresAt,
    },
  });

  client.setCredentials({
    access_token: newAccess,
    refresh_token: newRefresh,
    expiry_date: expiresAt.getTime(),
  });
  return client;
}
