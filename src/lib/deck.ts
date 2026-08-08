export type SectionKey =
  | "problem"
  | "features"
  | "tech"
  | "market"
  | "revenue"
  | "competitors";

export interface DeckSection {
  key: SectionKey;
  title: string;
  eyebrow: string;
  bullets: string[];
  accent: string;
  /** true when the section was inferred rather than found in the README */
  derived: boolean;
}

export interface DeckStats {
  words: number;
  lines: number;
  sectionsFound: number;
}

export interface CompetitorCard {
  name: string;
  category: string;
  strengths: string[];
  weaknesses: string[];
  advantage: string;
}

export interface RoadmapPhase {
  phase: string;
  timeline: string;
  items: string[];
}

export interface AIInsights {
  executiveSummary: string;
  elevatorPitch: string;
  tam: string;
  sam: string;
  som: string;
  marketNote: string;
  businessModel: string;
  pricingStrategy: string;
  gtm: string[];
  roadmap: RoadmapPhase[];
  risks: string[];
  fundingAsk: string;
  useOfFunds: string[];
  competitors: CompetitorCard[];
  /** Business facts the README didn't state — surfaced as suggested assumptions. */
  missing: string[];
}

export interface ReadinessMetric {
  key: "innovation" | "technology" | "business" | "scalability" | "market" | "presentation";
  label: string;
  score: number;
  note: string;
}

export interface ReadinessScore {
  overall: number;
  metrics: ReadinessMetric[];
}

export type TemplateId =
  | "glass"
  | "apple"
  | "yc"
  | "sequoia"
  | "startup-dark"
  | "minimal"
  | "amber"
  | "rose"
  | "ocean"
  | "violet"
  | "sunset"
  | "teal"
  | "midnight"
  | "forest"
  | "slate"
  | "coral"
  | "electric";

export interface DeckTemplate {
  id: TemplateId;
  name: string;
  tagline: string;
  accent: string;
  accent2: string;
  bg: [string, string, string];
  dark: boolean;
}

