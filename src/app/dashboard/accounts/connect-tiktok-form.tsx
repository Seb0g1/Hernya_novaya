"use client";

import { useState } from "react";

export function ConnectTikTokForm() {
  const [clientKey, setClientKey] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setError(null);
    setLoading(true);
    const k = clientKey.trim();
    const s = clientSecret.trim();
    const useEnv = !k && !s;
    if (!useEnv && (!k || !s)) {
      setError("Заполните оба поля или откройте «Свои ключи» и оставьте пустым для .env");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/tiktok/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          useEnv ? {} : { clientKey: k, clientSecret: s },
        ),
        credentials: "same-origin",
        cache: "no-store",
      });
      const raw = await res.text();
      let j: { url?: string; error?: string } = {};
      try {
        j = raw ? (JSON.parse(raw) as typeof j) : {};
      } catch {
        setError(
          res.status === 500
            ? "Сервер вернул не JSON. Проверьте логи PM2 и что выполнен git pull + npm run build."
            : `Ответ сервера не JSON (${res.status}). Обновите страницу (Ctrl+F5).`,
        );
        return;
      }
      if (res.ok && j.url) {
        window.location.href = j.url;
        return;
      }
      if (j.error) {
        setError(j.error);
        return;
      }
      if (res.status === 0 || !res.status) {
        setError(
          "Нет ответа (код 0). Обычно это старый кэш JS или сбой сети — сделайте жёсткое обновление (Ctrl+Shift+R) и убедитесь, что на сервере: git pull, npm run build, pm2 restart.",
        );
        return;
      }
      setError(`Ошибка ${res.status}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Сеть");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm shadow-zinc-900/5">
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
          type="button"
          disabled={loading}
          onClick={() => void connect()}
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Переход…" : "Подключить"}
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
              type="text"
              autoComplete="off"
              value={clientKey}
              onChange={(e) => setClientKey(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Из TikTok Developer Portal"
            />
          </label>
          <label className="block text-xs font-medium text-zinc-700">
            Client Secret
            <input
              type="password"
              autoComplete="new-password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Секрет приложения"
            />
          </label>
        </div>
      </details>
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
