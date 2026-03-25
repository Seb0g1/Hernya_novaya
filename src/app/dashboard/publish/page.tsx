import { prisma } from "@/lib/prisma";
import { MassPublishForm } from "./mass-form";

export default async function PublishPage() {
  const [tiktokAccounts, youtubeAccounts, media] = await Promise.all([
    prisma.tikTokAccount.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, openId: true, displayName: true },
    }),
    prisma.youtubeAccount.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, channelId: true, channelTitle: true },
    }),
    prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, kind: true, caption: true, publicUrl: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Массовая публикация
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          Выберите платформу, аккаунты и файлы. Для каждой пары аккаунт × медиа
          создаётся задача в очереди PostgreSQL (pg-boss).
        </p>
      </header>
      <MassPublishForm
        tiktokAccounts={tiktokAccounts}
        youtubeAccounts={youtubeAccounts}
        media={media}
      />
    </div>
  );
}