export const DECK_TEMPLATES: DeckTemplate[] = [
  {
    id: "glass",
    name: "Indigo Frost",
    tagline: "Deep indigo glass",
    accent: "#6366f1",
    accent2: "#818cf8",
    bg: ["oklch(0.2 0.05 262)", "oklch(0.155 0.03 270)", "oklch(0.17 0.045 255)"],
    dark: true,
  },
  {
    id: "apple",
    name: "Apple",
    tagline: "Clean light minimal",
    accent: "#0a0a0a",
    accent2: "#555555",
    bg: ["oklch(0.99 0 0)", "oklch(0.96 0.005 260)", "oklch(0.985 0 0)"],
    dark: false,
  },
  {
    id: "yc",
    name: "Y Combinator",
    tagline: "Bold orange energy",
    accent: "#FB651E",
    accent2: "#FF8C42",
    bg: ["oklch(0.21 0.06 40)", "oklch(0.16 0.045 50)", "oklch(0.18 0.05 30)"],
    dark: true,
  },
  {
    id: "sequoia",
    name: "Sequoia",
    tagline: "Earnest dark red",
    accent: "#E5484D",
    accent2: "#FF6B70",
    bg: ["oklch(0.2 0.045 20)", "oklch(0.15 0.03 15)", "oklch(0.17 0.04 30)"],
    dark: true,
  },
  {
    id: "startup-dark",
    name: "Neon Lime",
    tagline: "Charcoal & electric lime",
    accent: "#A3E635",
    accent2: "#D9F99D",
    bg: ["oklch(0.2 0.02 130)", "oklch(0.15 0.015 140)", "oklch(0.17 0.02 120)"],
    dark: true,
  },
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Monochrome editorial",
    accent: "#e4e4e7",
    accent2: "#71717a",
    bg: ["oklch(0.19 0 0)", "oklch(0.15 0 0)", "oklch(0.17 0 0)"],
    dark: true,
  },
  {
    id: "amber",
    name: "Amber Luxe",
    tagline: "Warm gold & charcoal",
    accent: "#F59E0B",
    accent2: "#FBBF24",
    bg: ["oklch(0.2 0.04 60)", "oklch(0.15 0.03 55)", "oklch(0.17 0.035 65)"],
    dark: true,
  },
  {
    id: "rose",
    name: "Rose Quartz",
    tagline: "Soft rose & slate",
    accent: "#F43F5E",
    accent2: "#FB7185",
    bg: ["oklch(0.2 0.04 350)", "oklch(0.15 0.025 345)", "oklch(0.17 0.03 5)"],
    dark: true,
  },
  {
    id: "ocean",
    name: "Deep Ocean",
    tagline: "Navy & cyan depths",
    accent: "#06B6D4",
    accent2: "#22D3EE",
    bg: ["oklch(0.18 0.04 210)", "oklch(0.14 0.03 215)", "oklch(0.16 0.035 205)"],
    dark: true,
  },
  {
    id: "violet",
    name: "Royal Violet",
    tagline: "Purple & lavender glow",
    accent: "#8B5CF6",
    accent2: "#A78BFA",
    bg: ["oklch(0.2 0.05 280)", "oklch(0.15 0.035 275)", "oklch(0.17 0.04 285)"],
    dark: true,
  },
  {
    id: "sunset",
    name: "Sunset Blaze",
    tagline: "Coral & warm amber",
    accent: "#F97316",
    accent2: "#FB923C",
    bg: ["oklch(0.2 0.05 30)", "oklch(0.15 0.035 25)", "oklch(0.17 0.04 35)"],
    dark: true,
  },
  {
    id: "teal",
    name: "Teal Steel",
    tagline: "Teal & cool slate",
    accent: "#14B8A6",
    accent2: "#2DD4BF",
    bg: ["oklch(0.18 0.04 170)", "oklch(0.14 0.03 165)", "oklch(0.16 0.035 175)"],
    dark: true,
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    tagline: "Slate & electric blue",
    accent: "#3B82F6",
    accent2: "#60A5FA",
    bg: ["oklch(0.18 0.04 230)", "oklch(0.14 0.03 225)", "oklch(0.16 0.035 235)"],
    dark: true,
  },
  {
    id: "forest",
    name: "Forest Pine",
    tagline: "Deep green & earth",
    accent: "#22C55E",
    accent2: "#4ADE80",
    bg: ["oklch(0.18 0.04 145)", "oklch(0.14 0.03 150)", "oklch(0.16 0.035 140)"],
    dark: true,
  },
  {
    id: "slate",
    name: "Slate Pro",
    tagline: "Professional grey",
    accent: "#94A3B8",
    accent2: "#CBD5E1",
    bg: ["oklch(0.19 0.01 240)", "oklch(0.15 0.008 235)", "oklch(0.17 0.01 245)"],
    dark: true,
  },
  {
    id: "coral",
    name: "Coral Reef",
    tagline: "Warm coral & blush",
    accent: "#FB7185",
    accent2: "#FDA4AF",
    bg: ["oklch(0.2 0.04 355)", "oklch(0.15 0.03 350)", "oklch(0.17 0.035 0)"],
    dark: true,
  },
  {
    id: "electric",
    name: "Electric Cyan",
    tagline: "Vivid cyan & navy",
    accent: "#22D3EE",
    accent2: "#67E8F9",
    bg: ["oklch(0.18 0.04 195)", "oklch(0.14 0.03 200)", "oklch(0.16 0.035 190)"],
    dark: true,
  },
];

export function getTemplate(id: string): DeckTemplate {
  return DECK_TEMPLATES.find((t) => t.id === id) ?? DECK_TEMPLATES[0];
}

export const SECTION_ORDER: SectionKey[] = [
  "problem",
  "features",
  "tech",
  "market",
  "revenue",
  "competitors",
];

export const SECTION_META: Record<
  SectionKey,
  { title: string; eyebrow: string; icon: string; accent: string }
> = {
  problem: { title: "Problem", eyebrow: "The pain", icon: "flame", accent: "#F43F5E" },
  features: { title: "Solution", eyebrow: "How we fix it", icon: "sparkles", accent: "#6366f1" },
  tech: { title: "Technology", eyebrow: "Built on", icon: "cpu", accent: "#06B6D4" },
  market: { title: "Market Opportunity", eyebrow: "The opportunity", icon: "trending-up", accent: "#F59E0B" },
  revenue: { title: "Business Model", eyebrow: "The model", icon: "line-chart", accent: "#22C55E" },
  competitors: { title: "Competitive Landscape", eyebrow: "The landscape", icon: "crosshair", accent: "#8B5CF6" },
};

