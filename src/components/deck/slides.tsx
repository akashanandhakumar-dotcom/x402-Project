import { AuroraBlobs } from "@/components/background";
import { extractTechStack, getTemplate, type DeckSection, type PitchDeck } from "@/lib/deck";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Cpu,
  Crosshair,
  Flame,
  Layers,
  Megaphone,
  Milestone,
  Rocket,
  Sparkles,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  sparkles: Sparkles,
  cpu: Cpu,
  "trending-up": TrendingUp,
  "line-chart": BarChart3,
  crosshair: Crosshair,
  rocket: Rocket,
  layers: Layers,
  wallet: Wallet,
  megaphone: Megaphone,
  milestone: Milestone,
};

export function SectionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Layers;
  return <Icon className={className} strokeWidth={1.9} />;
}

/* ------------------------------------------------------------------ */
/* Slide list — the full 13-slide investor story                       */
/* ------------------------------------------------------------------ */

export type SlideDef =
  | { kind: "cover" }
  | { kind: "section"; section: DeckSection }
  | {
      kind: "insight";
      insight:
        | "product"
        | "market"
        | "gtm"
        | "roadmap"
        | "financials"
        | "ask";
    }
  | { kind: "closing" };

export function deckSlides(deck: PitchDeck): SlideDef[] {
  const sectionByKey = Object.fromEntries(deck.sections.map((s) => [s.key, s]));
  const order: SlideDef[] = [{ kind: "cover" }];

  // Problem
  order.push({ kind: "section", section: sectionByKey.problem });
  // Solution
  order.push({ kind: "section", section: sectionByKey.features });
  // Product (AI-derived)
  order.push({ kind: "insight", insight: "product" });
  // Market + TAM/SAM/SOM overlay
  order.push({ kind: "section", section: sectionByKey.market });
  order.push({ kind: "insight", insight: "market" });
  // Technology
  order.push({ kind: "section", section: sectionByKey.tech });
  // Business Model
  order.push({ kind: "section", section: sectionByKey.revenue });
  // Competitive Landscape
  order.push({ kind: "section", section: sectionByKey.competitors });
  // AI-derived story slides
  order.push({ kind: "insight", insight: "gtm" });
  order.push({ kind: "insight", insight: "roadmap" });
  order.push({ kind: "insight", insight: "financials" });
  order.push({ kind: "insight", insight: "ask" });
  order.push({ kind: "closing" });

  return order;
}

export function slideLabel(slide: SlideDef): string {
  if (slide.kind === "cover") return "Cover";
  if (slide.kind === "closing") return "Thank You";
  if (slide.kind === "section") return slide.section.title;
  const LABELS: Record<string, string> = {
    product: "Product",
    market: "Market Sizing",
    gtm: "Go-To-Market",
    roadmap: "Roadmap",
    financials: "Financials",
    ask: "Investment Ask",
  };
  return LABELS[slide.insight];
}

function slideAccent(deck: PitchDeck, slide: SlideDef): string {
  const t = getTemplate(deck.template ?? "glass");
  if (slide.kind === "section") return slide.section.accent;
  return t.accent;
}

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

function SlideFrame({
  children,
  deck,
  accent,
  className,
}: {
  children: React.ReactNode;
  deck: PitchDeck;
  accent: string;
  className?: string;
}) {
  const t = getTemplate(deck.template ?? "glass");
  return (
    <div
      className={cn("relative h-full w-full overflow-hidden rounded-2xl", className)}
      style={{
        background: `linear-gradient(145deg, ${t.bg[0]} 0%, ${t.bg[1]} 52%, ${t.bg[2]} 100%)`,
      }}
    >
      {t.dark ? (
        <>
          <AuroraBlobs className="absolute inset-0 opacity-90" />
          <div className="bg-grid absolute inset-0 opacity-70" />
        </>
      ) : (
        <div className="bg-grid absolute inset-0 opacity-40" />
      )}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: accent }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full opacity-10 blur-3xl"
        style={{ background: accent }}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  );
}

