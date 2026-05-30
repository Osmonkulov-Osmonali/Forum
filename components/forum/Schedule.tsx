"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Session = {
  id: string;
  time: string;
  title: string;
  speaker: string;
  speakerRole: string;
  description: string;
  type: "talk" | "break" | "workshop";
};

const hall1: Session[] = [
  {
    id: "h1-1",
    time: "09:00 – 09:45",
    title: "Открытие. Форум как точка сборки индустрии",
    speaker: "Александр Петров",
    speakerRole: "CEO, TechVision",
    description:
      "Вступительное слово организаторов и ключевых партнёров. Обзор повестки форума, главные темы двух дней. Почему именно сейчас важно собираться вместе — взгляд на состояние рынка и вызовы, которые объединяют всех участников.",
    type: "talk",
  },
  {
    id: "h1-2",
    time: "10:00 – 10:50",
    title: "Будущее AI в бизнесе: от пилотов к системным изменениям",
    speaker: "Александр Петров",
    speakerRole: "CEO, TechVision",
    description:
      "Как компании переходят от экспериментов с ИИ к реальному внедрению в ключевые процессы. Разбор кейсов из производства, финансов и логистики. Что мешает масштабированию и как преодолеть организационные барьеры.",
    type: "talk",
  },
  {
    id: "h1-3",
    time: "11:00 – 11:15",
    title: "Кофе-пауза",
    speaker: "",
    speakerRole: "",
    description: "Нетворкинг в фойе, демо-зона партнёров.",
    type: "break",
  },
  {
    id: "h1-4",
    time: "11:15 – 12:00",
    title: "Data-driven культура: как решения перестают быть интуитивными",
    speaker: "Елена Козлова",
    speakerRole: "VP Engineering, DataFlow",
    description:
      "Переход от управления по ощущениям к управлению по данным — это прежде всего культурный сдвиг. Как выстраивать аналитическую инфраструктуру, формировать навыки команды и создавать среду, где данные действительно влияют на решения.",
    type: "talk",
  },
  {
    id: "h1-5",
    time: "12:15 – 13:00",
    title: "Кибербезопасность как конкурентное преимущество",
    speaker: "Сергей Морозов",
    speakerRole: "Директор, CyberShield",
    description:
      "Безопасность перестала быть просто статьёй затрат — компании, которые делают её частью ценностного предложения, получают доверие клиентов и доступ к enterprise-сегменту. Как выстроить зрелую программу безопасности без избыточных издержек.",
    type: "talk",
  },
  {
    id: "h1-6",
    time: "13:00 – 14:00",
    title: "Обед",
    speaker: "",
    speakerRole: "",
    description: "Обеденный перерыв. Неформальные встречи с партнёрами.",
    type: "break",
  },
  {
    id: "h1-7",
    time: "14:00 – 14:50",
    title: "Продуктовая стратегия в условиях неопределённости",
    speaker: "Анна Смирнова",
    speakerRole: "Head of Product, FinTech Pro",
    description:
      "Как строить продуктовые roadmap, когда рынок меняется быстрее планов. Принципы гибкой стратегии, инструменты prioritization и подходы к discovery, которые работают в реальных условиях, а не только в учебниках.",
    type: "talk",
  },
  {
    id: "h1-8",
    time: "15:00 – 15:50",
    title: "Инвестиции в deep tech: почему сейчас и куда смотреть",
    speaker: "Павел Кузнецов",
    speakerRole: "Partner, Venture Capital",
    description:
      "Обзор инвестиционного климата в AI, biotech и climate tech. Где формируются следующие крупные компании и какие сигналы ищут фонды на ранних стадиях. Практические советы для стартапов, готовящихся к привлечению финансирования.",
    type: "talk",
  },
  {
    id: "h1-9",
    time: "16:00 – 16:50",
    title: "Панельная дискуссия: технологии и человек",
    speaker: "Несколько спикеров",
    speakerRole: "Модерация: Мария Иванова",
    description:
      "Открытая дискуссия о том, как автоматизация меняет рынок труда, что значит быть специалистом в эпоху LLM-ассистентов, и как компаниям готовить команды к трансформациям. Вопросы из зала приветствуются.",
    type: "talk",
  },
  {
    id: "h1-10",
    time: "17:00 – 18:00",
    title: "Нетворкинг-сессия. Закрытие первого дня",
    speaker: "",
    speakerRole: "",
    description:
      "Коктейльный нетворкинг. Живая музыка, демо-зона, неформальное общение с командами спикеров.",
    type: "break",
  },
];