/* ------------------------------------------------------------------ */
/* Markdown helpers                                                    */
/* ------------------------------------------------------------------ */

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/(^|\s)\*([^*]*)\*/g, "$1$2")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[#>*_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBadLine(line: string): boolean {
  const t = line.trim().toLowerCase();
  if (!t) return true;
  if (t.startsWith("![") || t.startsWith("<img") || t.startsWith("|")) return true;
  if (t.startsWith("<!--") || t.startsWith("```") || t.startsWith("~~~")) return true;
  if (/^(badges|shields|coverage|license|build|ci)[:|]?/i.test(t) && t.length < 40) return true;
  return false;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'$])/)
    .map((s) => stripInlineMarkdown(s).trim())
    .filter((s) => s.length > 25);
}

const HEADING_KEYWORDS: Record<SectionKey, string[]> = {
  problem: ["problem", "pain", "why ", "motivation", "background", "challenge", "issue", "gap"],
  features: ["feature", "capabilit", "what it does", "what can", "solution", "how it work", "function", "use case", "key abilities", "product"],
  tech: ["tech", "stack", "architecture", "built with", "built on", "dependency", "librar", "framework", "api", "getting started", "installation", "setup"],
  market: ["market", "audience", "who is", "who should", "use case", "user", "customer", "target", "community", "demand", "opportunity"],
  revenue: ["revenue", "business model", "monetiz", "pricing", "commercial", "how we make", "business", "token", "economics"],
  competitors: ["competitor", "alternativ", "comparison", "vs.", " v ", "landscape", "related work", "other tools", "market map"],
};

