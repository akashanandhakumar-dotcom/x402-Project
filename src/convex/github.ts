import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * GitHub repository ingestion for pitch deck generation.
 *
 * Runs server-side in a Convex action so fetching is never blocked by the
 * browser's CORS/CSP rules or per-browser API rate limits. Given any valid
 * GitHub URL, it:
 *
 *   1. Normalizes the URL and extracts owner + repo (accepts https://, www.,
 *      .git suffix, trailing slashes, bare "owner/repo", etc.).
 *   2. Resolves the repository's default branch via the GitHub API (never
 *      assumes "main").
 *   3. Tries a chain of README candidates on the default branch, then on
 *      common fallback branches.
 *   4. If no README exists, builds a synthetic "repository intelligence"
 *      document from metadata (description, language, topics, stars, forks,
 *      license), the root file/directory structure, and dependency manifests
 *      (package.json, requirements.txt, Cargo.toml, ...).
 *
 * It never throws for a missing README — the presentation can still be built
 * from repository intelligence. It only throws for an invalid URL format.
 *
 * Returns:
 *   content — Markdown ready for deck generation
 *   source  — human-readable provenance, e.g. "GitHub: owner/repo (README.md)"
 *   notice  — a friendly message when no README was found ("" when one was)
 */

const README_CANDIDATES = [
  "README.md",
  "README.MD",
  "readme.md",
  "Readme.md",
  "README.txt",
  "README",
  "readme.txt",
  "docs/README.md",
  "docs/readme.md",
];

const FALLBACK_BRANCHES = ["master", "dev", "develop", "main"];

const IMPORTANT_FILES = [
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "Cargo.toml",
  "pom.xml",
  "pubspec.yaml",
  "Dockerfile",
  "docker-compose.yml",
  "go.mod",
  "Gemfile",
  "composer.json",
  "build.gradle",
  "CMakeLists.txt",
  "Makefile",
  "LICENSE",
];

/** Dependency manifests worth reading for the tech-stack intelligence. */
const MANIFEST_FILES = [
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "Cargo.toml",
  "go.mod",
  "Gemfile",
  "composer.json",
  "pubspec.yaml",
];

function normalizeRepoUrl(url: string): { owner: string; repo: string } {
  const cleaned = url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\.git$/i, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "");

  const match = cleaned.match(/^(?:github\.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (!match) {
    throw new Error(
      "That doesn't look like a GitHub repository URL. Use the format github.com/owner/repo.",
    );
  }
  return { owner: match[1], repo: match[2] };
}

async function ghJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "pitchforge-ai-repo-ingest",
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function ghRaw(owner: string, repo: string, branch: string, path: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
    );
    if (!res.ok) return null;
    const text = await res.text();
    if (text.trim().length < 20) return null;
    return text;
  } catch {
    return null;
  }
}

