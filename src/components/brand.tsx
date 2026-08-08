import { cn } from "@/lib/utils";

/** Forge-mark used across the app — a hammer-formed slide card. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-[0_8px_24px_rgba(0,168,107,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[62%] w-[62%]">
        {/* anvil / forge base */}
        <path
          d="M5.4 13.6h13.2M6.6 13.6l-1.2 3.4a1 1 0 0 0 .95 1.3h11.3a1 1 0 0 0 .95-1.3l-1.2-3.4"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        {/* slide card rising out of the forge */}
        <rect
          x="8.6"
          y="5.4"
          width="6.8"
          height="8.6"
          rx="1.4"
          fill="rgba(255,255,255,0.94)"
          stroke="rgba(255,255,255,1)"
          strokeWidth="0.7"
        />
        <rect x="10.2" y="7.6" width="3.6" height="0.9" rx="0.45" fill="#00A86B" opacity="0.95" />
        <rect x="10.2" y="9.2" width="2.6" height="0.9" rx="0.45" fill="#94a3b8" opacity="0.8" />
        {/* spark */}
        <path d="M17.6 3.4l.45 1.15 1.15.45-1.15.45-.45 1.15-.45-1.15-1.15-.45 1.15-.45z" fill="#a7f3d0" />
      </svg>
    </span>
  );
}

export function Brand({
  className,
  markClassName,
  compact = false,
}: {
  className?: string;
  markClassName?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className={cn("h-9 w-9", markClassName)} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            PitchForge <span className="text-gradient">AI</span>
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Docs → Investor deck
          </span>
        </span>
      )}
    </span>
  );
}
