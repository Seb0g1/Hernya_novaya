import { prisma } from "@/lib/prisma";

export default async function DashboardHome() {
  const [tiktok, youtube, media, jobsPending, jobsFailed] = await Promise.all([
    prisma.tikTokAccount.count(),
    prisma.youtubeAccount.count(),
    prisma.mediaAsset.count(),
    prisma.publishJob.count({ where: { status: "PENDING" } }),
    prisma.publishJob.count({ where: { status: "FAILED" } }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Обзор</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
          Очередь на PostgreSQL (pg-boss). Worker:{" "}
          <code className="rounded-lg bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-700">
            npm run worker
          </code>
        </p>
      </header>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="TikTok" value={tiktok} accent="from-pink-500/20 to-rose-500/10" />
        <Stat label="YouTube" value={youtube} accent="from-red-500/20 to-red-600/10" />
        <Stat label="Медиа" value={media} accent="from-violet-500/15 to-indigo-500/10" />
        <Stat label="В очереди" value={jobsPending} accent="from-amber-500/15 to-yellow-500/10" />
        <Stat label="Ошибок" value={jobsFailed} accent="from-red-600/15 to-orange-500/10" />
      </dl>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm shadow-zinc-900/5`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 ${accent}`}
        aria-hidden
      />
      <dt className="relative text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </dt>
      <dd className="relative mt-2 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
        {value}
      </dd>
    </div>
  );
}
