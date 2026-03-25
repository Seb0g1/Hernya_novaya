#!/usr/bin/env node
/**
 * Печатает DATABASE_URL с правильным URL-кодированием логина и пароля.
 *
 * Примеры:
 *   node scripts/encode-db-url.mjs postgres "мой_пароль"
 *   node scripts/encode-db-url.mjs postgres "мой_пароль" tiktok_farm
 *   node scripts/encode-db-url.mjs "CGJ-Ge-90" "пароль_от_этого_пользователя"
 */
const [, , user, password, database = "tiktok_farm", host = "127.0.0.1", port = "5432"] =
  process.argv;

if (!user || !password) {
  console.error(`
Использование:
  node scripts/encode-db-url.mjs <пользователь_PostgreSQL> <пароль> [имя_базы]

Скопируйте вывод в .env как одну строку:
  DATABASE_URL="..."
`);
  process.exit(1);
}

const u = encodeURIComponent(user);
const p = encodeURIComponent(password);
const db = encodeURIComponent(database);
console.log(
  `postgresql://${u}:${p}@${host}:${port}/${db}?schema=public`,
);
