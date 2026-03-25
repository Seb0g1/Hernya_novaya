"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type TikTokRow = { id: string; openId: string; displayName: string | null };
type YoutubeRow = {
  id: string;
  channelId: string;
  channelTitle: string | null;
};
type M = { id: string; kind: string; caption: string | null; publicUrl: string };

export function MassPublishForm({
  tiktokAccounts,
  youtubeAccounts,
  media,
}: {
  tiktokAccounts: TikTokRow[];
  youtubeAccounts: YoutubeRow[];
  media: M[];
}) {
  const router = useRouter();
  const [platform, setPlatform] = useState<"TIKTOK" | "YOUTUBE">("TIKTOK");
  const [acc, setAcc] = useState<Record<string, boolean>>({});
  const [med, setMed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const accountIds = Object.entries(acc)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const mediaIds = Object.entries(med)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const mediaForPlatform =
    platform === "YOUTUBE"
      ? media.filter((m) => m.kind === "VIDEO")
      : media;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (accountIds.length === 0 || mediaIds.length === 0) {
      setMsg("Выберите хотя бы один аккаунт и один файл.");
      return;
    }
    if (platform === "YOUTUBE") {
      const selected = media.filter((m) => mediaIds.includes(m.id));
      const nonVideo = selected.filter((m) => m.kind !== "VIDEO");
      if (nonVideo.length > 0) {
        setMsg("YouTube Shorts: можно выбирать только видео.");
        return;
      }
    }
    setLoading(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, accountIds, mediaIds }),
    });
    setLoading(false);
    const j = (await res.json()) as { created?: number; error?: string };
    if (!res.ok) {
      setMsg(j.error ?? "Ошибка");
      return;
    }
    setMsg(`Создано задач: ${j.created ?? 0}`);
    router.push("/dashboard/jobs");
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="inline-flex rounded-xl border border-zinc-200/80 bg-zinc-100/80 p-1">
        <button
          type="button"
          onClick={() => {
            setPlatform("TIKTOK");
            setAcc({});
          }}
          className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
            platform === "TIKTOK"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          TikTok
        </button>
        <button
          type="button"
          onClick={() => {
            setPlatform("YOUTUBE");
            setAcc({});
          }}
          className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
            platform === "YOUTUBE"
              ? "bg-white text-red-700 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          YouTube Shorts
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <fieldset className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm shadow-zinc-900/5">
          <legend className="px-1 text-sm font-medium">
            {platform === "TIKTOK" ? "Аккаунты TikTok" : "Каналы YouTube"}
          </legend>
          {platform === "TIKTOK" &&
            (tiktokAccounts.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">Нет активных аккаунтов.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {tiktokAccounts.map((a) => (
                  <li key={a.id}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!acc[a.id]}
                        onChange={(e) =>
                          setAcc((s) => ({ ...s, [a.id]: e.target.checked }))
                        }
                      />
                      <span>{a.displayName ?? a.openId}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ))}
          {platform === "YOUTUBE" &&
            (youtubeAccounts.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">Нет активных каналов.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {youtubeAccounts.map((a) => (
                  <li key={a.id}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!acc[a.id]}
                        onChange={(e) =>
                          setAcc((s) => ({ ...s, [a.id]: e.target.checked }))
                        }
                      />
                      <span>{a.channelTitle ?? a.channelId}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ))}
        </fieldset>
        <fieldset className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm shadow-zinc-900/5">
          <legend className="px-1 text-sm font-medium">Медиа</legend>
          {platform === "YOUTUBE" && (
            <p className="mb-2 text-xs text-amber-800">
              Shorts: только видеофайлы (вертикальные, до ~60 с — как рекомендует
              YouTube).
            </p>
          )}
          {mediaForPlatform.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {platform === "YOUTUBE"
                ? "Нет видео в медиатеке."
                : "Медиатека пуста."}
            </p>
          ) : (
            <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">
              {mediaForPlatform.map((m) => (
                <li key={m.id}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={!!med[m.id]}
                      onChange={(e) =>
                        setMed((s) => ({ ...s, [m.id]: e.target.checked }))
                      }
                    />
                    <span>
                      <span className="font-medium">{m.kind}</span>
                      {m.caption && ` — ${m.caption}`}
                      <span className="block truncate text-xs text-zinc-500">
                        {m.publicUrl}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Постановка…" : "Поставить в очередь"}
        </button>
        {msg && (
          <p className="mt-3 text-sm text-zinc-600" role="status">
            {msg}
          </p>
        )}
      </div>
    </form>
  );
}
