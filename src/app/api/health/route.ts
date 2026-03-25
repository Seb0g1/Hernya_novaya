import { NextResponse } from "next/server";

/** Части DATABASE_URL без пароля — чтобы сверить с pgAdmin. */
function parseDatabaseUrlDisplay(raw: string | undefined) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const db = u.pathname.replace(/^\//, "").split("?")[0] || null;
    return {
      user: u.username || null,
      host: u.hostname || null,
      port: u.port || "5432",
      database: db,
    };
  } catch {
    return { parseError: true as const };
  }
}

/** Только для разработки: проверка БД и наличия админа. */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    const adminCount = await prisma.adminUser.count();
    const emails = await prisma.adminUser.findMany({
      select: { email: true },
      take: 5,
    });
    return NextResponse.json({
      database: "ok",
      adminUsers: adminCount,
      adminEmails: emails.map((e) => e.email),
      hint:
        adminCount === 0
          ? "В БД нет админа. Выполните: npm run db:seed"
          : "Вход: email и пароль из ADMIN_EMAIL / ADMIN_PASSWORD в .env (после seed).",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const fromEnv = parseDatabaseUrlDisplay(process.env.DATABASE_URL);
    return NextResponse.json(
      {
        database: "error",
        message: msg,
        connectionFromEnv: fromEnv,
        hint:
          "Сервер PostgreSQL отклонил пароль в DATABASE_URL (это не пароль от сайта). В pgAdmin откройте свойства сервера и проверьте пароль. Соберите строку: npm run db:url -- postgres \"ПАРОЛЬ_ИЗ_PGADMIN\" и вставьте в .env. Проверка: npm run db:test",
        steps: [
          "1) В pgAdmin: тот же пользователь и пароль, что в DATABASE_URL (сейчас user/host см. connectionFromEnv).",
          "2) npm run db:url -- postgres \"ваш_пароль\" → скопировать вывод в DATABASE_URL.",
          "3) npm run db:test → должно быть «Подключение OK».",
          "4) npx prisma db push && npm run db:seed",
        ],
      },
      { status: 503 },
    );
  }
}