const hall2: Session[] = [
  {
    id: "h2-1",
    time: "09:00 – 09:30",
    title: "Регистрация участников",
    speaker: "",
    speakerRole: "",
    description: "Выдача бейджей, Welcome-пакеты, ознакомление с площадкой.",
    type: "break",
  },
  {
    id: "h2-2",
    time: "10:00 – 10:50",
    title: "Воркшоп: Дизайн-система за один день",
    speaker: "Артём Лебедев",
    speakerRole: "Lead Designer, Studio X",
    description:
      "Практическая сессия: как с нуля выстроить базовую дизайн-систему для продуктовой команды. Участники разберут структуру токенов, принципы компонентной библиотеки и процесс её поддержки. Нужен ноутбук с Figma.",
    type: "workshop",
  },
  {
    id: "h2-3",
    time: "11:15 – 12:00",
    title: "EdTech: как учиться быстрее в эпоху информационного шума",
    speaker: "Максим Громов",
    speakerRole: "Founder, EduTech",
    description:
      "Новые модели корпоративного обучения, microlearning и роль AI-тьюторов. Как компании внедряют культуру непрерывного развития и измеряют её влияние на бизнес-результат.",
    type: "talk",
  },
  {
    id: "h2-4",
    time: "12:15 – 13:00",
    title: "ESG без воды: как встроить устойчивость в P&L",
    speaker: "Кирилл Захаров",
    speakerRole: "Director, GreenEnergy",
    description:
      "Практический взгляд на ESG-трансформацию: от декларативных отчётов к реальным метрикам. Кейсы компаний, которые сделали устойчивость источником роста, а не обременением.",
    type: "talk",
  },
  {
    id: "h2-5",
    time: "13:00 – 14:00",
    title: "Обед",
    speaker: "",
    speakerRole: "",
    description: "Обеденный перерыв. Неформальные встречи с партнёрами.",
    type: "break",
  },
  {
    id: "h2-6",
    time: "14:00 – 14:50",
    title: "Воркшоп: Операционные метрики, которые реально работают",
    speaker: "Виктория Орлова",
    speakerRole: "COO, LogiChain",
    description:
      "Практическая сессия по построению операционного дашборда. Как выбрать 5–7 ключевых метрик для вашего типа бизнеса, как сделать их понятными для всей команды и как связать с финансовыми результатами.",
    type: "workshop",
  },
  {
    id: "h2-7",
    time: "15:00 – 15:50",
    title: "B2B-продажи в 2025: что изменилось и что работает",
    speaker: "Юлия Романова",
    speakerRole: "Head of Sales, SaaS Global",
    description:
      "Современный enterprise-покупатель изменился — он больше исследует самостоятельно, позже выходит на диалог и требует большей ценности от каждого касания. Как адаптировать продажи, выстраивать доверие и сокращать цикл сделки.",
    type: "talk",
  },
  {
    id: "h2-8",
    time: "16:00 – 16:50",
    title: "Культура как продукт: как HR становится стратегическим активом",
    speaker: "Татьяна Белова",
    speakerRole: "HR Director, PeopleFirst",
    description:
      "Как выстраивать корпоративную культуру осознанно: от формулировки ценностей до их встраивания в процессы найма, онбординга и оценки. Практические инструменты для команд от 50 до 5000 человек.",
    type: "talk",
  },
  {
    id: "h2-9",
    time: "17:00 – 17:50",
    title: "Маркетинг через сообщество: от аудитории к комьюнити",
    speaker: "Ольга Новикова",
    speakerRole: "CMO, BrandLab",
    description:
      "Бренды, которые строят живые сообщества, получают не просто лояльность — они получают армию амбассадоров. Как запустить и удержать комьюнити, монетизировать его без потери доверия и масштабировать.",
    type: "talk",
  },
  {
    id: "h2-10",
    time: "18:00 – 18:30",
    title: "Итоговая Q&A-сессия",
    speaker: "Все спикеры зала 2",
    speakerRole: "",
    description:
      "Открытый диалог: вопросы участников всем спикерам зала. Лучшие вопросы — в прямой эфир.",
    type: "talk",
  },
];

