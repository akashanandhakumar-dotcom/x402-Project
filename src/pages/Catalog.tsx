import { BackgroundFX } from "@/components/background";
import { Brand } from "@/components/brand";
import { SectionIcon } from "@/components/deck/slides";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function Catalog() {
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setQuery(term), 250);
    return () => clearTimeout(id);
  }, [term]);

  return (
    <div className="relative min-h-screen">
      <BackgroundFX particleCount={40} />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6">
        <header className="glass-strong no-print flex items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
          <Link to="/" className="shrink-0">
            <Brand />
          </Link>
          <Link to="/auth?returnTo=/dashboard">
            <Button className="shimmer gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 text-[13px] shadow-[0_8px_20px_rgba(34,211,238,0.25)]">
              <Sparkles className="h-4 w-4" />
              Forge a deck
            </Button>
          </Link>
        </header>

        <section className="mx-auto mt-12 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Public catalog
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
              Decks forged by <span className="text-gradient">web3 builders</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">
              Browse pitch decks generated from real repos and technical docs.
              Search by project, tagline, or category — then dive into the full deck.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-8 max-w-xl"
          >
            <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search decks — e.g. “staking”, “oracle”, “DeFi”…"
              className="glass-strong h-[52px] rounded-2xl border-white/10 bg-white/5 pl-12 text-[14px] text-slate-200 shadow-inner backdrop-blur-md placeholder:text-slate-600 focus-visible:border-emerald-400/40 focus-visible:ring-emerald-400/20"
            />
            {term && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        </section>

        <CatalogGrid query={query} />
      </div>
    </div>
  );
}

function CatalogGrid({ query }: { query: string }) {
  const published = useQuery(api.decks.listPublishedDecks, { query });

  return (
    <section className="mx-auto mt-12 max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-slate-200">
          {query ? (
            <>
              Results for <span className="text-emerald-300">“{query}”</span>
            </>
          ) : (
            "Latest decks"
          )}
        </h2>
        <span className="text-[12.5px] tabular-nums text-slate-500">
          {published === undefined ? "…" : `${published.length} deck${published.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {published === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : published.length === 0 ? (
        <div className="glass-soft flex flex-col items-center gap-3 rounded-3xl px-6 py-16 text-center">
          <Search className="h-8 w-8 text-slate-600" />
          <p className="max-w-sm text-[14px] leading-relaxed text-slate-400">
            No published decks match that search yet. Be the first to forge one
            and put it in the catalog.
          </p>
          <Link to="/auth?returnTo=/dashboard">
            <Button className="mt-2 gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600">
              <Sparkles className="h-4 w-4" />
              Forge a deck
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {published.map((deck, i) => (
            <motion.div
              key={deck._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="glass glass-hover group relative flex flex-col overflow-hidden rounded-2xl p-5"
            >
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                style={{ background: deck.sections[0]?.accent ?? "#22d3ee" }}
              />
              <div className="relative flex flex-1 flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">
                    {deck.projectName}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                    Live
                  </span>
                </div>
                <h3 className="mt-3 line-clamp-1 text-[16px] font-bold text-slate-100">
                  {deck.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
                  {deck.tagline}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {deck.sections.slice(0, 6).map((s) => (
                    <span
                      key={s.key}
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                      style={{ background: `${s.accent}1f`, color: s.accent }}
                    >
                      <SectionIcon name={s.key === "tech" ? "cpu" : s.key === "revenue" ? "line-chart" : s.key} className="h-3 w-3" />
                      {s.title}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5">
                  <span className="text-[11.5px] font-medium text-slate-500">
                    {deck.sections.length + 2} slides ·{" "}
                    {formatDistanceToNow(new Date(deck._creationTime), { addSuffix: true })}
                  </span>
                  <Link
                    to={`/d/${deck.shareCode}`}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-[0_8px_18px_rgba(34,211,238,0.25)] transition hover:-translate-y-0.5"
                  >
                    View deck <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
