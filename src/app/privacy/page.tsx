import type { Metadata } from "next";
import Link from "next/link";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Social Farm",
  description:
    "Как Social Farm обрабатывает данные при использовании TikTok, YouTube и веб-панели.",
};

const UPDATED = "2025-03-25";

export default function PrivacyPage() {
  return (
    <PublicSiteChrome>
      <article className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Политика конфиденциальности
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Дата последнего обновления: {UPDATED}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-700">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">1. Общие положения</h2>
            <p>
              Настоящая политика описывает, как веб-приложение{" "}
              <strong>Social Farm</strong> (далее — «Сервис») обрабатывает
              персональные и связанные с аккаунтами данные при работе через
              официальные API TikTok и Google/YouTube и при использовании панели
              администратора.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">2. Кто является оператором</h2>
            <p>
              Оператором Сервиса является лицо или организация, на которую
              зарегистрировано развёртывание данного экземпляра приложения (ваш
              домен и контактные данные указываются владельцем при публикации
              сайта). Пользователи Сервиса — уполномоченные сотрудники
              (администраторы), прошедшие вход по email и паролю.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">
              3. Какие данные обрабатываются
            </h2>
            <ul className="list-inside list-disc space-y-2 pl-1">
              <li>
                <strong>Учётная запись администратора:</strong> адрес электронной
                почты и данные сессии, необходимые для безопасного входа в панель.
              </li>
              <li>
                <strong>TikTok (официальный OAuth):</strong> после согласия
                пользователя TikTok передаёт идентификаторы и токены доступа в
                рамках выбранных разрешений (scopes). Могут отображаться имя
                профиля и аватар, если они предоставлены API.
              </li>
              <li>
                <strong>YouTube / Google (официальный OAuth):</strong> идентификатор
                канала, название канала и токены доступа в рамках выбранных
                разрешений.
              </li>
              <li>
                <strong>Медиафайлы и метаданные:</strong> файлы, загруженные в
                Сервис для публикации (например, видео, изображения), подписи к
                публикациям, технические метаданные (тип файла, URL хранения).
              </li>
              <li>
                <strong>Журналы задач:</strong> статусы публикаций и сообщения об
                ошибках, необходимые для работы очереди и поддержки.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">
              4. Хранение и защита токенов
            </h2>
            <p>
              Токены доступа к TikTok и YouTube хранятся на сервере в зашифрованном
              виде. Передача данных с браузера на сервер осуществляется по
              протоколу HTTPS. Сервис не запрашивает и не хранит пароли от
              аккаунтов TikTok или Google — авторизация выполняется только через
              официальные страницы OAuth соответствующих платформ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">5. Цели обработки</h2>
            <p>Данные используются исключительно для:</p>
            <ul className="list-inside list-disc space-y-2 pl-1">
              <li>подключения и отключения аккаунтов социальных сетей в панели;</li>
              <li>постановки и выполнения задач публикации контента через официальные API;</li>
              <li>отображения статусов и диагностики ошибок для администраторов;</li>
              <li>обеспечения безопасности входа в панель управления.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">
              6. Передача третьим лицам
            </h2>
            <p>
              Сервис не продаёт персональные данные. Обмен данными происходит только
              с инфраструктурой, необходимой для работы приложения (хостинг,
              база данных на сервере владельца) и с официальными API TikTok и
              Google в объёме, требуемом для выбранных функций.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">7. Права пользователей</h2>
            <p>
              Администратор может запросить удаление своей учётной записи у
              оператора развёртывания. Пользователи социальных сетей могут отозвать
              доступ к своему аккаунту в настройках TikTok/Google и отключить
              аккаунт в панели Social Farm.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">8. Изменения</h2>
            <p>
              Политика может обновляться при изменении функциональности Сервиса.
              Актуальная версия всегда доступна по адресу{" "}
              <Link href="/privacy" className="text-indigo-600 underline">
                /privacy
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">9. Контакты</h2>
            <p>
              Вопросы по обработке данных направляйте оператору вашего экземпляра
              Сервиса (контактный email укажите на странице «О сервисе» или в
              подвале вашего сайта при развёртывании).
            </p>
          </section>
        </div>
      </article>
    </PublicSiteChrome>
  );
}
