# Social Farm — TikTok (OAuth) + YouTube Shorts

Панель для привязки аккаунтов и массовой постановки публикаций в очередь. Очередь реализована на **PostgreSQL** через [pg-boss](https://github.com/timgit/pg-boss) (Redis не нужен).

## Требования

- **Node.js** 22.12+ (для pg-boss)
- **PostgreSQL** 13+ локально на Windows (или удалённо)
- Ключи **TikTok** ([developers.tiktok.com](https://developers.tiktok.com/)) и **Google** (OAuth + [YouTube Data API v3](https://developers.google.com/youtube/v3))

### PostgreSQL без Docker

1. Установите PostgreSQL для Windows с официального сайта.
2. Создайте базу, например: `CREATE DATABASE tiktok_farm;`
3. Укажите `DATABASE_URL` в `.env` или `.env.local` (логин/пароль как у вашего пользователя postgres).

Файл должен называться **`.env`** или **`.env.local`** (с точкой в начале). Имя `env.local` без точки Next.js не подхватывает.

## Настройка

1. Скопируйте `.env.example` в `.env`, заполните `DATABASE_URL`, `ENCRYPTION_KEY`, `NEXTAUTH_SECRET`.
2. `npm install`
3. `npx prisma db push`
4. `npm run db:seed` — создаётся админ (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
5. В Google Cloud: OAuth consent + **YouTube Data API v3** + redirect `https://ваш-домен/api/youtube/callback` (для localhost: `http://localhost:3000/api/youtube/callback`).
6. В TikTok Developer Portal: redirect `http://localhost:3000/api/tiktok/callback` (или ваш публичный URL).

## Запуск

Два терминала:

```bash
npm run dev
```

```bash
npm run worker
```

Worker обрабатывает очередь публикаций в PostgreSQL.

## Поведение

- **TikTok:** только официальный **OAuth** (логин/пароль от TikTok в API для публикации не поддерживаются платформой).
- **YouTube:** OAuth Google, загрузка **видео** в канал как Shorts (в заголовок добавляется `#Shorts`; для отображения в Shorts соблюдайте требования YouTube к длительности и формату).

## Сборка

```bash
npm run build
npm start
```

(Worker в проде запускайте отдельным процессом: `npm run worker`.)
