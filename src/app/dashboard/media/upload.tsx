"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MediaUpload() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setMsg(null);
    const fd = new FormData(form);
    setLoading(true);
    const res = await fetch("/api/media", { method: "POST", body: fd });
    setLoading(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setMsg(j.error ?? `Ошибка ${res.status}`);
      return;
    }
    form.reset();
    router.refresh();
    setMsg("Файл загружен.");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex max-w-xl flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm shadow-zinc-900/5"
    >
      <label className="text-sm font-medium text-zinc-800">
        Файл (видео или изображение)
        <input
          name="file"
          type="file"
          accept="video/*,image/*"
          required
          className="mt-2 block w-full cursor-pointer text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-800 hover:file:bg-zinc-200"
        />
      </label>
      <label className="text-sm font-medium text-zinc-800">
        Подпись / заголовок (опционально)
        <input
          name="caption"
          type="text"
          className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          placeholder="Текст для поста"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-fit rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Загрузка…" : "Загрузить"}
      </button>
      {msg && (
        <p className="text-sm text-zinc-600" role="status">
          {msg}
        </p>
      )}
    </form>
  );
}
