import { SlideContent, deckSlides, type SlideDef } from "@/components/deck/slides";
import type { PitchDeck } from "@/lib/deck";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

/** Slide index + direction state with keyboard navigation. */
export function useSlideNavigation(total: number) {
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);

  const goTo = useCallback(
    (target: number) => {
      setState(([cur]) => {
        const clamped = Math.max(0, Math.min(target, total - 1));
        return [clamped, clamped >= cur ? 1 : -1];
      });
    },
    [total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goTo(index + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, total, goTo]);

  return {
    index,
    direction,
    goTo,
    next: () => goTo(index + 1),
    prev: () => goTo(index - 1),
    isFirst: index === 0,
    isLast: index === total - 1,
  };
}

/** Miniature slide used in the thumbnail rail. */
export function SlideThumb({
  deck,
  slide,
  index,
  total,
  active,
  onClick,
}: {
  deck: PitchDeck;
  slide: SlideDef;
  index: number;
  total: number;
  active: boolean;
  onClick: () => void;
}) {
  const W = 168;
  const S = W / 1280;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative block w-full overflow-hidden rounded-lg transition-all duration-200",
        active
          ? "ring-2 ring-indigo-400 shadow-[0_10px_26px_rgba(99,102,241,0.35)]"
          : "opacity-70 ring-1 ring-white/10 hover:opacity-100",
      )}
      style={{ height: S * 720 }}
    >
      <div
        className="origin-top-left"
        style={{ width: 1280, height: 720, transform: `scale(${S})` }}
      >
        <SlideContent deck={deck} slide={slide} index={index} total={total} />
      </div>
    </button>
  );
}
