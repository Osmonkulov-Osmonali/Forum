"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Speaker = {
  id: number;
  name: string;
  role: string;
  topic: string;
  bio: string;
  photo: string;
};

const speakers: Speaker[] = [
  {
    id: 1,
    name: "Александр Петров",
    role: "CEO, TechVision",
    topic: "Будущее AI в бизнесе",
    bio: "15 лет в технологическом предпринимательстве. Строит продукты на стыке машинного обучения и корпоративных процессов.",
    photo: "https://i.pravatar.cc/600?img=11",
  },
  {
    id: 2,
    name: "Мария Иванова",
    role: "Директор по инновациям, Global Corp",
    topic: "Цифровая трансформация",
    bio: "Руководит трансформацией крупнейших B2B-компаний в Европе и СНГ. Эксперт по change management.",
    photo: "https://i.pravatar.cc/600?img=5",
  },
  {
    id: 3,
    name: "Дмитрий Сидоров",
    role: "Основатель, StartupHub",
    topic: "Экосистема стартапов",
    bio: "Инвестор и ментор более 40 стартапов. Создал акселератор, который вырос в региональный хаб.",
    photo: "https://i.pravatar.cc/600?img=12",
  },
  {
    id: 4,
    name: "Елена Козлова",
    role: "VP Engineering, DataFlow",
    topic: "Data-driven подход",
    bio: "Специализируется на построении аналитических платформ и культуры принятия решений на основе данных.",
    photo: "https://i.pravatar.cc/600?img=9",
  },
  {
    id: 5,
    name: "Игорь Волков",
    role: "CTO, CloudScale",
    topic: "Облачная инфраструктура",
    bio: "Архитектор распределённых систем. Помогает enterprise-командам масштабировать продукты без потери скорости.",
    photo: "https://i.pravatar.cc/600?img=15",
  },
  {
    id: 6,
    name: "Анна Смирнова",
    role: "Head of Product, FinTech Pro",
    topic: "Продуктовая стратегия",
    bio: "Запустила 12 финтех-продуктов с нуля. Фокус — unit-экономика и customer discovery.",
    photo: "https://i.pravatar.cc/600?img=47",
  },
  {
    id: 7,
    name: "Сергей Морозов",
    role: "Директор, CyberShield",
    topic: "Кибербезопасность",
    bio: "Консультирует банки и госсектор по защите критической инфраструктуры и реагированию на инциденты.",
    photo: "https://i.pravatar.cc/600?img=13",
  },
  {
    id: 8,
    name: "Ольга Новикова",
    role: "CMO, BrandLab",
    topic: "Маркетинг нового поколения",
    bio: "Строит бренды через контент, community и performance. Спикер международных маркетинговых конференций.",
    photo: "https://i.pravatar.cc/600?img=32",
  },
  {
    id: 9,
    name: "Павел Кузнецов",
    role: "Partner, Venture Capital",
    topic: "Инвестиции в deep tech",
    bio: "Инвестирует в AI, biotech и climate tech. Бывший инженер, понимает продукт на уровне команды.",
    photo: "https://i.pravatar.cc/600?img=14",
  },
  {
    id: 10,
    name: "Татьяна Белова",
    role: "HR Director, PeopleFirst",
    topic: "Культура и лидерство",
    bio: "Разрабатывает программы лидерского развития для компаний от 500 до 10 000 сотрудников.",
    photo: "https://i.pravatar.cc/600?img=44",
  },
  {
    id: 11,
    name: "Артём Лебедев",
    role: "Lead Designer, Studio X",
    topic: "Дизайн-системы",
    bio: "Создаёт масштабируемые дизайн-системы для продуктовых команд. Эксперт по UX-исследованиям.",
    photo: "https://i.pravatar.cc/600?img=52",
  },
  {
    id: 12,
    name: "Виктория Орлова",
    role: "COO, LogiChain",
    topic: "Операционная эффективность",
    bio: "Оптимизировала supply chain для ритейла и e-commerce. Специалист по lean-процессам.",
    photo: "https://i.pravatar.cc/600?img=23",
  },
  {
    id: 13,
    name: "Максим Громов",
    role: "Founder, EduTech",
    topic: "EdTech и будущее обучения",
    bio: "Строит платформы корпоративного обучения. Верит в lifelong learning как конкурентное преимущество.",
    photo: "https://i.pravatar.cc/600?img=57",
  },
  {
    id: 14,
    name: "Наталья Фёдорова",
    role: "Chief Data Officer, RetailMax",
    topic: "Big Data в ритейле",
    bio: "Внедряет предиктивную аналитику в сети из 2000+ магазинов. PhD в прикладной математике.",
    photo: "https://i.pravatar.cc/600?img=38",
  },
  {
    id: 15,
    name: "Кирилл Захаров",
    role: "Director, GreenEnergy",
    topic: "Устойчивое развитие",
    bio: "Развивает ESG-стратегии и проекты возобновляемой энергетики для промышленных компаний.",
    photo: "https://i.pravatar.cc/600?img=60",
  },
  {
    id: 16,
    name: "Юлия Романова",
    role: "Head of Sales, SaaS Global",
    topic: "B2B-продажи",
    bio: "Построила отдел продаж с нуля до $50M ARR. Менторит команды по enterprise sales.",
    photo: "https://i.pravatar.cc/600?img=48",
  },
];

export function Speakers() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  return (
    <section id="speakers" className="bg-background px-4 py-12 md:px-8 md:py-24 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 lg:mb-16">
          <span className="mb-4 block text-sm font-medium uppercase tracking-wider text-accent-primary">
            Спикеры
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-5xl">
            16 экспертов форума
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {speakers.map((speaker) => (
            <button
              key={speaker.id}
              type="button"
              onClick={() => setSelectedSpeaker(speaker)}
              className="group cursor-pointer bg-background text-left transition-colors hover:bg-background-secondary"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={speaker.photo}
                  alt={speaker.name}
                  className="size-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                />
              </div>
              <div className="border-t border-border p-4">
                <h3 className="mb-1 text-sm font-semibold text-foreground sm:text-base">
                  {speaker.name}
                </h3>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {speaker.role}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog
        open={selectedSpeaker !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSpeaker(null);
        }}
      >
        {selectedSpeaker && (
          <DialogContent className="max-w-lg rounded-none sm:max-w-xl">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={selectedSpeaker.photo}
                alt={selectedSpeaker.name}
                className="size-full object-cover"
              />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">
                {selectedSpeaker.name}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {selectedSpeaker.role}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-accent-primary">
                  Тема выступления
                </p>
                <p className="text-foreground">{selectedSpeaker.topic}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-accent-primary">
                  О спикере
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selectedSpeaker.bio}
                </p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
