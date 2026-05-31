"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SubItem = {
  time: string;
  label: string;
  isQA?: boolean;
};

type Session = {
  id: string;
  time: string;
  title: string;
  speaker: string;
  speakerRole: string;
  description: string;
  subItems?: SubItem[];
  type: "talk" | "break" | "workshop" | "entertainment" | "staff";
};

const sessions: Session[] = [
  {
    id: "s-1",
    time: "09:00–11:00",
    title: "Подготовка площадки",
    speaker: "",
    speakerRole: "",
    description:
      "Команда организаторов прибывает и разворачивает площадку: мебель, декор, брендинг, регистрационные стойки. Техническая проверка звука, AV-оборудования и слайдов со спикерами.",
    type: "staff",
  },
  {
    id: "s-2",
    time: "11:00–12:00",
    title: "Конкурс эссе",
    speaker: "",
    speakerRole: "",
    description:
      "Конкурс «Самые креативные истории». За день до форума публикуются анонсы конкурса — участник с наиболее креативными историями получает призы от спонсоров мероприятия.",
    type: "entertainment",
  },
  {
    id: "s-3",
    time: "11:50–12:40",
    title: "Регистрация",
    speaker: "",
    speakerRole: "",
    description:
      "Участники проходят регистрацию, получают билеты и фотографируются в фотозоне. Волонтёры встречают гостей и выдают welcome-материалы.",
    type: "break",
  },
  {
    id: "s-4",
    time: "12:40–12:50",
    title: "Открытие программы",
    speaker: "",
    speakerRole: "",
    description:
      "Официальное открытие Study free forum. Ведущий приветствует участников, представляет спикеров и объявляет программу дня.",
    type: "talk",
  },
  {
    id: "s-5",
    time: "12:50–14:00",
    title: "БЛОК 1 — Внеклассные активности",
    speaker: "",
    speakerRole: "",
    description:
      "Конкурс «Принеси мне»: выбираем 10 волонтёров (5 девушек и 5 ребят) — они должны принести предмет, который называет спикер. Победитель получает подарок. Реклама Future Leaders Academy.",
    subItems: [
      { time: "12:50–13:25", label: "Спикер / Панельная дискуссия — Внеклассные активности" },
      { time: "13:25–14:00", label: "Спикер / Панельная дискуссия — Летние программы" },
    ],
    type: "talk",
  },
  {
    id: "s-6",
    time: "14:10–15:20",
    title: "БЛОК 2 — Университеты (часть 1)",
    speaker: "Amirtay Beksultanov · Adiz Duyshekeev",
    speakerRole: "Спикеры форума",
    description: "",
    subItems: [
      { time: "14:10–14:45", label: "Amirtay Beksultanov — Выступление + Q&A" },
      { time: "14:45–15:20", label: "Adiz Duyshekeev — Выступление + Q&A" },
    ],
    type: "talk",
  },
  {
    id: "s-7",
    time: "15:20–16:30",
    title: "Перерыв",
    speaker: "",
    speakerRole: "",
    description:
      "Платные консультации и обед со спикерами. Участники могут лично пообщаться с выступающими в неформальной обстановке.",
    type: "break",
  },
  {
    id: "s-8",
    time: "16:30–17:40",
    title: "БЛОК 2 — Университеты (часть 2)",
    speaker: "Спикер по Европе · Akbarova Kamila",
    speakerRole: "Спикеры форума",
    description: "",
    subItems: [
      { time: "16:30–17:05", label: "Спикер по Европе — Выступление + Q&A" },
      { time: "17:05–17:40", label: "Akbarova Kamila — Выступление + Q&A" },
    ],
    type: "talk",
  },
  {
    id: "s-9",
    time: "17:40–18:40",
    title: "БЛОК 3 — Экзамены (IELTS, SAT и др.)",
    speaker: "Kanatbekov Adil · Arazberdiev Artur",
    speakerRole: "Спикеры форума",
    description: "",
    subItems: [
      { time: "17:40–18:10", label: "Kanatbekov Adil — Выступление + Q&A" },
      { time: "18:10–18:40", label: "Arazberdiev Artur — Выступление + Q&A" },
    ],
    type: "talk",
  },
  {
    id: "s-10",
    time: "18:40–18:50",
    title: "Конкурс Kahoot",
    speaker: "",
    speakerRole: "",
    description:
      "Викторина Kahoot по всей программе форума: 8 минут на игру + 2 минуты на награждение победителей (1-е, 2-е и 3-е место).",
    type: "entertainment",
  },
  {
    id: "s-11",
    time: "18:50–18:55",
    title: "Реклама Future Leaders Academy",
    speaker: "",
    speakerRole: "",
    description:
      "Анонс будущих программ и мероприятий Future Leaders Academy для всех участников.",
    type: "staff",
  },
  {
    id: "s-12",
    time: "18:55–19:00",
    title: "Закрытие программы",
    speaker: "",
    speakerRole: "",
    description:
      "Заключительное слово организаторов. Благодарность спикерам, спонсорам и участникам. Официальное завершение Study free forum.",
    type: "talk",
  },
];