function Watermark({ deck, index, total }: { deck: PitchDeck; index: number; total: number }) {
  const t = getTemplate(deck.template ?? "glass");
  const fg = t.dark ? "text-white/45" : "text-black/40";
  return (
    <div
      className={cn(
        "absolute bottom-5 left-8 right-8 flex items-center justify-between text-[13px] font-medium tracking-wide",
        fg,
      )}
    >
      <span className="flex items-center gap-2">
        <span
          className="grid h-5 w-5 place-items-center rounded-md text-white"
          style={{ background: t.accent }}
        >
          <Rocket className="h-3 w-3" />
        </span>
        PitchForge AI
      </span>
      <span>
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Readiness ring                                                      */
/* ------------------------------------------------------------------ */

export function ReadinessRing({
  score,
  size = 148,
  stroke = 10,
  label = "Investor Readiness",
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="readiness-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="oklch(1 0 0 / 0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#readiness-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[34px] font-bold tabular-nums tracking-tight text-white">
            {score}
            <span className="text-lg text-white/50">/100</span>
          </div>
          <div className="mt-0.5 px-4 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/50">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cover slide                                                         */
/* ------------------------------------------------------------------ */

function CoverSlide({ deck }: { deck: PitchDeck }) {
  const t = getTemplate(deck.template ?? "glass");
  const fgTitle = t.dark ? "text-white" : "text-black";
  const fgSub = t.dark ? "text-white/60" : "text-black/55";
  const chipBg = t.dark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5";
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.22em] backdrop-blur-md",
          chipBg,
        )}
        style={{ color: t.accent }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}` }}
        />
        Investor pitch · generated from repo docs
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className={cn("mt-8 max-w-[960px] text-[76px] font-bold leading-[1.02] tracking-tight", fgTitle)}
      >
        {deck.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className={cn("mt-6 max-w-[820px] text-[25px] leading-snug", fgSub)}
      >
        {deck.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 flex flex-wrap items-center justify-center gap-2.5"
      >
        {deck.sections.map((s) => (
          <span
            key={s.key}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-[15px] font-medium backdrop-blur-md",
              chipBg,
              fgSub,
            )}
          >
            <span
              className="grid h-5 w-5 place-items-center rounded-md text-white"
              style={{ background: s.accent, boxShadow: `0 0 14px ${s.accent}66` }}
            >
              <SectionIcon
                name={
                  s.key === "tech"
                    ? "cpu"
                    : s.key === "revenue"
                      ? "line-chart"
                      : s.key === "competitors"
                        ? "crosshair"
                        : s.key === "market"
                          ? "trending-up"
                          : s.key === "features"
                            ? "sparkles"
                            : "flame"
                }
                className="h-3 w-3"
              />
            </span>
            {s.title}
          </span>
        ))}
      </motion.div>

      {/* floating deco cards */}
      <div
        className={cn(
          "animate-float pointer-events-none absolute right-20 top-24 hidden rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md sm:block",
          chipBg,
        )}
      >
        <div className={cn("flex items-center gap-2", fgSub)}>
          <span
            className="grid h-7 w-7 place-items-center rounded-lg"
            style={{ background: `${t.accent}26`, color: t.accent }}
          >
            <Flame className="h-4 w-4" />
          </span>
          <span className="text-[13px] font-medium">Problem defined</span>
        </div>
      </div>
      <div
        className={cn(
          "animate-float-x pointer-events-none absolute left-24 top-36 hidden rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md sm:block",
          chipBg,
        )}
        style={{ animationDelay: "-2s" }}
      >
        <div className={cn("flex items-center gap-2", fgSub)}>
          <span
            className="grid h-7 w-7 place-items-center rounded-lg"
            style={{ background: `${t.accent}26`, color: t.accent }}
          >
            <Cpu className="h-4 w-4" />
          </span>
          <span className="text-[13px] font-medium">Stack surfaced</span>
        </div>
      </div>
      <Watermark deck={deck} index={0} total={13} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section slide                                                       */
/* ------------------------------------------------------------------ */

function SectionSlide({
  deck,
  section,
  number,
  index,
  total,
}: {
  deck: PitchDeck;
  section: DeckSection;
  number: number;
  index: number;
  total: number;
}) {
  const t = getTemplate(deck.template ?? "glass");
  const fgTitle = t.dark ? "text-white" : "text-black";
  const fgSub = t.dark ? "text-white/55" : "text-black/50";
  const fgBody = t.dark ? "text-white/70" : "text-black/70";
  const panelBg = t.dark
    ? "border-white/10 bg-[oklch(0.2_0.05_160/0.55)] shadow-[0_24px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.07)]"
    : "border-black/10 bg-white/80 shadow-[0_24px_60px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]";
  const iconName =
    section.key === "tech"
      ? "cpu"
      : section.key === "revenue"
        ? "line-chart"
        : section.key === "competitors"
          ? "crosshair"
          : section.key === "market"
            ? "trending-up"
            : section.key === "features"
              ? "sparkles"
              : "flame";
  return (
    <div className="flex h-full w-full items-center overflow-hidden px-20">
      {/* Left column */}
      <div className="relative z-10 w-[46%] shrink-0 pt-44">
        <motion.div
          initial={{ opacity: 0, x: -26 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -left-4 -top-24 select-none text-[210px] font-black leading-none"
          style={{ color: section.accent, opacity: 0.16 }}
        >
          {String(number).padStart(2, "0")}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex items-center gap-2"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-lg"
            style={{ background: section.accent, boxShadow: `0 10px 24px ${section.accent}55` }}
          >
            <SectionIcon name={iconName} className="h-5 w-5" />
          </span>
          <span
            className="rounded-full px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.2em]"
            style={{ background: `${section.accent}1f`, color: section.accent }}
          >
            {section.eyebrow}
          </span>
          {section.derived && (
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                t.dark ? "border-white/10 bg-white/5 text-white/45" : "border-black/10 bg-black/5 text-black/40",
              )}
            >
              AI-derived
            </span>
          )}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className={cn("mt-5 text-[62px] font-bold leading-none tracking-tight", fgTitle)}
        >
          {section.title}
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 h-1.5 w-28 origin-left rounded-full"
          style={{ background: section.accent, boxShadow: `0 0 16px ${section.accent}88` }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className={cn("mt-6 max-w-[420px] text-[18px] leading-relaxed", fgSub)}
        >
          {section.eyebrow} — distilled straight from your repository docs.
        </motion.p>
      </div>

      {/* Right column — glass bullet panel */}
      <motion.div
        initial={{ opacity: 0, x: 34 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="ml-10 w-[54%]"
      >
        <div className={cn("relative rounded-3xl border p-9 backdrop-blur-xl", panelBg)}>
          {section.key === "tech" && extractTechStack(section.bullets).length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2.5">
              {extractTechStack(section.bullets).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border px-3.5 py-1.5 text-[15px] font-semibold"
                  style={{
                    borderColor: `${section.accent}55`,
                    background: `${section.accent}14`,
                    color: section.accent,
                    boxShadow: `0 0 14px ${section.accent}22`,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
          <div className="space-y-5">
            {section.bullets.map((bullet, bi) => (
              <motion.div
                key={`${bullet}-${bi}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.38 + bi * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-4"
              >
                <span
                  className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white shadow-md"
                  style={{ background: section.accent, boxShadow: `0 0 16px ${section.accent}55` }}
                >
                  {bi + 1}
                </span>
                <p className={cn("text-[21px] leading-snug", fgBody)}>{bullet}</p>
              </motion.div>
            ))}
          </div>
          <div
            className={cn(
              "pointer-events-none absolute -bottom-7 -right-7 h-24 w-24 rounded-2xl border backdrop-blur-md",
              t.dark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5",
            )}
            style={{ transform: "rotate(8deg)" }}
          >
            <div
              className="grid h-full w-full place-items-center rounded-2xl"
              style={{ background: `${section.accent}14` }}
            >
              <SectionIcon name={iconName} className="h-9 w-9" />
            </div>
          </div>
        </div>
      </motion.div>

      <Watermark deck={deck} index={index} total={total} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Insight slides (AI-derived story)                                   */
