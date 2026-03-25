import { prisma } from "@/lib/prisma";
import { RetryJob } from "./retry";

export default async function JobsPage() {
  const jobs = await prisma.publishJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      tiktokAccount: { select: { openId: true, displayName: true } },
      youtubeAccount: { select: { channelId: true, channelTitle: true } },
      media: { select: { kind: true, publicUrl: true } },
    },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Задачи публикации
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Очередь в PostgreSQL (pg-boss). Worker:{" "}
          <code className="rounded-lg bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-700">
            npm run worker
          </code>
        </p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-900/5">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              <th className="px-4 py-3 font-medium text-zinc-700">Платформа</th>
              <th className="px-4 py-3 font-medium text-zinc-700">Статус</th>
              <th className="px-4 py-3 font-medium text-zinc-700">Аккаунт</th>
              <th className="px-4 py-3 font-medium text-zinc-700">Медиа</th>
              <th className="px-4 py-3 font-medium text-zinc-700">ID публикации</th>
              <th className="px-4 py-3 font-medium text-zinc-700">Ошибка</th>
              <th className="px-4 py-3 font-medium text-zinc-700" />
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-zinc-500"
                >
                  Задач пока нет.
                </td>
              </tr>
            )}
            {jobs.map((j) => (
              <tr key={j.id} className="border-b border-zinc-50 transition hover:bg-zinc-50/50">
                <td className="px-4 py-2.5 font-mono text-xs text-zinc-600">{j.platform}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-zinc-600">{j.status}</td>
                <td className="px-4 py-2.5">
                  {j.platform === "TIKTOK" &&
                    (j.tiktokAccount?.displayName ?? j.tiktokAccount?.openId)}
                  {j.platform === "YOUTUBE" &&
                    (j.youtubeAccount?.channelTitle ?? j.youtubeAccount?.channelId)}
                </td>
                <td className="max-w-[200px] truncate px-4 py-2.5">
                  {j.media.kind}
                </td>
                <td className="max-w-[140px] truncate px-4 py-2.5 font-mono text-xs">
                  {j.tiktokPublishId ?? j.youtubeVideoId ?? "—"}
                </td>
                <td className="max-w-[240px] truncate px-4 py-2.5 text-red-700">
                  {j.errorMessage ?? "—"}
                </td>
                <td className="px-4 py-2.5">
                  {j.status === "FAILED" && <RetryJob id={j.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
