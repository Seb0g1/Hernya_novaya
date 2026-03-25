import type { Metadata } from "next";
import Link from "next/link";
import { PublicSiteChrome } from "@/components/public-site-chrome";

export const metadata: Metadata = {
  title: "Условия использования — Social Farm",
  description:
    "Правила использования веб-панели Social Farm для публикации в TikTok и YouTube.",
};

const UPDATED = "2025-03-25";

export default function TermsPage() {
  return (
    <PublicSiteChrome>
      <article className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Условия использования
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Дата последнего обновления: {UPDATED}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-700">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">1. Предмет</h2>
            <p>
              <strong>Social Farm</strong> — веб-приложение для управления
              подключёнными аккаунтами TikTok и YouTube и постановкой задач
              публикации контента через официальные программные интерфейсы (API)
              указанных платформ. Используя Сервис, вы соглашаетесь с настоящими
              условиями.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">2. Допустимое использование</h2>
            <p>Сервис предназначен только для законной деятельности. Запрещается:</p>
            <ul className="list-inside list-disc space-y-2 pl-1">
              <li>нарушать правила TikTok, Google/YouTube и применимое законодательство;</li>
              <li>публиковать контент без прав на него, вводящий в заблуждение или запрещённый платформами;</li>
              <li>использовать Сервис для рассылки спама, автоматизации злоупотреблений или обхода ограничений платформ;</li>
              <li>передавать учётные данные панели третьим лицам без контроля со стороны оператора.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">3. Аккаунты и OAuth</h2>
            <p>
              Подключение аккаунтов TikTok и YouTube выполняется только через
              официальный процесс OAuth на стороне соответствующей платформы.
              Пользователь самостоятельно подтверждает объём доступа (scopes).
              Оператор Сервиса не гарантирует одобрение приложения в кабинетах
              разработчика TikTok/Google — это зона ответственности владельца
              развёртывания.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">4. Доступность и отказ от гарантий</h2>
            <p>
              Сервис предоставляется «как есть». Работа API TikTok и Google может
              изменяться; возможны перерывы по техническим причинам. Оператор не
              несёт ответственности за решения модерации платформ, блокировки
              аккаунтов или отклонение контента, если это следует из правил
              соцсетей.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">5. Ограничение ответственности</h2>
            <p>
              В максимально допустимом законом объёме оператор не отвечает за
              косвенные убытки, упущенную выгоду или потерю данных вследствие
              сбоев третьих сторон (хостинг, API соцсетей), кроме случаев,
              когда иное прямо предусмотрено законом.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">6. Изменение условий</h2>
            <p>
              Условия могут обновляться. Продолжая использовать Сервис после
              публикации новой версии на странице{" "}
              <Link href="/terms" className="text-indigo-600 underline">
                /terms
              </Link>
              , вы принимаете актуальную редакцию.
            </p>
          </section>
        </div>
      </article>
    </PublicSiteChrome>
  );
}
