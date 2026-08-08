import { AppShell } from "@/components/app-shell";
import { SectionIcon } from "@/components/deck/slides";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ArrowRight, Link2, Plus, Presentation, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Decks() {
  const decks = useQuery(api.decks.listDecks);
  const deleteDeck = useMutation(api.decks.deleteDeck);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = async (deck: NonNullable<typeof decks>[number]) => {
    const url = `${window.location.origin}/d/${deck.shareCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(deck._id);
      toast.success("Share link copied");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl"
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Library
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-100">Decks</h1>
            <p className="mt-2 text-[14px] text-slate-400">
              Every pitch deck you’ve forged — ready to present, share, publish
              and download.
            </p>
          </div>
          <Link to="/dashboard">
            <Button className="shimmer gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_10px_24px_rgba(34,211,238,0.25)]">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              New deck
            </Button>
          </Link>
        </header>

        {decks === undefined ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-44 rounded-2xl bg-white/60" />
            ))}
          </div>
        ) : decks.length === 0 ? (
          <div className="glass-soft mt-8 flex flex-col items-center gap-3 rounded-3xl px-6 py-16 text-center">
            <span className="glass-soft grid h-14 w-14 place-items-center rounded-2xl text-slate-300">
              <Presentation className="h-6 w-6" />
            </span>
            <p className="max-w-sm text-[14px] leading-relaxed text-slate-400">
              Nothing here yet — your forged decks will live in this library.
            </p>
            <Link to="/dashboard">
              <Button className="mt-2 gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600">
                <Plus className="h-4 w-4" />
                Forge your first deck
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck, i) => (
              <motion.div
                key={deck._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="glass glass-hover group relative flex flex-col overflow-hidden rounded-2xl p-5"
              >
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-30"
                  style={{ background: deck.sections[0]?.accent ?? "#6366f1" }}
                />
                <div className="relative flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-[16px] font-bold text-slate-100">
                      {deck.title}
                    </h3>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          aria-label="Delete deck"
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-600 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-strong rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete “{deck.title}”?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes the deck and its share link permanently.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="glass-soft rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-xl bg-rose-500 text-white hover:bg-rose-600"
                            onClick={async () => {
                              try {
                                await deleteDeck({ deckId: deck._id });
                                toast.success("Deck deleted");
                              } catch {
                                toast.error("Could not delete deck");
                              }
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
                    {deck.tagline}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {deck.sections.map((s) => (
                      <span
                        key={s.key}
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                        style={{ background: `${s.accent}1a`, color: s.accent }}
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
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Copy share link"
                        onClick={() => handleShare(deck)}
                        className="glass-soft grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-emerald-300"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                      </button>
                      <Link
                        to={`/deck/${deck._id}`}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-[0_8px_18px_rgba(34,211,238,0.25)] transition hover:-translate-y-0.5"
                      >
                        {copiedId === deck._id ? "Copied" : "Open"} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
