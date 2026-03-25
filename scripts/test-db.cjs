/**
 * Проверяет DATABASE_URL из .env (без Prisma).
 * Запуск: node scripts/test-db.cjs
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { Client } = require("pg");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("В .env нет DATABASE_URL.");
  process.exit(1);
}

async function main() {
  const c = new Client({ connectionString: url });
  try {
    await c.connect();
    const r = await c.query("SELECT current_user, current_database()");
    console.log("Подключение OK.");
    console.log("Пользователь:", r.rows[0].current_user);
    console.log("База:", r.rows[0].current_database);
  } catch (e) {
    console.error("\nОшибка подключения:", e.message);
    console.error(`
Что сделать:
1. Откройте pgAdmin → подключитесь к серверу (тот пароль — и нужен в DATABASE_URL).
2. Соберите строку без ошибок в спецсимволах:
   npm run db:url -- postgres "ТОЧНЫЙ_ПАРОЛЬ_ИЗ_PGADMIN"
3. Вставьте вывод в .env в DATABASE_URL="..."
4. Если в pgAdmin пользователь не postgres, укажите его в команде db:url первым аргументом.
`);
    process.exit(1);
  } finally {
    await c.end().catch(() => {});
  }
}

main();
