"use client";

/**
 * Обычная HTML-форма POST → сервер отдаёт 302 на TikTok.
 * Без fetch — нет «ответа 0» из-за opaque redirect / расширений / кэша.
 */
export function ConnectTikTokForm() {
  return (
    <form
      action="/api/tiktok/connect"
      method="POST"
      className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm shadow-zinc-900/5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Подключить TikTok</h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-500">
            OAuth в браузере. По умолчанию берутся ключи из{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] text-zinc-700">
              .env
            </code>
            .
          </p>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
        >
          Подключить
        </button>
      </div>
      <details className="group mt-4 border-t border-zinc-100 pt-4">
        <summary className="cursor-pointer list-none text-xs font-medium text-zinc-600">
          <span className="inline-flex items-center gap-1.5">
            Свои ключи приложения
            <span className="text-zinc-400">— опционально</span>
            <svg
              className="h-4 w-4 text-zinc-400 transition group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-zinc-700">
            Client Key
            <input
              name="clientKey"
              type="text"
              autoComplete="off"
              defaultValue=""
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Из TikTok Developer Portal"
            />
          </label>
          <label className="block text-xs font-medium text-zinc-700">
            Client Secret
            <input
              name="clientSecret"
              type="password"
              autoComplete="new-password"
              defaultValue=""
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Секрет приложения"
            />
          </label>
        </div>
      </details>
    </form>
  );
}