const TYPE_STYLES: Record<Session["type"], string> = {
  talk:          "bg-accent-secondary/20 text-accent-primary",
  workshop:      "bg-accent-primary/20 text-accent-primary",
  break:         "bg-muted text-muted-foreground",
  entertainment: "bg-[#FEF3C7] text-[#92400E]",
  staff:         "bg-[#F1F5F9] text-[#64748B]",
};

const TYPE_LABELS: Record<Session["type"], string> = {
  talk:          "Блок",
  workshop:      "Воркшоп",
  break:         "Перерыв",
  entertainment: "Активность",
  staff:         "Орг",
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
  const hasContent =
    !!session.description || (session.subItems && session.subItems.length > 0);
  const isDimmed = session.type === "staff";

  return (
    <div className="border-b border-[#E2E8F0] last:border-b-0">
      <button
        type="button"
        onClick={hasContent ? onToggle : undefined}
        aria-expanded={hasContent ? isOpen : undefined}
        className={cn(
          "group flex w-full items-start gap-3 px-4 py-4 text-left transition-colors duration-150 sm:gap-6 sm:px-6 sm:py-5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-inset",
          hasContent
            ? "[@media(hover:hover)]:hover:bg-background-secondary"
            : "cursor-default"
        )}
        disabled={!hasContent}
      >
        {/* Time */}
        <span className="w-24 shrink-0 pt-0.5 font-sans text-xs tabular-nums text-muted-foreground sm:w-32 sm:text-sm">
          {session.time}
        </span>

        {/* Content */}
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
              isDimmed ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {session.title}
          </p>
          {session.speaker && (
            <p className="mt-0.5 font-sans text-xs text-muted-foreground sm:text-sm">
              {session.speaker}
              {session.speakerRole && (
                <span className="text-muted-foreground/60">
                  {" "}· {session.speakerRole}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Chevron */}
        {hasContent && (
          <ChevronDown
            className={cn(
              "mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {isOpen && hasContent && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#E2E8F0] px-4 pb-5 pt-4 sm:pl-[calc(1.5rem+8rem+1.5rem)] sm:px-6">

              {/* Sub-schedule items */}
              {session.subItems && session.subItems.length > 0 && (
                <ul className="mb-3 space-y-3 sm:space-y-1.5">
                  {session.subItems.map((item) => (
                    <li
                      key={item.time}
                      className={cn(
                        "flex flex-col gap-0.5 font-sans text-xs sm:flex-row sm:items-baseline sm:gap-3 sm:text-sm",
                        item.isQA
                          ? "text-muted-foreground/70"
                          : "text-foreground"
                      )}
                    >
                      {/* Time — small label above on mobile, fixed-width column on sm+ */}
                      <span className="tabular-nums text-muted-foreground/60 sm:w-28 sm:shrink-0">
                        {item.time}
                      </span>
                      <span className="leading-snug">{item.label}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Description text */}
              {session.description && (
                <p
                  className={cn(
                    "font-sans text-sm leading-relaxed text-muted-foreground",
                    session.subItems && session.subItems.length > 0 &&
                      "mt-3 border-t border-[#E2E8F0] pt-3"
                  )}
                >
                  {session.description}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Schedule() {
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <section id="schedule" className="bg-background-secondary px-4 py-12 md:px-8 md:py-24 lg:py-36">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 md:mb-12">
          <span className="mb-5 block font-sans text-sm font-medium uppercase tracking-[0.2em] text-accent-primary">
            Программа
          </span>
          <h2 className="mb-2 font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-5xl">
            Расписание форума
          </h2>
          <p className="font-sans text-base text-muted-foreground">
            2026 · Бишкек, Технопарк
          </p>
        </div>

        {/* Session list */}
        <div className="overflow-hidden border border-[#E2E8F0] bg-background">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              isOpen={openId === session.id}
              onToggle={() => toggle(session.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