const TYPE_STYLES: Record<Session["type"], string> = {
  talk: "bg-accent-secondary/20 text-accent-primary",
  workshop: "bg-accent-primary/20 text-accent-primary",
  break: "bg-muted text-muted-foreground",
};

const TYPE_LABELS: Record<Session["type"], string> = {
  talk: "Доклад",
  workshop: "Воркшоп",
  break: "Перерыв",
};

function SessionRow({
  session,
  isOpen,
  onToggle,
}: {
  session: Session;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const isBreak = session.type === "break";

  return (
    <div className="border-b border-[#E2E8F0] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "group flex w-full items-start gap-4 px-6 py-5 text-left transition-colors duration-150 sm:gap-6",
          isBreak
            ? "cursor-default hover:bg-transparent"
            : "hover:bg-background-secondary"
        )}
        disabled={isBreak}
      >
        <span className="w-28 shrink-0 pt-0.5 font-sans text-xs tabular-nums text-muted-foreground sm:text-sm">
          {session.time}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide",
                TYPE_STYLES[session.type]
              )}
            >
              {TYPE_LABELS[session.type]}
            </span>
          </div>
          <p
            className={cn(
              "mt-1.5 font-sans text-sm font-medium sm:text-base",
              isBreak ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {session.title}
          </p>
          {session.speaker && (
            <p className="mt-0.5 font-sans text-xs text-muted-foreground sm:text-sm">
              {session.speaker}
              {session.speakerRole && (
                <span className="text-muted-foreground/60">
                  {" "}
                  · {session.speakerRole}
                </span>
              )}
            </p>
          )}
        </div>

        {!isBreak && (
          <ChevronDown
            className={cn(
              "mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && !isBreak && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#E2E8F0] px-6 pb-6 pt-4 pl-[calc(1.5rem+7rem+1.5rem)] sm:pl-[calc(1.5rem+7rem+1.5rem)]">
              <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                {session.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const HALLS = [
  { id: "hall1", label: "Зал 1", sessions: hall1 },
  { id: "hall2", label: "Зал 2", sessions: hall2 },
] as const;

export function Schedule() {
  const [activeHall, setActiveHall] = useState<"hall1" | "hall2">("hall1");
  const [openId, setOpenId] = useState<string | null>(null);

  const sessions =
    activeHall === "hall1" ? HALLS[0].sessions : HALLS[1].sessions;

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <section id="schedule" className="bg-background-secondary px-6 py-28 lg:py-36">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12">
          <span className="mb-5 block font-sans text-sm font-medium uppercase tracking-[0.2em] text-accent-primary">
            Программа
          </span>
          <h2 className="mb-2 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Расписание форума
          </h2>
          <p className="font-sans text-base text-muted-foreground">
            15–16 октября 2025 · Москва, Конгресс-центр
          </p>
        </div>

        {/* Табы */}
        <div className="relative mb-8 flex gap-0 border-b border-[#E2E8F0]">
          {HALLS.map((hall) => (
            <button
              key={hall.id}
              type="button"
              onClick={() => {
                setActiveHall(hall.id);
                setOpenId(null);
              }}
              className={cn(
                "relative px-6 py-3 font-sans text-sm font-medium transition-colors duration-150",
                activeHall === hall.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {hall.label}
              {activeHall === hall.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-accent-secondary"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Список сессий */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeHall}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border border-[#E2E8F0] bg-background"
          >
            {sessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                isOpen={openId === session.id}
                onToggle={() => toggle(session.id)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
