import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

/** Soft, drifting emerald aurora blobs on charcoal. */
export function AuroraBlobs({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="animate-aurora absolute -top-44 -left-36 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,168,107,0.18),transparent_66%)] blur-2xl" />
      <div
        className="animate-aurora absolute top-1/4 -right-44 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),transparent_66%)] blur-2xl"
        style={{ animationDelay: "-9s" }}
      />
      <div
        className="animate-aurora absolute -bottom-56 left-1/3 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(94,234,212,0.1),transparent_66%)] blur-2xl"
        style={{ animationDelay: "-16s" }}
      />
      <div
        className="animate-aurora absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,224,143,0.12),transparent_66%)] blur-2xl"
        style={{ animationDelay: "-4s" }}
      />
    </div>
  );
}

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  hue: string;
}

const PARTICLE_COLORS = [
  "rgba(0,168,107,ALPHA)",
  "rgba(52,211,153,ALPHA)",
  "rgba(94,234,212,ALPHA)",
  "rgba(16,185,129,ALPHA)",
];

/** Canvas of tiny drifting emerald particles (disabled when reduced motion). */
export function ParticleField({ className, count = 46 }: { className?: string; count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let raf = 0;
    const particles: Particle[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.8 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.14,
      vy: -(0.06 + Math.random() * 0.18),
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.9,
      hue: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    });

    const init = () => {
      resize();
      particles.length = 0;
      for (let i = 0; i < count; i++) particles.push(spawn());
      if (reduced) {
        draw();
      } else {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const alpha = 0.18 + 0.35 * Math.abs(Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue.replace("ALPHA", alpha.toFixed(2));
        ctx.fill();
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx + Math.sin(p.phase) * 0.06;
        p.y += p.vy;
        p.phase += 0.008 * p.speed;
        if (p.y < -8) {
          p.y = height + 8;
          p.x = Math.random() * width;
        }
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;
        const alpha = 0.18 + 0.35 * Math.abs(Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue.replace("ALPHA", alpha.toFixed(2));
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };

    init();
    const ro = new ResizeObserver(init);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}

/** Full-page charcoal + emerald glass background: aurora + grid + particles. */
export function BackgroundFX({
  className,
  particleCount = 46,
  grid = true,
}: {
  className?: string;
  particleCount?: number;
  grid?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[oklch(0.13_0.01_170)] print:hidden",
        className,
      )}
    >
      <AuroraBlobs className="absolute inset-0" />
      {grid && <div className="bg-grid absolute inset-0" />}
      <ParticleField count={particleCount} className="absolute inset-0" />
    </div>
  );
}
