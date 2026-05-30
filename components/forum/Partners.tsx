"use client";

import { cn } from "@/lib/utils";

type Partner = {
  id: string;
  name: string;
  tier: "gold" | "silver" | "media";
  /** SVG-строка или URL изображения. Если не указан — рендерим текстовый логотип */
  logo?: string;
  href: string;
};

const partners: Partner[] = [
  { id: "p1",  name: "TechVision",     tier: "gold",   href: "#" },
  { id: "p2",  name: "Global Corp",    tier: "gold",   href: "#" },
  { id: "p3",  name: "CloudScale",     tier: "gold",   href: "#" },
  { id: "p4",  name: "DataFlow",       tier: "silver", href: "#" },
  { id: "p5",  name: "FinTech Pro",    tier: "silver", href: "#" },
  { id: "p6",  name: "CyberShield",    tier: "silver", href: "#" },
  { id: "p7",  name: "StartupHub",     tier: "silver", href: "#" },
  { id: "p8",  name: "BrandLab",       tier: "media",  href: "#" },
  { id: "p9",  name: "EduTech",        tier: "media",  href: "#" },
  { id: "p10", name: "GreenEnergy",    tier: "media",  href: "#" },
  { id: "p11", name: "LogiChain",      tier: "silver", href: "#" },
  { id: "p12", name: "PeopleFirst",    tier: "media",  href: "#" },
];

const TIER_COLOR: Record<Partner["tier"], string> = {
  gold:   "text-amber-500",
  silver: "text-slate-500",
  media:  "text-sky-500",
};

const TIER_LABEL: Record<Partner["tier"], string> = {
  gold:   "Генеральный партнёр",
  silver: "Партнёр",
  media:  "Медиапартнёр",
};

function LogoCard({ partner }: { partner: Partner }) {
  return (
    <a
      href={partner.href}
      target="_blank"
      rel="noopener noreferrer"
      title={`${TIER_LABEL[partner.tier]}: ${partner.name}`}
      className={cn(
        "group mx-6 flex shrink-0 items-center justify-center",
        "h-14 min-w-[9rem] rounded-none border border-[#E2E8F0] px-6",
        "grayscale transition-all duration-500 hover:grayscale-0",
        "opacity-50 hover:opacity-100",
        "bg-background hover:border-accent-primary/40",
      )}
    >
      {partner.logo ? (
        <img
          src={partner.logo}
          alt={partner.name}
          className="h-7 w-auto object-contain"
          draggable={false}
        />
      ) : (
        <span
          className={cn(
            "select-none whitespace-nowrap font-sans text-sm font-semibold tracking-tight",
            "text-foreground/40 transition-colors duration-500",
            `group-hover:${TIER_COLOR[partner.tier]}`,
          )}
        >
          {partner.name}
        </span>
      )}
    </a>
  );
}

export function Partners() {
  const doubled = [...partners, ...partners];

  return (
    <section className="overflow-hidden border-y border-[#E2E8F0] bg-background py-16">
      <div className="mx-auto mb-10 max-w-6xl px-6">
        <span className="block font-sans text-sm font-medium uppercase tracking-[0.2em] text-accent-primary">
          Партнёры и спонсоры
        </span>
      </div>

      {/* Marquee wrapper — приостанавливается при ховере на дорожку */}
      <div
        className="group/track relative flex"
        /* маски слева и справа для плавного fade */
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div className="flex animate-marquee group-hover/track:[animation-play-state:paused]">
          {doubled.map((partner, i) => (
            <LogoCard key={`${partner.id}-${i}`} partner={partner} />
          ))}
        </div>
        {/* Второй трек — дублирует первый для бесшовного склеивания */}
        <div
          className="absolute left-0 flex animate-marquee group-hover/track:[animation-play-state:paused]"
          aria-hidden
        >
          {doubled.map((partner, i) => (
            <LogoCard key={`clone-${partner.id}-${i}`} partner={partner} />
          ))}
        </div>
      </div>

      {/* Легенда тиров */}
      <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-6">
        {(["gold", "silver", "media"] as const).map((tier) => (
          <div key={tier} className="flex items-center gap-2">
            <span
              className={cn(
                "size-2 rounded-full",
                tier === "gold"   && "bg-amber-400",
                tier === "silver" && "bg-slate-400",
                tier === "media"  && "bg-sky-400",
              )}
            />
            <span className="font-sans text-xs text-muted-foreground">
              {TIER_LABEL[tier]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