function classifyHeading(text: string): SectionKey | null {
  const t = " " + text.toLowerCase().trim() + " ";
  let best: SectionKey | null = null;
  let bestScore = 0;
  for (const key of SECTION_ORDER) {
    let score = 0;
    for (const kw of HEADING_KEYWORDS[key]) {
      if (t.includes(kw)) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return bestScore >= 4 ? best : null;
}

/* ------------------------------------------------------------------ */
/* Parser                                                              */
/* ------------------------------------------------------------------ */

interface ParsedBlock {
  key: SectionKey;
  heading: string;
  bullets: string[];
}

interface ParsedDoc {
  title: string;
  tagline: string;
  preamble: string[];
  blocks: ParsedBlock[];
  codeLangs: string[];
}

function parseReadme(markdown: string): ParsedDoc {
  const rawLines = markdown.split(/\r?\n/);
  const lines = rawLines.filter((l) => !l.trim().startsWith("<!--"));

  let title = "";
  let tagline = "";
  const preamble: string[] = [];
  const blocks: ParsedBlock[] = [];
  const codeLangs: string[] = [];

  let inFence = false;
  let current: ParsedBlock | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    paragraph = [];
    if (!text || isBadLine(text)) return;
    const clean = stripInlineMarkdown(text);
    if (!clean) return;
    if (!title) {
      title = clean;
      return;
    }
    if (!tagline && clean.length > 12) {
      tagline = clean;
      return;
    }
    if (!current) {
      preamble.push(clean);
    } else {
      const sentences = splitSentences(clean);
      current.bullets.push(...sentences);
    }
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (/^```/.test(line) || /^~~~/.test(line)) {
      if (!inFence && /^```\s*([\w+#.-]+)/.test(line)) {
        codeLangs.push(line.replace(/^```\s*/, "").split(/\s/)[0]);
      }
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(line);
    if (headingMatch) {
      flushParagraph();
      const heading = stripInlineMarkdown(headingMatch[2]);
      if (headingMatch[1] === "#" && !title) {
        title = heading;
        current = null;
        continue;
      }
      const key = classifyHeading(heading);
      if (key) {
        if (current) blocks.push(current);
        current = { key, heading, bullets: [] };
      } else {
        if (current) blocks.push(current);
        current = null;
      }
      continue;
    }

    const bulletMatch = /^\s*(?:[-*+•]|\d+[.)])\s+(.+)$/.exec(raw);
    if (bulletMatch) {
      const bullet = stripInlineMarkdown(bulletMatch[1]);
      if (bullet && !isBadLine(bullet) && bullet.length > 2) {
        if (current) current.bullets.push(bullet);
        else preamble.push(bullet);
      }
      continue;
    }

    if (!line) {
      flushParagraph();
      continue;
    }
    if (isBadLine(line)) continue;

    paragraph.push(line);
  }
  flushParagraph();
  if (current) blocks.push(current);

  return { title, tagline, preamble, blocks, codeLangs };
}

/* ------------------------------------------------------------------ */
/* Fallbacks                                                           */
/* ------------------------------------------------------------------ */

const FALLBACK: Record<SectionKey, { bullets: string[]; derived: boolean }> = {
  problem: {
    bullets: [
      "Existing workflows are slow, fragmented, and held together by manual process",
      "Teams lose time stitching together disconnected tools and data",
      "The gap compounds as teams and protocols scale",
    ],
    derived: true,
  },
  features: {
    bullets: [
      "Streamlined, focused core workflows that remove busywork",
      "Fast and reliable by default, with a developer-first experience",
      "Works out of the box with minimal setup and configuration",
    ],
    derived: true,
  },
  tech: {
    bullets: [
      "Modern TypeScript tooling on a battle-tested stack",
      "Open-source libraries instead of reinventing infrastructure",
      "Deployable to any cloud with minimal operational overhead",
    ],
    derived: true,
  },
  market: {
    bullets: [
      "Early adopters: developers and operators solving this problem today",
      "Expands to adjacent teams as adoption and trust grow",
      "Global demand for faster, simpler, more focused tooling",
    ],
    derived: true,
  },
  revenue: {
    bullets: [
      "Freemium core with paid team plans as the growth engine",
      "Usage-based pricing scales naturally with customer value",
      "Expansion revenue from adjacent features and integrations",
    ],
    derived: true,
  },
  competitors: {
    bullets: [
      "Legacy incumbents burdened by heavy, complex workflows",
      "Point solutions that solve one slice but don't integrate",
      "Our focus and speed are the moat",
    ],
    derived: true,
  },
};

function smartFallback(
  key: SectionKey,
  ctx: { preamble: string[]; blocks: ParsedBlock[]; codeLangs: string[] },
): string[] {
  const fallback = FALLBACK[key];
  const out: string[] = [];

  if (key === "problem") {
    for (const p of ctx.preamble) out.push(...splitSentences(p));
  }
  if (key === "features") {
    const extras: string[] = [];
    for (const b of ctx.blocks) if (b.key !== key) extras.push(...b.bullets);
    out.push(...extras);
    const headings = ctx.blocks.map((b) => b.heading);
    if (out.length === 0) out.push(...headings.filter((h) => h.length < 60));
  }
  if (key === "tech" && ctx.codeLangs.length > 0) {
    const langs = [...new Set(ctx.codeLangs)].slice(0, 3);
    out.push(...langs.map((l) => `Built with ${l.charAt(0).toUpperCase() + l.slice(1)}`));
  }

  for (const b of fallback.bullets) out.push(b);
  return [...new Set(out)].slice(0, 5);
}

/* ------------------------------------------------------------------ */
/* Tech stack extraction                                               */
/* ------------------------------------------------------------------ */

/** Curated set of recognizable languages, frameworks, and APIs. */
const TECH_KEYWORDS = [
  // languages
  "TypeScript", "JavaScript", "Python", "Go", "Golang", "Rust", "Solidity", "C++", "C#",
  "Java", "Kotlin", "Swift", "Ruby", "PHP", "SQL", "Bash", "Shell", "Zig", "Move", "Cairo",
  // web & app frameworks
  "React", "Next.js", "Vue", "Angular", "Svelte", "Node.js", "Deno", "Express", "FastAPI",
  "Django", "Flask", "Spring", "Laravel", "Rails", "Tailwind", "Vite", "React Native",
  "Flutter", "WebAssembly", "GraphQL", "REST API", "tRPC", "gRPC",
  // data & infra
  "PostgreSQL", "Redis", "MongoDB", "MySQL", "SQLite", "Kafka", "Docker", "Kubernetes",
  "Terraform", "AWS", "Azure", "GCP", "Cloudflare", "IPFS", "Filecoin", "Arweave",
  // blockchain
  "Ethereum", "EVM", "Algorand", "Solana", "Polygon", "Arbitrum", "Base", "Optimism",
  "Foundry", "Hardhat", "Truffle", "Viem", "Ethers.js", "Wagmi", "Web3.js", "EigenLayer",
  "smart contracts", "ERC-20", "ERC-721", "ZK", "zkSync", "Starknet", "Chainlink", "The Graph",
  // AI
  "OpenAI", "Gemini", "Llama", "Hugging Face", "PyTorch", "TensorFlow", "LangChain", "RAG",
];

/**
 * Scan doc content for recognizable tech keywords and return a clean,
 * de-duplicated stack list (max 10). Used to surface real languages and
 * APIs on the Technology slide and in the PPTX export.
 */
export function extractTechStack(texts: string[]): string[] {
  const joined = " " + texts.join(" ") + " ";
  const found = new Set<string>();
  for (const kw of TECH_KEYWORDS) {
    // Word-boundary match: "Go" matches "Go", not "going"; "SQL" matches
    // "SQL", not "PostgreSQL". Non-alphanumeric keyword chars (+, ., #) are
    // kept literal via escaping, and the char before/after must be non-alnum.
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    if (re.test(joined)) found.add(kw);
  }
  return [...found].slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* AI insights engine (rule-based synthesis)                           */
/* ------------------------------------------------------------------ */

/** Largest $ figure in a string ("$36B", "$1.2M", "10%") — for market sizing. */
function extractMoney(text: string): { value: number; unit: "K" | "M" | "B" } | null {
  const m = /\$\s*([\d.,]+)\s*([kmb])/i.exec(text);
  if (!m) return null;
  const raw = parseFloat(m[1].replace(/,/g, ""));
  if (!Number.isFinite(raw)) return null;
  return { value: raw, unit: m[2].toUpperCase() as "K" | "M" | "B" };
}

function formatMoney(v: number, unit: "K" | "M" | "B"): string {
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}${unit}`;
}

function detectMissingInfo(
  sections: DeckSection[],
  markdown: string,
): string[] {
  const missing: string[] = [];
  const md = markdown.toLowerCase();
  for (const s of sections) {
    if (s.derived) missing.push(`No explicit “${s.title}” section — we assumed a sensible ${s.title.toLowerCase()} narrative.`);
  }
  if (!/\b(team|founder|about us)\b/.test(md)) {
    missing.push("No team or founder section — investors will want a team slide.");
  }
  if (!/\b(roadmap|timeline|milestone)\b/.test(md)) {
    missing.push("No roadmap — we drafted a phased build plan as a placeholder.");
  }
  if (!/\b(traction|users|downloads|tvL|tvl|monthly active)\b/.test(md)) {
    missing.push("No traction metrics — add usage numbers before a live pitch.");
  }
  if (!/\b(financ|revenue|unit economics)\b/.test(md)) {
    missing.push("No financials — our projections are illustrative estimates.");
  }
  return missing.slice(0, 5);
}

function generateInsights(
  title: string,
  tagline: string,
  sections: DeckSection[],
): AIInsights {
  const byKey = Object.fromEntries(sections.map((s) => [s.key, s]));
  const featureBullets = byKey.features?.bullets ?? [];
  const marketBullets = byKey.market?.bullets ?? [];
  const revBullets = byKey.revenue?.bullets ?? [];
  const compBullets = byKey.competitors?.bullets ?? [];

  const marketText = marketBullets.join(" ") + " " + byKey.market?.bullets.join(" ");
  const revText = revBullets.join(" ");

  // --- Market sizing: base TAM on the largest figure found, else estimate.
  const money = extractMoney(marketText) ?? extractMoney(revText);
  let tam = "$10B+";
  let sam = "$1.2B";
  let som = "$120M";
  if (money) {
    const base = money.value;
    tam = formatMoney(base, money.unit);
    sam = formatMoney(Math.max(1, Math.round(base * 0.12 * 10) / 10), money.unit === "K" ? "K" : money.unit);
    som = formatMoney(
      Math.max(1, Math.round(base * 0.012 * 100) / 100),
      money.unit === "K" ? "K" : money.unit === "B" ? "M" : money.unit,
    );
  }

  const primary = featureBullets[0]?.toLowerCase() ?? "a focused solution";

  const executiveSummary =
    `${title} ${tagline ? `is ${tagline.charAt(0).toLowerCase() + tagline.slice(1)}` : "solves a real, urgent problem for a technical audience"}. ` +
    `The product focuses on ${primary}, with a clear path from early adopters to a broad addressable market. ` +
    `Revenue is anchored in ${revBullets[0]?.toLowerCase() ?? "a freemium + usage-based model"}, and the moat sits in ${compBullets[0]?.toLowerCase() ?? "focus, speed, and developer trust"}.`;

  const elevatorPitch =
    `We're building ${title} — ${tagline ? tagline.charAt(0).toLowerCase() + tagline.slice(1) : "a developer-first tool"}. ` +
    `Today, ${byKey.problem?.bullets[0]?.toLowerCase() ?? "this workflow is manual, slow, and fragmented"}. ` +
    `${title} fixes that with ${primary}, so teams can ${byKey.market?.bullets[0]?.toLowerCase() ?? "ship faster and scale with confidence"}.`;

  const marketNote =
    money
      ? `The opportunity is sizable: the largest figure we could verify from your docs is ${tam}, with ${sam} realistically addressable by your core buyer and ${som} captureable in the first three years.`
      : "Your docs don't state a market size, so we estimated a conservative tiered funnel — TAM, SAM, SOM — that you should replace with cited research before pitching live.";

  const pricingStrategy =
    revBullets.find((b) => /freemium|free tier|pricing|paid/.test(b)) ??
    "Freemium self-serve tier to acquire developers, paid team plans for organizations, and usage-based add-ons as value grows.";

  const businessModel =
    revBullets[0] ??
    "Usage-based pricing with a free tier — acquisition is bottom-up through developers, monetization follows organizational adoption.";

  const gtm = [
    `Seed with the community that feels the pain today: ${byKey.market?.bullets[0]?.toLowerCase() ?? "developers and early adopters"} (hackathons, Discord, GitHub).`,
    "Ship a public, documented MVP and publish technical content that ranks for the problem keywords.",
    "Convert early adopters into reference accounts; then expand through partnerships and an enterprise motion.",
  ];

  const roadmap: RoadmapPhase[] = [
    {
      phase: "MVP",
      timeline: "Months 0–3",
      items: [featureBullets[0] ?? "Core workflow shipped", featureBullets[1] ?? "Fast, reliable fundamentals", "Private beta with design partners"],
    },
    {
      phase: "Growth",
      timeline: "Months 4–9",
      items: ["Public launch + onboarding polish", "Integrations that compound value", "Self-serve monetization live"],
    },
    {
      phase: "Scale",
      timeline: "Months 10–18",
      items: ["Enterprise & team workflows", "Platform APIs and ecosystem", "Expansion into adjacent segments"],
    },
  ];

  const risks = [
    "Competitor speed: incumbents could bundle this capability — the moat is focus and developer trust.",
    "Adoption risk: technical users are skeptical of unproven tooling — open source and audits de-risk this.",
    ...(byKey.revenue?.derived
      ? ["Monetization unproven: revenue model is assumed, not validated — pricing tests are needed early."]
      : []),
    ...(byKey.market?.derived
      ? ["Market size unverified: the TAM/SAM/SOM here are estimates pending cited research."]
      : []),
  ].slice(0, 3);

  const fundingAsk = "We are raising $750K in pre-seed to reach the Growth phase — 18 months of runway.";
  const useOfFunds = [
    "Team — 3 engineers, 1 designer, 1 growth (60%)",
    "Infrastructure & tooling (15%)",
    "Go-to-market & content (15%)",
    "Legal, audits, and buffer (10%)",
  ];

  const competitors: CompetitorCard[] = [
    {
      name: "Legacy incumbents",
      category: "Heavy platforms",
      strengths: ["Brand recognition", "Existing enterprise install base", "Broad feature surface"],
      weaknesses: ["Slow to ship", "Complex onboarding", "Poor developer experience"],
      advantage: "We ship in days, integrate in minutes, and feel native to the modern stack.",
    },
    {
      name: "Point solutions",
      category: "Single-slice tools",
      strengths: ["Focused UX", "Cheap to try", "Simple mental model"],
      weaknesses: ["Don't integrate", "Limited scope", "Stuck features"],
      advantage: "Our product covers the full loop, not one slice — one tool, one workflow.",
    },
    {
      name: `${title} (us)`,
      category: "The new entrant",
      strengths: [featureBullets[0] ?? "Differentiated core", featureBullets[1] ?? "Developer-first experience", "Speed & focus"],
      weaknesses: ["Young brand", "Smaller team", "Still proving enterprise fit"],
      advantage: "Built from first principles for this exact problem — no legacy to drag.",
    },
  ];

  return {
    executiveSummary,
    elevatorPitch,
    tam,
    sam,
    som,
    marketNote,
    businessModel,
    pricingStrategy,
    gtm,
    roadmap,
    risks,
    fundingAsk,
    useOfFunds,
    competitors,
    missing: detectMissingInfo(sections, ""),
  };
}

/* ------------------------------------------------------------------ */
/* Investor readiness score                                            */
/* ------------------------------------------------------------------ */

function computeReadiness(
  sections: DeckSection[],
  stats: DeckStats,
  insights: AIInsights,
): ReadinessScore {
  const found = (k: SectionKey) => !sections.find((s) => s.key === k)?.derived;

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const innovation = clamp(
    58 + (found("problem") ? 10 : 0) + (found("features") ? 10 : 0) + (stats.words > 400 ? 8 : 0),
  );
  const technology = clamp(
    56 + (found("tech") ? 14 : 0) + (stats.lines > 80 ? 6 : 0),
  );
  const business = clamp(
    50 + (found("revenue") ? 16 : 0) + (insights.businessModel ? 6 : 0),
  );
  const scalability = clamp(
    52 + (found("market") ? 10 : 0) + (found("tech") ? 6 : 0) + (stats.words > 500 ? 6 : 0),
  );
  const market = clamp(
    50 + (found("market") ? 14 : 0) + (insights.tam !== "$10B+" ? 8 : 0) + (found("competitors") ? 6 : 0),
  );
  const presentation = clamp(
    60 + sections.filter((s) => !s.derived).length * 4 + (stats.words > 300 ? 6 : 0),
  );

  const metrics: ReadinessMetric[] = [
    { key: "innovation", label: "Innovation", score: innovation, note: innovation > 70 ? "Differentiated core" : "Sharpen the wedge" },
    { key: "technology", label: "Technology", score: technology, note: technology > 70 ? "Credible stack" : "Add stack details" },
    { key: "business", label: "Business", score: business, note: business > 70 ? "Model defined" : "Define monetization" },
    { key: "scalability", label: "Scalability", score: scalability, note: scalability > 70 ? "Growth-ready" : "Show the loop" },
    { key: "market", label: "Market", score: market, note: market > 70 ? "Big opportunity" : "Cite the market" },
    { key: "presentation", label: "Presentation", score: presentation, note: presentation > 70 ? "Investor-ready" : "Tighten the story" },
  ];

  const overall = clamp(metrics.reduce((a, m) => a + m.score, 0) / metrics.length);
  return { overall, metrics };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function buildDeck(markdown: string): PitchDeck {
  const parsed = parseReadme(markdown);

  const fallbackCtx = {
    preamble: parsed.preamble,
    blocks: parsed.blocks,
    codeLangs: parsed.codeLangs,
  };

  const sections: DeckSection[] = SECTION_ORDER.map((key) => {
    const block = parsed.blocks.find((b) => b.key === key);
    const meta = SECTION_META[key];
    let bullets: string[] = [];
    let derived = false;

    if (block) {
      // Section found in the README — never "derived". We may still pad thin
      // sections with sensible fallback bullets, but the section is real.
      bullets = [...block.bullets];
      if (bullets.length < 3) {
        bullets.push(...smartFallback(key, fallbackCtx));
      }
    } else {
      bullets = smartFallback(key, fallbackCtx);
      derived = true;
    }

    bullets = [...new Set(bullets)]
      .map((b) => stripInlineMarkdown(b).trim())
      .filter((b) => b.length >= 8)
      .slice(0, 5);
    if (bullets.length < 3) {
      const fb = smartFallback(key, fallbackCtx).filter((b) => !bullets.includes(b));
      bullets.push(...fb.slice(0, 5 - bullets.length));
      derived = true;
    }

    return {
      key,
      title: meta.title,
      eyebrow: meta.eyebrow,
      bullets,
      accent: meta.accent,
      derived,
    };
  });

  const nonEmpty = markdown.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const words = markdown.split(/\s+/).filter(Boolean).length;
  const sectionsFound = sections.filter((s) => !s.derived).length;
  const stats: DeckStats = { words, lines: nonEmpty.length, sectionsFound };

  const title = parsed.title || "Untitled Project";
  const tagline =
    parsed.tagline ||
    (parsed.preamble[0] ? stripInlineMarkdown(parsed.preamble[0]) : "A focused solution to a real problem — built to ship.");

  const insights = generateInsights(title, tagline, sections);
  // Re-run missing detection with the raw markdown so it can check for teams/roadmaps.
  insights.missing = detectMissingInfo(sections, markdown);
  const readiness = computeReadiness(sections, stats, insights);

  return {
    title,
    tagline,
    sections,
    insights,
    readiness,
    stats,
    template: "glass",
  };
}

export interface PitchDeck {
  title: string;
  tagline: string;
  sections: DeckSection[];
  insights: AIInsights;
  readiness: ReadinessScore;
  stats: DeckStats;
  template: string;
}

/** Number of floating cards in the transformation sequence. */
export const CARD_KEYS = SECTION_ORDER;

/* ------------------------------------------------------------------ */
/* Sample READMEs (blockchain hackathon flavored)                      */
/* ------------------------------------------------------------------ */

export const SAMPLE_README_RICH = `# Volta — Liquid Restaking, One Transaction

Volta turns any staked ETH position into instantly spendable yield. Deposit once, and Volta re-stakes across leading protocols to maximize returns while keeping every position liquid, audited, and withdrawable in a single transaction.

## The Problem

Staking on Ethereum locks capital for weeks, fragments yield across a dozen protocols, and forces users to manage multiple positions and unlock periods manually. Retail stakers are losing yield they can't see, and the complexity keeps new capital out of the ecosystem.

## Solution & Features

- One-click restaking across EigenLayer and leading LRT protocols
- Auto-compounding rewards settled every epoch, no gas rush
- Instant liquidity: withdraw or spend staked positions anytime
- Battle-tested smart contracts with public audits and invariants
- SDK and API for wallets, exchanges, and DAO treasuries

## Tech Stack

- Solidity and Foundry for audited smart contracts
- EigenLayer AVS infrastructure for restaking
- TypeScript, React, and Viem for the dApp and SDK
- PostgreSQL + Redis backend for indexing and rewards

## Market

$36B+ is currently staked on Ethereum, yet fewer than 12% of holders participate in restaking due to complexity. Liquid staking tokens already trade at premiums, and the addressable market grows with every L2 and rollup that settles to Ethereum.

## Revenue Model

Volta takes a 10% performance fee on rewards generated through restaking. At scale, the fee compounds: deeper yield attracts more TVL, more TVL attracts more protocols, and protocols pay to integrate Volta's API.

## Competitors

Lido dominates plain liquid staking but offers no restaking. EigenLayer is infrastructure, not a product — users still manage positions manually. Rocket Pool requires capital and node operators. No one combines one-click deposits with automated restaking across the ecosystem.
`;

export const SAMPLE_README_MINIMAL = `# merkle-feed

A command-line tool that watches any EVM contract and streams its state changes as signed, verifiable data feeds. Built for hackathon teams that need reliable on-chain data without running their own indexer.

\`\`\`bash
npx merkle-feed watch 0x7a250d5630b4cf539739df2c5dacb4c659f2488d --abi ./abi.json
\`\`\`

## Installation

Install globally with npm, or run it directly with npx. It works against any EVM-compatible chain — Ethereum, Arbitrum, Base, or Polygon — with nothing but an RPC URL.

## Usage

Point it at a contract, pick the events to watch, and it emits signed JSON feeds with cryptographic proofs you can verify off-chain. Perfect for oracles, demo-day dashboards, and cross-chain data relays.
`;
