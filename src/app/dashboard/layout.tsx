import { auth, signOut } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardNav } from "./dashboard-nav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="dashboard-bg flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-white/5 bg-slate-950 text-slate-300">
        <div className="border-b border-white/5 px-5 py-6">
          <Link href="/dashboard" className="block">
            <span className="text-lg font-semibold tracking-tight text-white">
              Social Farm
            </span>
            <span className="mt-0.5 block text-xs font-medium text-slate-500">
              панель публикаций
            </span>
          </Link>
        </div>
        <DashboardNav />
        <div className="mt-auto border-t border-white/5 p-4">
          <p className="truncate px-2 text-xs text-slate-500" title={session.user.email ?? ""}>
            {session.user.email}
          </p>
          <form
            className="mt-3"
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Выйти
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl px-6 py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
