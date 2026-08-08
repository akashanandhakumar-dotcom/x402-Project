import { AuroraBlobs, ParticleField } from "@/components/background";
import { BrandMark } from "@/components/brand";
import { SectionIcon } from "@/components/deck/slides";
import { CARD_KEYS, SECTION_META, type PitchDeck } from "@/lib/deck";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, SkipForward, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Phase = "reading" | "cards" | "merge" | "done";

const STEPS = [
  "Reading Documentation",
  "Understanding Architecture",
  "Extracting Features",
  "Market Research",
  "Business Analysis",
  "Revenue Model",
  "Competitor Analysis",
  "Investor Story",
  "Slide Generation",
];

const CARD_POSITIONS = [
  { x: "-34%", y: "-52%", delay: 0.0 },
  { x: "30%", y: "-58%", delay: 0.12 },
  { x: "46%", y: "4%", delay: 0.24 },
  { x: "14%", y: "44%", delay: 0.36 },
  { x: "-38%", y: "34%", delay: 0.48 },
  { x: "-46%", y: "-6%", delay: 0.6 },
];

export function TransformExperience({
  markdown,
  deck,
  onDone,
  onSkip,
}: {
  markdown: string;
  deck: PitchDeck;
  onDone: (deck: PitchDeck) => void;
  onSkip: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("reading");
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    t(() => setStepIndex(1), 350);
    t(() => setStepIndex(2), 1150);
    t(() => setProgress(38), 2100);
    t(() => setPhase("cards"), 2300);
    t(() => setStepIndex(3), 2500);
    t(() => setStepIndex(4), 3100);
    t(() => setStepIndex(5), 3700);
    t(() => setStepIndex(6), 4300);
    t(() => setStepIndex(7), 4900);
    t(() => setProgress(86), 5000);
    t(() => setPhase("merge"), 5400);
    t(() => setStepIndex(8), 5600);
    t(() => setProgress(100), 6500);
    t(() => setPhase("done"), 6900);

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase === "done" && !doneRef.current) {
      doneRef.current = true;
      const id = setTimeout(() => onDone(deck), 1000);
      return () => clearTimeout(id);
    }
  }, [phase, deck, onDone]);

  const activeStep = Math.min(stepIndex, STEPS.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 overflow-hidden"
      style={{
        background:
          "linear-gradient(155deg, oklch(0.2 0.045 160) 0%, oklch(0.15 0.03 170) 55%, oklch(0.17 0.045 150) 100%)",
      }}
    >
      <AuroraBlobs className="absolute inset-0" />
      <div className="bg-grid absolute inset-0 opacity-50" />
      <ParticleField count={54} className="absolute inset-0" />

      {/* Skip */}
      <button
        type="button"
        onClick={onSkip}
        className="no-print glass-soft absolute right-5 top-5 z-20 flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-white/55 transition hover:text-white"
      >
        <SkipForward className="h-3.5 w-3.5" />
        Skip
      </button>

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6">
        {/* Stage */}
        <div className="relative flex h-[380px] w-full max-w-3xl items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === "reading" && (
              <motion.div
                key="reading"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="glass-strong relative h-64 w-full max-w-xl overflow-hidden rounded-2xl p-6">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
                    Documentation source
                  </p>
                  <div className="mt-3 h-40 overflow-hidden font-mono text-[12px] leading-relaxed text-white/45">
                    {markdown.slice(0, 420).split("\n").slice(0, 9).map((line, i) => (
                      <div
                        key={i}
                        className={cn(
                          "whitespace-pre-wrap",
                          i > stepIndex + 1 && "opacity-20",
                          i <= stepIndex + 1 && "opacity-90",
                        )}
                      >
                        {line.slice(0, 64) || " "}
                      </div>
                    ))}
                  </div>
                  <div
                    className="pointer-events-none absolute inset-x-6 h-8"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent, rgba(99,102,241,0.28), transparent)",
                      animation: "scan-line 1.8s ease-in-out infinite alternate",
                    }}
                  />
                </div>
              </motion.div>
            )}

            {phase === "cards" && (
              <motion.div
                key="cards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                {/* nucleus */}
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  className="glass-strong absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-2xl px-6 py-5 text-center"
                >
                  <BrandMark className="h-11 w-11" />
                  <span className="text-[13px] font-semibold text-white/70">
                    Constructing your story…
                  </span>
                </motion.div>

                {CARD_KEYS.map((key, i) => {
                  const meta = SECTION_META[key];
                  const pos = CARD_POSITIONS[i];
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.5, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: [0, -9, 0] }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{
                        opacity: { duration: 0.45, delay: 0.1 + i * 0.13 },
                        scale: { duration: 0.45, delay: 0.1 + i * 0.13 },
                        y: {
                          duration: 5 + i * 0.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.6 + i * 0.13,
                        },
                      }}
                      className="absolute w-52"
                      style={{ left: pos.x, top: pos.y }}
                    >
                      <div className="shimmer relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.22_0.05_160/0.6)] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="grid h-8 w-8 place-items-center rounded-lg text-white"
                            style={{
                              background: meta.accent,
                              boxShadow: `0 8px 18px ${meta.accent}44`,
                            }}
                          >
                            <SectionIcon
                              name={key === "tech" ? "cpu" : key === "revenue" ? "line-chart" : key}
                              className="h-4 w-4"
                            />
                          </span>
                          <div className="leading-tight">
                            <div className="text-[14px] font-bold text-white/85">{meta.title}</div>
                            <div className="text-[11px] font-medium uppercase tracking-wider text-white/45">
                              {meta.eyebrow}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {phase === "merge" && (
              <motion.div
                key="merge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, rotate: -4 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16 }}
                  className="glass-strong relative h-56 w-[400px] overflow-hidden rounded-2xl"
                >
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{
                      background: "linear-gradient(135deg, #00A86B, #00E08F, #5eead4)",
                    }}
                  />
                  <div className="relative flex h-full flex-col items-center justify-center text-center">
                    <BrandMark className="h-12 w-12" />
                    <p className="mt-4 text-[17px] font-bold text-white/85">
                      Merging into your deck…
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-300" />
                      <span className="text-[12px] font-medium text-white/45">
                        13 investor-ready slides
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 16 }}
                className="flex flex-col items-center"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
                  className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 text-white shadow-[0_18px_44px_rgba(99,102,241,0.45)]"
                >
                  <Check className="h-10 w-10" strokeWidth={3} />
                </motion.span>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 text-xl font-semibold text-white/85"
                >
                  Deck ready — opening your studio…
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Steps + progress */}
        <div className="mt-10 w-full max-w-2xl">
          <div className="mb-3 flex min-h-[22px] items-center justify-between">
            <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
              {STEPS[activeStep]}
            </span>
            <span className="text-[13px] font-semibold tabular-nums text-white/45">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-300"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut", duration: 0.6 }}
            />
            <div className="shimmer pointer-events-none absolute inset-0" />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
            {STEPS.map((step, i) => (
              <span
                key={step}
                className={cn(
                  "flex h-6 items-center gap-1 rounded-full border px-2.5 text-[11px] font-medium transition-all duration-300",
                  i < activeStep
                    ? "border-indigo-400/20 bg-indigo-500/10 text-indigo-300"
                    : i === activeStep
                      ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                      : "border-white/10 bg-white/5 text-white/35",
                )}
              >
                {i < activeStep && <Check className="h-3 w-3" />}
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
