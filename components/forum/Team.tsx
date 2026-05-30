"use client";

type Member = {
  id: string;
  name: string;
  role: string;
  photo: string;
};

const team: Member[] = [
  {
    id: "t1",
    name: "Никита Волков",
    role: "Продюсер форума",
    photo: "https://i.pravatar.cc/600?img=68",
  },
  {
    id: "t2",
    name: "Дарья Орлова",
    role: "Руководитель программы",
    photo: "https://i.pravatar.cc/600?img=47",
  },
  {
    id: "t3",
    name: "Илья Зайцев",
    role: "Технический директор",
    photo: "https://i.pravatar.cc/600?img=69",
  },
  {
    id: "t4",
    name: "Полина Крылова",
    role: "PR и коммуникации",
    photo: "https://i.pravatar.cc/600?img=49",
  },
  {
    id: "t5",
    name: "Роман Щербаков",
    role: "Партнёрские отношения",
    photo: "https://i.pravatar.cc/600?img=65",
  },
  {
    id: "t6",
    name: "Анастасия Фомина",
    role: "Маркетинг и рост",
    photo: "https://i.pravatar.cc/600?img=45",
  },
  {
    id: "t7",
    name: "Владимир Тихонов",
    role: "Операционный менеджер",
    photo: "https://i.pravatar.cc/600?img=70",
  },
  {
    id: "t8",
    name: "Ксения Павлова",
    role: "Дизайн и бренд",
    photo: "https://i.pravatar.cc/600?img=44",
  },
];

export function Team() {
  return (
    <section className="bg-background-secondary px-4 py-12 md:px-8 md:py-24 lg:py-36">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:mb-16">
          <div>
            <span className="mb-5 block font-sans text-sm font-medium uppercase tracking-[0.2em] text-accent-primary">
              Команда
            </span>
            <h2 className="max-w-xs font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-5xl">
              Кто делает форум
            </h2>
          </div>
          <p className="max-w-sm font-sans text-sm leading-relaxed text-muted-foreground sm:text-right">
            Восемь человек, которые превращают идею
            в опыт, запоминающийся на годы.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-px bg-[#E2E8F0] sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div
              key={member.id}
              className="group relative overflow-hidden bg-background-secondary"
            >
              {/* Photo */}
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={member.photo}
                  alt={member.name}
                  draggable={false}
                  className="
                    size-full object-cover
                    transition-all duration-700 ease-out
                    [filter:grayscale(100%)_brightness(0.92)_saturate(0)_sepia(0.08)]
                    group-hover:[filter:grayscale(0%)_brightness(1)_saturate(1.1)_sepia(0)]
                    group-hover:scale-[1.03]
                  "
                />
              </div>

              {/* Name / role strip */}
              <div className="border-t border-[#E2E8F0] bg-background-secondary px-4 py-4">
                <p className="font-sans text-sm font-semibold text-foreground sm:text-base">
                  {member.name}
                </p>
                <p className="mt-0.5 font-sans text-xs text-muted-foreground sm:text-sm">
                  {member.role}
                </p>
              </div>

              {/* Accent bar — slides in from left on hover */}
              <div
                className="
                  absolute inset-x-0 bottom-0 h-0.5
                  origin-left scale-x-0 bg-accent-secondary
                  transition-transform duration-500 ease-out
                  group-hover:scale-x-100
                "
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
