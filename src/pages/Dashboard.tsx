import { AppShell } from "@/components/app-shell";
import { TransformExperience } from "@/components/deck/transform";
import { ReadinessRing, SectionIcon } from "@/components/deck/slides";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import {
  SAMPLE_README_MINIMAL,
  SAMPLE_README_RICH,
  SECTION_META,
  buildDeck,
  type PitchDeck,
} from "@/lib/deck";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useAction, useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  FileUp,
  Github,
  Loader2,
  Presentation,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

/** Extract text from an uploaded file: markdown/txt, PDF, or DOCX. */
async function parseFileToText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= Math.min(doc.numPages, 24); i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text +=
        content.items
          .map((it) => ("str" in it ? (it as { str: string }).str : ""))
          .join(" ") + "\n\n";
    }
    return text.trim() || "# Extracted PDF — no text found";
  }
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value.trim() || "# Extracted DOCX — no text found";
  }
  return await file.text();
}

/** Progress step indicator for GitHub import */
function ProgressSteps({ steps, currentStep }: { steps: string[]; currentStep: string }) {
  return (
    <div className="mt-3 space-y-1.5">
      {steps.map((step, i) => {
        const isActive = step === currentStep;
        const isPast = steps.indexOf(currentStep) > i;
        return (
          <div
            key={step}
            className={cn(
              "flex items-center gap-2 text-[12px]",
              isActive ? "text-indigo-300" : isPast ? "text-white/50" : "text-white/30"
            )}
          >
            {isPast ? (
              <span className="grid h-4 w-4 place-items-center rounded-full bg-indigo-500/20 text-indigo-300">
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            ) : isActive ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-300" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            )}
            <span className={cn(isActive && "font-medium")}>{step}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const [markdown, setMarkdown] = useState("");
  const [phase, setPhase] = useState<"idle" | "transforming">("idle");
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState<"file" | "github" | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [githubProgress, setGithubProgress] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState("");

  const createDeck = useMutation(api.decks.createDeck);
  const deleteDeck = useMutation(api.decks.deleteDeck);
  const decks = useQuery(api.decks.listDecks);
  const fetchRepo = useAction(api.github.fetchGithubRepo);

  const analysis = useMemo(() => {
    if (markdown.trim().length < 20) return null;
    try {
      return buildDeck(markdown);
    } catch {
      return null;
    }
  }, [markdown]);

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setImporting("file");
    try {
      const text = await parseFileToText(file);
      setMarkdown(text);
      toast.success(`Imported ${file.name} (${text.length.toLocaleString()} chars)`);
    } catch (error) {
      console.error(error);
      toast.error("Could not read that file — try a .md, .txt, .pdf, or .docx");
    } finally {
      setImporting(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const handleGithub = async () => {
    if (!githubUrl.trim()) return;
    setImporting("github");
    
    const steps = [
      "Connecting...",
      "Fetching Repository...",
      "Detecting Default Branch...",
      "Reading README...",
      "Scanning Files...",
      "Analyzing Dependencies...",
      "Generating Repository Intelligence...",
      "Investor Analysis Ready",
    ];
    
    setGithubProgress(steps);
    setCurrentStep(steps[0]);
    
    try {
      // Simulate progress steps while the server-side action works
      for (let i = 0; i < steps.length - 3; i++) {
        setCurrentStep(steps[i]);
        await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
      }

      const result = await fetchRepo({ url: githubUrl.trim() });

      setCurrentStep(steps[steps.length - 1]);
      await new Promise(r => setTimeout(r, 200));

      setMarkdown(result.content);
      if (result.notice) {
        toast.warning(result.notice, { duration: 6000 });
      } else {
        toast.success(`Repository imported: ${result.source}`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not fetch the repository";
      toast.error(message, {
        duration: 6000,
        description: "You can paste your project description manually below.",
      });
      // Don't clear the editor — the user keeps whatever they already had
    } finally {
      setImporting(null);
      setGithubProgress([]);
      setCurrentStep("");
    }
  };

  const handleGenerate = () => {
    if (markdown.trim().length < 20) {
      toast.error("Add a README first — a few sentences is enough to start.");
      return;
    }
    setPhase("transforming");
  };

  const handleDone = async (deck: PitchDeck) => {
    if (saving) return;
    setSaving(true);
    try {
      const { deckId } = await createDeck({
        projectName: deck.title,
        sourceMarkdown: markdown,
        title: deck.title,
        tagline: deck.tagline,
        sections: deck.sections.map((s) => ({
          key: s.key,
          title: s.title,
          eyebrow: s.eyebrow,
          bullets: s.bullets,
          accent: s.accent,
          derived: s.derived,
        })),
        stats: deck.stats,
        insights: deck.insights,
        readiness: deck.readiness,
        template: "glass",
      });
      setPhase("idle");
      navigate(`/deck/${deckId}`);
    } catch (error) {
      console.error(error);
      setSaving(false);
      setPhase("idle");
      toast.error(
        error instanceof Error ? error.message : "Could not save the deck. Please try again.",
      );
    }
  };

  return (
    <AppShell>
      <AnimatePresence>
        {phase === "transforming" && markdown && (
          <TransformExperience
            markdown={markdown}
            deck={analysis ?? buildDeck(markdown)}
            onDone={handleDone}
            onSkip={() => handleDone(analysis ?? buildDeck(markdown))}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl"
      >
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-indigo-400">
              Deck studio
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
              Forge an investor pitch from your repo
            </h1>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-white/55">
              Upload a README, Markdown, PDF, or DOCX — or paste a GitHub
              repository — and GlassPitch AI analyzes your project, enriches
              missing business insights, and generates a professional
              investor presentation.
            </p>
          </div>
          <Link to="/decks">
            <Button variant="outline" className="glass-soft gap-2 rounded-xl text-white/70 hover:bg-white/10">
              <Presentation className="h-4 w-4" />
              My decks
            </Button>
          </Link>
        </header>

        {/* Generator */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.12fr_1fr]">
          {/* Input */}
          <div className="glass overflow-hidden">
            <div className="flex h-full flex-col p-6">
              {/* Drag & drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all duration-300",
                  dragOver
                    ? "border-indigo-400/70 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
                    : "border-white/15 bg-white/[0.03] hover:border-indigo-400/40 hover:bg-white/[0.05]",
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown,.txt,.pdf,.docx,text/markdown,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <span className="glass-soft grid h-12 w-12 place-items-center rounded-2xl text-indigo-300">
                  <FileUp className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-white/85">
                    Drop your README here
                  </p>
                  <p className="mt-0.5 text-[12px] text-white/45">
                    Markdown · PDF · DOCX · TXT
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-soft gap-2 rounded-lg text-[12.5px] text-white/70 hover:bg-white/10"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing === "file"}
                >
                  {importing === "file" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  {importing === "file" ? "Reading…" : "Browse files"}
                </Button>
              </div>

              {/* GitHub import */}
              <div className="mt-3 flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60">
                  <Github className="h-4 w-4" />
                </span>
                <input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGithub()}
                  placeholder="Paste GitHub repository URL — github.com/owner/repo"
                  className="h-9 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-[13px] text-white/85 shadow-inner backdrop-blur-md placeholder:text-white/35 focus:border-indigo-400/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGithub}
                  disabled={!githubUrl.trim() || importing === "github"}
                  className="glass-soft shrink-0 gap-1.5 rounded-lg text-[12.5px] text-white/70 hover:bg-white/10"
                >
                  {importing === "github" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Github className="h-3.5 w-3.5" />
                  )}
                  Fetch
                </Button>
              </div>
              
              {/* Progress indicator */}
              {githubProgress.length > 0 && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <ProgressSteps steps={githubProgress} currentStep={currentStep} />
                </div>
              )}

              {/* Editor */}
              <div className="relative mt-3 flex-1">
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder={"# My Startup\n\nWe fix the way teams…\n\n## Features\n- …"}
                  className="h-full min-h-[240px] w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 font-mono text-[13px] leading-relaxed text-white/85 shadow-inner backdrop-blur-md placeholder:text-white/35 focus:border-indigo-400/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
                  spellCheck={false}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-medium text-white/45">Try a sample:</span>
                  <button
                    type="button"
                    onClick={() => setMarkdown(SAMPLE_README_RICH)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-medium text-white/70 backdrop-blur-md transition hover:bg-white/10"
                  >
                    ⛓️ Volta · Liquid restaking
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarkdown(SAMPLE_README_MINIMAL)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-medium text-white/70 backdrop-blur-md transition hover:bg-white/10"
                  >
                    ⚡ merkle-feed · EVM CLI
                  </button>
                </div>
                <span className="text-[12px] tabular-nums text-white/45">
                  {markdown.length.toLocaleString()} chars
                </span>
              </div>

              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={markdown.trim().length < 20 || phase === "transforming"}
                className="shimmer mt-4 h-12 w-full gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-[15px] font-semibold text-white shadow-[0_14px_34px_rgba(99,102,241,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(99,102,241,0.45)] disabled:opacity-40"
              >
                <Wand2 className="h-5 w-5" />
                Generate pitch deck
                <ArrowRight className="h-[18px] w-[18px]" />
              </Button>
              <Link
                to="/wallet"
                className="mt-2.5 block text-center text-[11.5px] text-white/45 underline-offset-2 transition hover:text-indigo-300 hover:underline"
              >
                Free plan includes 2 decks — upgrade to Founder for unlimited.
              </Link>
            </div>
          </div>

          {/* Live analysis */}
          <div className="glass overflow-hidden">
            <div className="flex h-full flex-col p-6">
              <div className="flex items-center gap-2.5">
                <span className="glass-soft grid h-9 w-9 place-items-center rounded-xl text-indigo-300">
                  <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <div className="leading-tight">
                  <p className="text-[15px] font-semibold text-white">Live analysis</p>
                  <p className="text-[12px] text-white/45">What GlassPitch AI sees — updates as you type</p>
                </div>
              </div>

              {analysis ? (
                <div className="mt-4 flex flex-1 flex-col">
                  <div className="flex items-center gap-4">
                    <ReadinessRing score={analysis.readiness.overall} size={116} stroke={9} label="Readiness" />
                    <div className="grid flex-1 grid-cols-2 gap-2.5">
                      {[
                        { label: "Words", value: analysis.stats.words.toLocaleString() },
                        { label: "Lines", value: analysis.stats.lines.toLocaleString() },
                        {
                          label: "Sections",
                          value: `${analysis.stats.sectionsFound}/${analysis.sections.length}`,
                        },
                        { label: "Slides", value: "13" },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center backdrop-blur-md"
                        >
                          <div className="text-lg font-bold tabular-nums text-white">{s.value}</div>
                          <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/45">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1 no-scrollbar">
                    {analysis.sections.map((section) => {
                      const meta = SECTION_META[section.key];
                      return (
                        <motion.div
                          key={section.key}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 backdrop-blur-md"
                        >
                          <span
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white"
                            style={{ background: meta.accent }}
                          >
                            <SectionIcon name={section.key === "tech" ? "cpu" : section.key === "revenue" ? "line-chart" : section.key} className="h-3.5 w-3.5" />
                          </span>
                          <span className="flex-1 text-[13.5px] font-semibold text-white/85">
                            {section.title}
                          </span>
                          <span className="text-[11px] tabular-nums text-white/45">
                            {section.bullets.length} pts
                          </span>
                          <Badge
                            className={cn(
                              "border-transparent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                              section.derived
                                ? "bg-amber-500/10 text-amber-300"
                                : "bg-indigo-500/10 text-indigo-300",
                            )}
                          >
                            {section.derived ? "derived" : "found"}
                          </Badge>
                        </motion.div>
                      );
                    })}
                  </div>

                  {analysis.insights.missing.length > 0 && (
                    <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-3.5 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                        Suggested business assumptions
                      </p>
                      <ul className="mt-1 space-y-1">
                        {analysis.insights.missing.slice(0, 3).map((m) => (
                          <li key={m} className="text-[12px] leading-snug text-amber-100/70">
                            • {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
                  <span className="glass-soft grid h-14 w-14 place-items-center rounded-2xl text-white/40">
                    <FileText className="h-6 w-6" />
                  </span>
                  <p className="mt-4 max-w-[260px] text-[13.5px] leading-relaxed text-white/45">
                    Add a README on the left — your story sections and investor
                    readiness score will surface here in real time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent decks */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Your recent decks
            </h2>
            <Link
              to="/decks"
              className="flex items-center gap-1 text-[13px] font-semibold text-indigo-300 transition hover:text-indigo-200"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {decks === undefined ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-36 rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : decks.length === 0 ? (
            <div className="glass-soft mt-4 flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
              <span className="glass-soft grid h-12 w-12 place-items-center rounded-2xl text-white/70">
                <Presentation className="h-5 w-5" />
              </span>
              <p className="text-[14px] text-white/60">
                No decks yet{user?.name ? `, ${user.name}` : ""}. Add a README
                above and forge your first one.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {decks.slice(0, 6).map((deck, i) => (
                <motion.div
                  key={deck._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="glass glass-hover group relative overflow-hidden rounded-2xl p-5"
                >
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-30"
                    style={{ background: deck.sections[0]?.accent ?? "#6366f1" }}
                  />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 text-[15.5px] font-bold text-white">
                        {deck.title}
                      </h3>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            aria-label="Delete deck"
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/40 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-strong rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{deck.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This removes the deck permanently. This action cannot be undone.
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
                    <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/55">
                      {deck.tagline}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {deck.sections.slice(0, 6).map((s) => (
                        <span
                          key={s.key}
                          className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                          style={{ background: `${s.accent}1a`, color: s.accent }}
                        >
                          {s.title}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[11.5px] font-medium text-white/45">
                        13 slides
                      </span>
                      <Link
                        to={`/deck/${deck._id}`}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-[0_8px_18px_rgba(99,102,241,0.3)] transition hover:-translate-y-0.5"
                      >
                        Open <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </motion.div>
    </AppShell>
  );
}