/* ------------------------------------------------------------------ */

function InsightSlide({
  deck,
  insight,
  number,
  index,
  total,
}: {
  deck: PitchDeck;
  insight: Extract<SlideDef, { kind: "insight" }>["insight"];
  number: number;
  index: number;
  total: number;
}) {
  const t = getTemplate(deck.template ?? "glass");
  const ins = deck.insights;
  const fgTitle = t.dark ? "text-white" : "text-black";
  const fgSub = t.dark ? "text-white/55" : "text-black/50";
  const fgBody = t.dark ? "text-white/70" : "text-black/70";
  const chipBg = t.dark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5";

  const META: Record<string, { title: string; eyebrow: string; icon: string }> = {
    product: { title: "Product", eyebrow: "What we built", icon: "rocket" },
    market: { title: "Market Sizing", eyebrow: "TAM · SAM · SOM", icon: "trending-up" },
    gtm: { title: "Go-To-Market", eyebrow: "How we win", icon: "megaphone" },
    roadmap: { title: "Roadmap", eyebrow: "What's next", icon: "milestone" },
    financials: { title: "Financials", eyebrow: "The model", icon: "line-chart" },
    ask: { title: "Investment Ask", eyebrow: "The round", icon: "wallet" },
  };
  const meta = META[insight];
  const accent = t.accent;

  const renderBody = () => {
    if (insight === "product") {
      return (
        <div className="space-y-4">
          <p className={cn("text-[21px] leading-snug", fgBody)}>{ins.elevatorPitch}</p>
          <div className={cn("rounded-2xl border p-5", chipBg)}>
            <p className={cn("text-[13px] font-semibold uppercase tracking-[0.18em]", fgSub)}>
              Executive summary
            </p>
            <p className={cn("mt-2 text-[17px] leading-relaxed", fgBody)}>{ins.executiveSummary}</p>
          </div>
        </div>
      );
    }
    if (insight === "market") {
      const tiers = [
        { label: "TAM", value: ins.tam, note: "Total addressable" },
        { label: "SAM", value: ins.sam, note: "Serviceable" },
        { label: "SOM", value: ins.som, note: "Obtainable" },
      ];
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                className={cn("relative overflow-hidden rounded-2xl border p-5 text-center", chipBg)}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-1"
                  style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                />
                <div className="text-[13px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
                  {tier.label}
                </div>
                <div className={cn("mt-2 text-[38px] font-bold tabular-nums tracking-tight", fgTitle)}>
                  {tier.value}
                </div>
                <div className={cn("mt-1 text-[12px] font-medium", fgSub)}>{tier.note}</div>
              </motion.div>
            ))}
          </div>
          <p className={cn("text-[16.5px] leading-relaxed", fgBody)}>{ins.marketNote}</p>
        </div>
      );
    }
    if (insight === "gtm") {
      return (
        <div className="space-y-4">
          {ins.gtm.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.25 + i * 0.12 }}
              className={cn("flex items-start gap-4 rounded-2xl border p-4", chipBg)}
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white"
                style={{ background: accent, boxShadow: `0 0 16px ${accent}55` }}
              >
                {i + 1}
              </span>
              <p className={cn("pt-1 text-[17.5px] leading-snug", fgBody)}>{step}</p>
            </motion.div>
          ))}
        </div>
      );
    }
    if (insight === "roadmap") {
      return (
        <div className="space-y-4">
          {ins.roadmap.map((phase, i) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 + i * 0.14 }}
              className={cn("rounded-2xl border p-5", chipBg)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-7 w-7 place-items-center rounded-lg text-white"
                    style={{ background: accent }}
                  >
                    <Milestone className="h-4 w-4" />
                  </span>
                  <span className={cn("text-[19px] font-bold", fgTitle)}>{phase.phase}</span>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={{ background: `${accent}1f`, color: accent }}
                >
                  {phase.timeline}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {phase.items.map((item, bi) => (
                  <li key={bi} className={cn("flex items-center gap-2 text-[16px]", fgBody)}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      );
    }
    if (insight === "financials") {
      return (
        <div className="space-y-4">
          <div className={cn("rounded-2xl border p-5", chipBg)}>
            <p className={cn("text-[13px] font-semibold uppercase tracking-[0.18em]", fgSub)}>
              Business model
            </p>
            <p className={cn("mt-2 text-[19px] leading-snug", fgBody)}>{ins.businessModel}</p>
          </div>
          <div className={cn("rounded-2xl border p-5", chipBg)}>
            <p className={cn("text-[13px] font-semibold uppercase tracking-[0.18em]", fgSub)}>
              Pricing strategy
            </p>
            <p className={cn("mt-2 text-[17.5px] leading-snug", fgBody)}>{ins.pricingStrategy}</p>
          </div>
        </div>
      );
    }
    // ask
    return (
      <div className="space-y-4">
        <div className={cn("rounded-2xl border p-6", chipBg)}>
          <p className={cn("text-[13px] font-semibold uppercase tracking-[0.18em]", fgSub)}>
            Funding ask
          </p>
          <p className={cn("mt-2 text-[24px] font-semibold leading-snug", fgTitle)}>
            {ins.fundingAsk}
          </p>
        </div>
        <div className={cn("rounded-2xl border p-5", chipBg)}>
          <p className={cn("text-[13px] font-semibold uppercase tracking-[0.18em]", fgSub)}>
            Use of funds
          </p>
          <ul className="mt-3 space-y-2">
            {ins.useOfFunds.map((item, i) => (
              <li key={i} className={cn("flex items-center gap-2.5 text-[16.5px]", fgBody)}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          {ins.risks.map((r) => (
            <span
              key={r}
              className={cn("rounded-full border px-3 py-1 text-[12.5px] font-medium", chipBg, fgSub)}
            >
              ⚠ {r}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full items-center overflow-hidden px-20">
      <div className="relative z-10 w-[44%] shrink-0 pt-44">
        <motion.div
          initial={{ opacity: 0, x: -26 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -left-4 -top-24 select-none text-[210px] font-black leading-none"
          style={{ color: accent, opacity: 0.16 }}
        >
          {String(number).padStart(2, "0")}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex items-center gap-2"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-lg"
            style={{ background: accent, boxShadow: `0 10px 24px ${accent}55` }}
          >
            <SectionIcon name={meta.icon} className="h-5 w-5" />
          </span>
          <span
            className="rounded-full px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.2em]"
            style={{ background: `${accent}1f`, color: accent }}
          >
            {meta.eyebrow}
          </span>
          <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium", chipBg, fgSub)}>
            AI-generated
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className={cn("mt-5 text-[62px] font-bold leading-none tracking-tight", fgTitle)}
        >
          {meta.title}
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 h-1.5 w-28 origin-left rounded-full"
          style={{ background: accent, boxShadow: `0 0 16px ${accent}88` }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.34 }}
          className={cn("mt-6 max-w-[400px] text-[18px] leading-relaxed", fgSub)}
        >
          Inferred from your docs with sensible business assumptions — flagged for review.
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, x: 34 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="ml-10 w-[56%]"
      >
        {renderBody()}
      </motion.div>
      <Watermark deck={deck} index={index} total={total} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Closing slide                                                       */
/* ------------------------------------------------------------------ */

function ClosingSlide({ deck }: { deck: PitchDeck }) {
  const t = getTemplate(deck.template ?? "glass");
  const ins = deck.insights;
  const fgTitle = t.dark ? "text-white" : "text-black";
  const fgSub = t.dark ? "text-white/60" : "text-black/55";
  const chipBg = t.dark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5";
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="grid h-20 w-20 place-items-center rounded-3xl text-white shadow-[0_18px_44px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.35)]"
        style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }}
      >
        <Rocket className="h-9 w-9" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className={cn("mt-8 text-[64px] font-bold leading-tight tracking-tight", fgTitle)}
      >
        Let&apos;s build <span style={{ color: t.accent }}>this together.</span>
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className={cn("mt-6 max-w-[760px] text-[22px] leading-snug", fgSub)}
      >
        {ins.fundingAsk}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 flex items-center gap-6"
      >
        {[
          { label: "Slides", value: "13" },
          {
            label: "Words distilled",
            value: String(deck.stats.words).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          },
          { label: "Readiness", value: `${deck.readiness.overall}/100` },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-2xl border px-7 py-5 backdrop-blur-md", chipBg)}>
            <div className={cn("text-[34px] font-bold tracking-tight", fgTitle)}>{s.value}</div>
            <div className={cn("mt-1 text-[13px] font-medium uppercase tracking-[0.16em]", fgSub)}>
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>
      <Watermark deck={deck} index={12} total={13} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas                                                              */
/* ------------------------------------------------------------------ */

export function SlideContent({
  deck,
  slide,
  index,
  total,
}: {
  deck: PitchDeck;
  slide: SlideDef;
  index: number;
  total: number;
}) {
  const t = getTemplate(deck.template ?? "glass");
  if (slide.kind === "cover") {
    return (
      <SlideFrame deck={deck} accent={t.accent}>
        <CoverSlide deck={deck} />
      </SlideFrame>
    );
  }
  if (slide.kind === "closing") {
    return (
      <SlideFrame deck={deck} accent={t.accent2}>
        <ClosingSlide deck={deck} />
      </SlideFrame>
    );
  }
  if (slide.kind === "section") {
    return (
      <SlideFrame deck={deck} accent={slide.section.accent}>
        <SectionSlide
          deck={deck}
          section={slide.section}
          number={index}
          index={index}
          total={total}
        />
      </SlideFrame>
    );
  }
  return (
    <SlideFrame deck={deck} accent={t.accent}>
      <InsightSlide
        deck={deck}
        insight={slide.insight}
        number={index}
        index={index}
        total={total}
      />
    </SlideFrame>
  );
}

export function useStageScale(designWidth = 1280) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / designWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);
  return { ref, scale };
}

const stageVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 90 : -90, opacity: 0, scale: 0.988 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? -90 : 90, opacity: 0, scale: 0.988 }),
};

export function DeckStage({
  deck,
  index,
  direction,
  className,
}: {
  deck: PitchDeck;
  index: number;
  direction: number;
  className?: string;
}) {
  const slides = deckSlides(deck);
  const total = slides.length;
  const safeIndex = Math.max(0, Math.min(index, total - 1));
  const slide = slides[safeIndex];
  const { ref, scale } = useStageScale();

  return (
    <div ref={ref} className={cn("w-full", className)}>
      <div className="relative mx-auto" style={{ width: 1280 * scale, height: 720 * scale }}>
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: 1280, height: 720, transform: `scale(${scale})` }}
        >
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={safeIndex}
              custom={direction}
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
            >
              <SlideContent deck={deck} slide={slide} index={safeIndex} total={total} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Print renderer                                                      */
/* ------------------------------------------------------------------ */

const PRINT_SCALE = 1123 / 1280;

export function PrintDeck({ deck }: { deck: PitchDeck }) {
  const slides = deckSlides(deck);
  return (
    <div className="print-only hidden">
      {slides.map((slide, i) => (
        <div key={`${i}-${slide.kind}`} className="print-slide">
          <div className="mx-auto" style={{ width: 1123, height: 632 }}>
            <div
              className="origin-top-left"
              style={{ width: 1280, height: 720, transform: `scale(${PRINT_SCALE})` }}
            >
              <SlideContent deck={deck} slide={slide} index={i} total={slides.length} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { slideAccent };
