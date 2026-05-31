"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TICKETON_REGISTRATION_URL } from "@/config/links";

type UtmParams = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
};

type Tier = {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  options: string[];
  featured: boolean;
  href: string;
  utm: UtmParams;
};

function buildUrl(href: string, utm: UtmParams): string {
  const url = new URL(href);
  if (utm.source) url.searchParams.set("utm_source", utm.source);
  if (utm.medium) url.searchParams.set("utm_medium", utm.medium);
  if (utm.campaign) url.searchParams.set("utm_campaign", utm.campaign);
  if (utm.content) url.searchParams.set("utm_content", utm.content);
  return url.toString();
}

const tiers: Tier[] = [
  {
    id: "standard",
    name: "Standard",
    price: 15000,
    currency: "₽",
    period: "за участника",
    description: "Всё необходимое для погружения в программу форума.",
    options: [
      "Доступ ко всем докладам",
      "Материалы спикеров",
      "Кофе-паузы и обеды",
      "Сертификат участника",
      "Доступ к записям (30 дней)",
    ],
    featured: false,
    href: TICKETON_REGISTRATION_URL,
    utm: { source: "landing", medium: "button", campaign: "forum2026", content: "standard" },
  },
  {
    id: "business",
    name: "Business",
    price: 35000,
    currency: "₽",
    period: "за участника",
    description: "Расширенный доступ и нетворкинг с ключевыми игроками.",
    options: [
      "Всё из Standard",
      "Закрытые воркшопы",
      "VIP-ужин со спикерами",
      "Приоритетная регистрация",
      "Доступ к записям (бессрочно)",
      "Место в первых рядах",
    ],
    featured: true,
    href: TICKETON_REGISTRATION_URL,
    utm: { source: "landing", medium: "button", campaign: "forum2026", content: "business" },
  },
  {
    id: "vip",
    name: "VIP",
    price: 75000,
    currency: "₽",
    period: "за участника",
    description: "Максимальное погружение и прямой доступ к спикерам.",
    options: [
      "Всё из Business",
      "Персональный менеджер",
      "Закрытые встречи 1:1 со спикерами",
      "Брендирование в программе",
      "Доступ в закрытое комьюнити",
      "Трансфер и размещение",
    ],
    featured: false,
    href: TICKETON_REGISTRATION_URL,
    utm: { source: "landing", medium: "button", campaign: "forum2026", content: "vip" },
  },
];

export function Tickets() {
  return (
    <section id="tickets" className="bg-background px-4 py-12 md:px-8 md:py-24 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 md:mb-14 lg:mb-18">
          <span className="mb-5 block font-sans text-sm font-medium uppercase tracking-[0.2em] text-accent-primary">
            Билеты
          </span>
          <h2 className="mb-3 max-w-xl font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-5xl">
            Выберите тариф
          </h2>
          <p className="font-sans text-base text-muted-foreground">
            Ранняя птица действует до 1 сентября 2026
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:gap-6">
          {tiers.map((tier) => (
            /*
              whileHover: lift + shadow (only fires on pointer devices via Framer Motion's
              internal pointer detection — no hover state sticking on touch).
              whileTap: micro-scale + border glow for tap feedback.
            */
            <motion.div
              key={tier.id}
              className={cn(
                "group relative flex flex-col border",
                tier.featured
                  ? "border-accent-secondary shadow-[0_0_0_1px_#A2D2FF]"
                  : "border-[#E2E8F0]"
              )}
              whileHover={{
                y: -3,
                boxShadow: "0 8px 32px -8px rgba(142,202,230,0.35)",
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              whileTap={{
                scale: 0.98,
                boxShadow: "0 0 0 2px rgba(142,202,230,0.55)",
                transition: { duration: 0.12 },
              }}
            >
              {tier.featured && (
                <div className="bg-accent-secondary px-4 py-1.5 text-center font-sans text-[11px] font-semibold uppercase tracking-wider text-foreground">
                  Популярный выбор
                </div>
              )}

              <div className="flex flex-1 flex-col p-5 md:p-7 lg:p-8">
                {/* Шапка */}
                <div className="mb-6 border-b border-[#E2E8F0] pb-6">
                  <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {tier.name}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-sans text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
                      {tier.price.toLocaleString("ru-RU")}
                    </span>
                    <span className="font-sans text-xl font-medium text-foreground">
                      {tier.currency}
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-xs text-muted-foreground">
                    {tier.period}
                  </p>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
                    {tier.description}
                  </p>
                </div>

                {/* Список опций */}
                <ul className="mb-8 flex-1 space-y-3">
                  {tier.options.map((option) => (
                    <li key={option} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                          tier.featured
                            ? "bg-accent-secondary/30 text-accent-primary"
                            : "bg-[#E2E8F0] text-muted-foreground"
                        )}
                      >
                        <Check className="size-2.5 stroke-[2.5]" />
                      </span>
                      <span className="font-sans text-sm leading-snug text-foreground">
                        {option}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Кнопка-ссылка */}
                <a
                  href={buildUrl(tier.href, tier.utm)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "block w-full border py-3 text-center font-sans text-sm font-medium",
                    "transition-all duration-200",
                    tier.featured
                      ? "border-accent-secondary bg-transparent text-foreground [@media(hover:hover)]:hover:bg-accent-secondary"
                      : "border-accent-primary bg-transparent text-foreground [@media(hover:hover)]:hover:bg-accent-primary"
                  )}
                >
                  Выбрать
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 font-sans text-xs text-muted-foreground/70">
          Корпоративные тарифы для команд от 5 человек —{" "}
          <a
            href="mailto:tickets@forum2026.ru"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            пишите нам
          </a>
          .
        </p>
      </div>
    </section>
  );
}