/** Pull dependency names out of a manifest's raw text, first ~40 lines. */
function extractDependencyLines(text: string, kind: string): string[] {
  const lines: string[] = [];
  try {
    if (kind === "package.json") {
      const pkg = JSON.parse(text) as Record<string, unknown>;
      const deps = {
        ...((pkg.dependencies as Record<string, string>) ?? {}),
        ...((pkg.devDependencies as Record<string, string>) ?? {}),
      };
      for (const name of Object.keys(deps)) lines.push(name);
    } else if (kind === "pyproject.toml") {
      for (const line of text.split("\n")) {
        const m = line.match(/^\s*["']?([A-Za-z0-9_.-]+)["']?\s*=/);
        if (m && !/^(name|version|requires-python|description|readme|license|authors?|dependencies|dev-dependencies|build-system|classifiers)$/.test(m[1])) {
          lines.push(m[1]);
        }
      }
    } else {
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        // strip version constraints
        const name = trimmed
          .split(/[<>=!~;]/)[0]
          .trim()
          .replace(/^require\s*/, "")
          .replace(/^gem\s+["']?/, "")
          .replace(/["']/g, "");
        if (name && name.length > 1 && name.length < 80) lines.push(name);
      }
    }
  } catch {
    // Non-JSON manifests are handled line-by-line above; ignore parse issues.
  }
  return lines;
}

export const fetchGithubRepo = action({
  args: { url: v.string() },
  handler: async (_ctx, { url }) => {
    const { owner, repo } = normalizeRepoUrl(url);

    // 1. Repository metadata + default branch (never assume "main").
    const meta = (await ghJson(`https://api.github.com/repos/${owner}/${repo}`)) as
      | Record<string, unknown>
      | null;
    const branch = typeof meta?.default_branch === "string" ? meta.default_branch : "main";
    const description = typeof meta?.description === "string" ? meta.description : "";
    const language = typeof meta?.language === "string" ? meta.language : "";
    const stars =
      typeof meta?.stargazers_count === "number" ? meta.stargazers_count : null;
    const forks = typeof meta?.forks_count === "number" ? meta.forks_count : null;
    const topics = Array.isArray(meta?.topics) ? (meta.topics as string[]).slice(0, 10) : [];
    const license =
      meta?.license && typeof meta.license === "object"
        ? ((meta.license as { name?: string }).name ?? "")
        : "";

    // 2. README fallback chain (default branch first, then fallback branches).
    const branches = [branch, ...FALLBACK_BRANCHES.filter((b) => b !== branch)];
    for (const b of branches) {
      for (const candidate of README_CANDIDATES) {
        const readme = await ghRaw(owner, repo, b, candidate);
        if (readme) {
          return {
            content: readme,
            source: `GitHub: ${owner}/${repo} (${candidate} on ${b})`,
            notice: "",
          };
        }
      }
    }

    // 3. No README — scan the repository and build a synthetic intelligence doc.
    const root = (await ghJson(
      `https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`,
    )) as Array<{ name: string; type: string }> | null;

    let structureLines: string[] = [];
    let configFiles: string[] = [];
    const dependencyLines: string[] = [];

    if (Array.isArray(root)) {
      const files = root.filter((i) => i.type === "file").map((i) => i.name);
      const dirs = root.filter((i) => i.type === "dir").map((i) => i.name);

      structureLines = [...dirs.map((d) => `${d}/`), ...files];
      configFiles = files.filter((f) => IMPORTANT_FILES.includes(f));

      for (const manifest of MANIFEST_FILES) {
        if (!files.includes(manifest)) continue;
        const text = await ghRaw(owner, repo, branch, manifest);
        if (text) {
          const names = extractDependencyLines(text, manifest).slice(0, 40);
          dependencyLines.push(...names.filter((n) => !dependencyLines.includes(n)));
        }
      }
    }

    const parts: string[] = [
      `# ${repo}`,
      description ? `> ${description}` : "",
      `**Repository:** ${owner}/${repo} · **Default branch:** ${branch}`,
      [language && `**Primary language:** ${language}`]
        .concat(stars !== null ? `**Stars:** ${stars} · **Forks:** ${forks ?? 0}` : [])
        .concat(topics.length ? `**Topics:** ${topics.join(", ")}` : [])
        .concat(license ? `**License:** ${license}` : [])
        .filter(Boolean)
        .join("\n"),
      structureLines.length
        ? `## Project structure\n\n${structureLines.slice(0, 40).map((f) => `- ${f}`).join("\n")}${structureLines.length > 40 ? `\n- … and ${structureLines.length - 40} more items` : ""}`
        : "",
      dependencyLines.length
        ? `## Dependencies & tooling\n\n${dependencyLines.slice(0, 30).map((d) => `- ${d}`).join("\n")}`
        : "",
      configFiles.length
        ? `## Configuration files\n\n${configFiles.map((f) => `- ${f}`).join("\n")}`
        : "",
      `## Overview\n\nNo README was found in this repository, so this deck was generated from repository intelligence — structure, dependencies, and metadata. Review the bullets and add product specifics before presenting.`,
    ];

    return {
      content: parts.filter(Boolean).join("\n\n"),
      source: `GitHub: ${owner}/${repo} (repository intelligence scan)`,
      notice:
        `We couldn't find a standard README, but we analyzed ${owner}/${repo}'s structure, dependencies, and metadata to build your presentation.`,
    };
  },
});
