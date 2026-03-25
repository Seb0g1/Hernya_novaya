import { prisma } from "@/lib/prisma";
import { AccountActiveSwitch } from "@/components/account-active-switch";
import Link from "next/link";
import { ConnectTikTokForm } from "./connect-tiktok-form";

function Flash({ ok, err }: { ok?: boolean; err?: string }) {
  if (ok) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-700">✓</span>
        <span>Готово: аккаунт подключён.</span>
      </div>
    );
  }
  if (err) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        {decodeURIComponent(err)}
      </div>
    );
  }
  return null;
}

function TikTokAvatar({
  name,
  url,
}: {
  name: string;
  url: string | null;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white shadow-sm"
      />
    );
  }
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-600 text-lg font-semibold text-white shadow-sm ring-2 ring-white">
      {initial}
    </div>
  );
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; connected?: string }>;
}) {
  const sp = await searchParams;
  const [tiktok, youtube] = await Promise.all([
    prisma.tikTokAccount.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.youtubeAccount.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const baseUrl = process.env.PUBLIC_APP_URL ?? "PUBLIC_APP_URL";

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Аккаунты
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          Подключённые каналы для публикации. Токены хранятся в базе в зашифрованном виде.
        </p>
      </header>

      {(sp.connected || sp.error) && (
        <Flash ok={!!sp.connected} err={sp.error} />
      )}

      <section id="tiktok" className="scroll-mt-8 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                TT
              </span>
              TikTok
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {tiktok.length}
              </span>
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Login Kit + Content Posting API
            </p>
          </div>
        </div>
        <ConnectTikTokForm />

        {tiktok.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 px-6 py-14 text-center">
            <p className="text-sm text-zinc-500">Пока нет подключённых аккаунтов</p>
            <p className="mt-1 text-xs text-zinc-400">
              Нажмите «Подключить» выше и авторизуйтесь в TikTok
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tiktok.map((a) => {
              const title = a.displayName ?? a.openId;
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm shadow-zinc-900/5"
                >
                  <TikTokAvatar name={title} url={a.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900">{title}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-zinc-400">
                      {a.openId}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                      {a.appClientKey ? (
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-indigo-700">
                          своё приложение
                        </span>
                      ) : (
                        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-zinc-600">
                          ключи из .env
                        </span>
                      )}
                      {a.expiresAt && (
                        <span>
                          токен до{" "}
                          {a.expiresAt.toLocaleString("ru-RU", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <AccountActiveSwitch id={a.id} active={a.active} apiPath="/api/accounts" />
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-xs text-zinc-400">
          Redirect URI в{" "}
          <a
            href="https://developers.tiktok.com/"
            className="text-indigo-600 underline decoration-indigo-400/50 underline-offset-2 hover:text-indigo-700"
            target="_blank"
            rel="noreferrer"
          >
            TikTok Developer Portal
          </a>
          :{" "}
          <code className="rounded-lg bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-700">
            {baseUrl}/api/tiktok/callback
          </code>
        </p>
      </section>

      <section id="youtube" className="scroll-mt-8 space-y-4 border-t border-zinc-200/80 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                YT
              </span>
              YouTube
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {youtube.length}
              </span>
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Shorts через YouTube Data API и OAuth Google
            </p>
          </div>
          <a
            href="/api/youtube/connect"
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
          >
            Подключить канал
          </a>
        </div>

        {youtube.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 px-6 py-14 text-center">
            <p className="text-sm text-zinc-500">Пока нет каналов</p>
            <p className="mt-1 text-xs text-zinc-400">
              Подключите Google-аккаунт с выбранным каналом
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {youtube.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm shadow-zinc-900/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-lg font-bold text-white shadow-sm ring-2 ring-white">
                  ▶
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900">
                    {a.channelTitle ?? a.channelId}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-xs text-zinc-400">
                    {a.channelId}
                  </p>
                  {a.expiresAt && (
                    <p className="mt-2 text-xs text-zinc-500">
                      токен до{" "}
                      {a.expiresAt.toLocaleString("ru-RU", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  )}
                </div>
                <AccountActiveSwitch
                  id={a.id}
                  active={a.active}
                  apiPath="/api/youtube/accounts"
                />
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-zinc-400">
          В Google Cloud: YouTube Data API v3, redirect{" "}
          <code className="rounded-lg bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-700">
            {baseUrl}/api/youtube/callback
          </code>
          ·{" "}
          <Link
            href="https://developers.google.com/youtube/v3"
            className="text-indigo-600 underline decoration-indigo-400/50 underline-offset-2 hover:text-indigo-700"
            target="_blank"
            rel="noreferrer"
          >
            Документация
          </Link>
        </p>
      </section>

      <details className="rounded-2xl border border-zinc-200/80 bg-white/80 px-5 py-4 text-sm text-zinc-600 shadow-sm">
        <summary className="cursor-pointer font-medium text-zinc-800">
          Почему OAuth, а не логин и пароль?
        </summary>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
          У TikTok и Google нет поддерживаемого API для публикации по логину/паролю сторонним приложениям.
          OAuth — официальный способ выдать доступ один раз в браузере. Пароли не сохраняются.
        </p>
      </details>
    </div>
  );
}
