import { prisma } from "@/lib/prisma";
import { MediaUpload } from "./upload";

export default async function MediaPage() {
  const items = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Медиатека</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          Загрузите видео или фото. Публичный URL должен быть доступен TikTok (HTTPS и
          домен из настроек приложения).
        </p>
      </header>
      <MediaUpload />
      <ul className="space-y-2">
        {items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 px-6 py-12 text-center text-sm text-zinc-500">
            Пока нет файлов.
          </li>
        )}
        {items.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 text-sm shadow-sm shadow-zinc-900/5"
          >
            <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
              {m.kind}
            </span>
            <a
              href={m.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate text-indigo-600 underline decoration-indigo-400/40 underline-offset-2 hover:text-indigo-800"
            >
              {m.publicUrl}
            </a>
            {m.caption && (
              <span className="text-zinc-600">«{m.caption}»</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
