import Link from "next/link";

export function PublicSiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-bg flex min-h-screen flex-col">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
            Social Farm
          </Link>
          <nav className="flex flex-wrap items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-zinc-600 transition hover:text-zinc-900"
            >
              Конфиденциальность
            </Link>
            <Link
              href="/terms"
              className="text-zinc-600 transition hover:text-zinc-900"
            >
              Условия
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-zinc-900 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-zinc-800"
            >
              Войти
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">{children}</main>
      <footer className="border-t border-zinc-200/80 bg-white/60 py-8 text-center text-xs text-zinc-500">
        <p>Social Farm — панель управления публикациями в социальных сетях.</p>
        <p className="mt-2">
          <Link href="/privacy" className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-800">
            Политика конфиденциальности
          </Link>
          {" · "}
          <Link href="/terms" className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-800">
            Условия использования
          </Link>
        </p>
      </footer>
    </div>
  );
}
