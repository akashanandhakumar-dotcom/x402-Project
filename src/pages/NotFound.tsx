import { BackgroundFX } from "@/components/background";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <BackgroundFX />
      <div className="glass glass-hover relative w-full max-w-md overflow-hidden p-10 text-center">
        <div className="shimmer pointer-events-none absolute inset-0" />
        <div className="relative flex flex-col items-center">
          <p className="text-[64px] font-black leading-none tracking-tight text-white/5">
            404
          </p>
          <BrandMark className="mt-4 h-12 w-12" />
          <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-100">
            This slide doesn&apos;t exist
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-slate-400">
            The page you&apos;re looking for was removed, was never forged, or
            never made it into the deck.
          </p>
          <Link to="/" className="mt-7">
            <Button className="gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_10px_24px_rgba(34,211,238,0.25)]">
              <ArrowLeft className="h-4 w-4" />
              Back to Pitch Forge
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
