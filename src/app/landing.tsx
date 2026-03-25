import Link from "next/link";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export function LandingPage() {
  return (
    <PublicSiteChrome>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-indigo-600">
          Панель для команд и создателей
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Social Farm
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
          Подключайте аккаунты TikTok и YouTube через официальный OAuth,
          загружайте медиа и ставьте публикации в очередь — без хранения паролей от
          соцсетей.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-zinc-900 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:bg-zinc-800"
          >
            Войти в панель
          </Link>
          <Link
            href="/privacy"
            className="rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300"
          >
            Как мы обрабатываем данные
          </Link>
        </div>

        <ul className="mx-auto mt-16 grid max-w-2xl gap-6 text-left sm:grid-cols-3">
          <li className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              TikTok
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Login Kit и Content Posting API — только официальные методы.
            </p>
          </li>
          <li className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              YouTube
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              OAuth Google, публикация Shorts через разрешённые API.
            </p>
          </li>
          <li className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Безопасность
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Токены шифруются на сервере; доступ к панели по логину администратора.
            </p>
          </li>
        </ul>

        <p className="mt-14 text-xs text-zinc-500">
          Для модерации приложения в TikTok for Developers укажите в настройках
          URL этой страницы как <strong>Web/Desktop URL</strong>, а страницы{" "}
          <Link href="/privacy" className="text-indigo-600 underline">
            /privacy
          </Link>{" "}
          и{" "}
          <Link href="/terms" className="text-indigo-600 underline">
            /terms
          </Link>{" "}
          — как политику конфиденциальности и условия использования.
        </p>
      </div>
    </PublicSiteChrome>
  );
}
