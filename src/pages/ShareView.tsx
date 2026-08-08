import { BackgroundFX } from "@/components/background";
import { Brand } from "@/components/brand";
import { useSlideNavigation } from "@/components/deck/presenter";
import { DeckStage, PrintDeck, deckSlides } from "@/components/deck/slides";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import type { Id } from "@/convex/_generated/dataModel";
import type { PitchDeck } from "@/lib/deck";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  MessageSquare,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

export default function ShareView() {
  const { shareCode = "" } = useParams();
  const deckDoc = useQuery(api.decks.getDeckByShareCode, { shareCode });

  const deck: PitchDeck | null = useMemo(() => {
    if (!deckDoc) return null;
    return {
      title: deckDoc.title,
      tagline: deckDoc.tagline,
      sections: deckDoc.sections.map((s) => ({
        key: s.key as PitchDeck["sections"][number]["key"],
        title: s.title,
        eyebrow: s.eyebrow,
        bullets: s.bullets,
        accent: s.accent,
        derived: s.derived,
      })),
      stats: deckDoc.stats,
      insights: deckDoc.insights,
      readiness: {
        overall: deckDoc.readiness.overall,
        metrics: deckDoc.readiness.metrics.map((m) => ({
          key: m.key as PitchDeck["readiness"]["metrics"][number]["key"],
          label: m.label,
          score: m.score,
          note: m.note,
        })),
      },
      template: deckDoc.template ?? "glass",
    };
  }, [deckDoc]);

  const total = deck ? deckSlides(deck).length : 0;
  const { index, direction, next, prev, isFirst, isLast } = useSlideNavigation(total);

  const handlePrint = () => {
    if (!deckDoc) return;
    const prevTitle = document.title;
    document.title = `${deckDoc.title} — Pitch Deck`;
    window.print();
    setTimeout(() => (document.title = prevTitle), 1500);
  };

  if (!deckDoc || !deck) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <BackgroundFX />
        <div className="glass-strong mx-4 max-w-md rounded-3xl p-10 text-center">
          <p className="text-lg font-semibold text-white/100">
            {deckDoc === undefined ? "Loading shared deck…" : "This deck doesn’t exist"}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/400">
            {deckDoc === undefined
              ? "Hang tight — fetching the deck."
              : "The share link may have been removed by its owner."}
          </p>
          {deckDoc === null && (
            <Link to="/" className="mt-6 inline-block">
              <Button className="gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600">
                <Sparkles className="h-4 w-4" />
                Forge your own deck
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const deckId = deckDoc._id as Id<"decks">;

  return (
    <div className="relative min-h-screen">
      <BackgroundFX particleCount={34} />
      <PrintDeck deck={deck} />

      <div className="no-print relative z-10 mx-auto max-w-6xl px-3 pb-8 pt-3 sm:px-5">
        <header className="glass-strong flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <Link to="/" className="shrink-0">
            <Brand compact />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[14px] font-bold text-white/100">{deck.title}</p>
            <p className="truncate text-[11.5px] text-white/500">shared deck · {total} slides</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="glass-soft gap-1.5 rounded-xl text-[12.5px] text-white/300 hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Link to="/auth?returnTo=/dashboard">
              <Button
                size="sm"
                className="shimmer gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 text-[12.5px] shadow-[0_8px_20px_rgba(34,211,238,0.25)]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Forge your own</span>
                <span className="sm:hidden">Forge</span>
              </Button>
            </Link>
          </div>
        </header>

        <div className="mt-5">
          <div className="relative">
            <DeckStage deck={deck} index={index} direction={direction} />

            {!isFirst && (
              <button
                type="button"
                aria-label="Previous slide"
                onClick={prev}
                className="glass-strong absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white/300 shadow-lg transition hover:scale-105 hover:text-emerald-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {!isLast && (
              <button
                type="button"
                aria-label="Next slide"
                onClick={next}
                className="glass-strong absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white/300 shadow-lg transition hover:scale-105 hover:text-emerald-300"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="glass-soft mt-4 flex items-center gap-4 rounded-2xl px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={isFirst}
              className="glass-soft gap-1.5 rounded-xl text-[12.5px] text-white/300 hover:bg-white/10 disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Prev
            </Button>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300"
                animate={{ width: `${((index + 1) / total) * 100}%` }}
                transition={{ ease: "easeInOut", duration: 0.4 }}
              />
            </div>
            <span className="whitespace-nowrap text-[12.5px] font-semibold tabular-nums text-white/400">
              {index + 1} / {total}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={next}
              disabled={isLast}
              className="glass-soft gap-1.5 rounded-xl text-[12.5px] text-white/300 hover:bg-white/10 disabled:opacity-40"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Comments */}
        <ShareComments deckId={deckId} />

        <footer className="mt-6 flex items-center justify-center gap-2 text-[12px] font-medium text-white/500">
          <span className="grid h-4 w-4 place-items-center rounded bg-gradient-to-br from-emerald-400 to-teal-600 text-[7px] font-bold text-white">
            PF
          </span>
          Forged with PitchForge AI —{" "}
          <Link to="/" className="text-emerald-300 underline-offset-2 hover:underline">
            turn your repo into a deck
          </Link>
        </footer>
      </div>
    </div>
  );
}

function ShareComments({ deckId }: { deckId: Id<"decks"> }) {
  const { user } = useAuth();
  const comments = useQuery(api.comments.listComments, { deckId });
  const addComment = useMutation(api.comments.addComment);
  const deleteComment = useMutation(api.comments.deleteComment);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (body.trim().length < 2) return;
    setPosting(true);
    try {
      await addComment({ deckId, body: body.trim() });
      setBody("");
      toast.success("Comment posted");
    } catch {
      toast.error("Could not post comment");
    } finally {
      setPosting(false);
    }
  };

  const initials = (name?: string) =>
    name
      ?.split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PF";

  return (
    <div className="glass mt-6 rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-emerald-300" />
        <h3 className="text-[15px] font-semibold text-white/100">Feedback</h3>
        <span className="text-[12px] text-white/500">
          {comments === undefined ? "" : `· ${comments.length} comment${comments.length === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-white/10 text-[10px] font-semibold text-white/200">PF</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {user ? (
            <>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Ask the founder a question or leave feedback…"
                className="min-h-[76px] resize-none rounded-xl border-white/10 bg-white/5 text-[13px] text-white/200 shadow-inner backdrop-blur-md placeholder:text-white/600 focus-visible:border-emerald-400/40 focus-visible:ring-emerald-400/20"
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                <span className="text-[11px] text-white/600">{body.length}/500</span>
                <Button
                  size="sm"
                  onClick={handlePost}
                  disabled={body.trim().length < 2 || posting}
                  className="gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-[12.5px] shadow-[0_8px_18px_rgba(34,211,238,0.2)] disabled:opacity-40"
                >
                  {posting ? "Posting…" : "Post"}
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[13px] text-white/400">Sign in to leave feedback for the founder.</p>
              <Link to={`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`}>
                <Button size="sm" variant="outline" className="glass-soft rounded-xl text-[12.5px] text-white/200 hover:bg-white/10">
                  Sign in
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {comments === undefined ? (
          <div className="flex items-center gap-2 text-[12.5px] text-white/500">
            <Skeleton className="h-4 w-40 rounded bg-white/5" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-[12.5px] text-white/600">
            No feedback yet — be the first to comment.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-white/10 text-[10px] font-semibold text-white/200">
                  {initials(c.authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-white/200">{c.authorName}</span>
                  <span className="text-[11px] text-white/600">
                    {new Date(c._creationTime).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-0.5 text-[13.5px] leading-relaxed text-white/400">{c.body}</p>
              </div>
              {user?.email && (
                <button
                  type="button"
                  aria-label="Delete comment"
                  onClick={async () => {
                    try {
                      await deleteComment({ commentId: c._id });
                      toast.success("Comment deleted");
                    } catch {
                      toast.error("Could not delete comment");
                    }
                  }}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/700 opacity-30 transition hover:bg-rose-500/10 hover:text-rose-400 hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
