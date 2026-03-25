"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const sp = useSearchParams();
  const err = sp.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      if (res.error === "CredentialsSignin") {
        setLocalError(
          "Неверный email или пароль — или приложение не может подключиться к PostgreSQL (тогда в БД нет пользователя admin). Откройте /api/health в dev и проверьте DATABASE_URL.",
        );
      } else {
        setLocalError(`Ошибка: ${res.error}`);
      }
      return;
    }
    if (res?.ok) {
      window.location.href = res.url ?? "/dashboard";
    }
  }

  return (
    <div className="dashboard-bg flex min-h-[70vh] flex-col justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-900/5">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900">
        Social Farm
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        Вход в панель управления аккаунтами и публикациями.
      </p>
      {err && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err === "Configuration"
            ? "Ошибка конфигурации сервера (секрет сессии). Задайте AUTH_SECRET и NEXTAUTH_SECRET в .env и перезапустите dev-сервер."
            : err === "CredentialsSignin"
              ? "Неверный email или пароль."
              : `Ошибка входа (${err}).`}
        </p>
      )}
      {localError && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {localError}
        </p>
      )}
      <p className="mb-4 text-xs text-zinc-500">
        После <code className="rounded bg-zinc-100 px-1">npm run db:seed</code> по
        умолчанию:{" "}
        <strong>
          admin@example.com
        </strong>{" "}
        / пароль из <code className="rounded bg-zinc-100 px-1">ADMIN_PASSWORD</code> в{" "}
        <code className="rounded bg-zinc-100 px-1">.env</code>.{" "}
        <Link href="/api/health" className="text-blue-600 underline">
          Проверка БД (только dev)
        </Link>
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-800">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-zinc-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            autoComplete="username"
            placeholder="admin@example.com"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-800">
          Пароль
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-zinc-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Вход…" : "Войти"}
        </button>
      </form>
      </div>
      <p className="mx-auto mt-8 max-w-md text-center text-xs text-zinc-500">
        <Link href="/" className="text-indigo-600 hover:underline">
          На главную
        </Link>
        {" · "}
        <Link href="/privacy" className="hover:text-zinc-800">
          Конфиденциальность
        </Link>
        {" · "}
        <Link href="/terms" className="hover:text-zinc-800">
          Условия
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8">Загрузка…</div>}>
      <LoginForm />
    </Suspense>
  );
}
