import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router";

export function PlaceholderPage({
  icon: Icon,
  title,
  blurb,
  chips,
}: {
  icon: LucideIcon;
  title: string;
  blurb: string;
  chips: string[];
}) {
  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center"
      >
        <div className="glass glass-hover relative w-full overflow-hidden p-10 sm:p-14">
          <div className="shimmer pointer-events-none absolute inset-0" />
          <div className="relative flex flex-col items-center">
            <span className="glass-soft grid h-16 w-16 place-items-center rounded-2xl text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Icon className="h-7 w-7" strokeWidth={1.8} />
            </span>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{blurb}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Badge className="border-transparent bg-emerald-500/10 text-emerald-300">
                <Sparkles className="h-3 w-3" /> Coming soon
              </Badge>
              {chips.map((chip) => (
                <Badge key={chip} variant="secondary" className="border-white/10 bg-white/5 text-muted-foreground">
                  {chip}
                </Badge>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/dashboard">
                <Button className="gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_10px_24px_rgba(34,211,238,0.25)]">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
