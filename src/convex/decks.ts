import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { mutation, query } from "./_generated/server";

const sectionValidator = v.object({
  key: v.string(),
  title: v.string(),
  eyebrow: v.string(),
  bullets: v.array(v.string()),
  accent: v.string(),
  derived: v.boolean(),
});

const statsValidator = v.object({
  words: v.number(),
  lines: v.number(),
  sectionsFound: v.number(),
});

const insightsValidator = v.object({
  executiveSummary: v.string(),
  elevatorPitch: v.string(),
  tam: v.string(),
  sam: v.string(),
  som: v.string(),
  marketNote: v.string(),
  businessModel: v.string(),
  pricingStrategy: v.string(),
  gtm: v.array(v.string()),
  roadmap: v.array(
    v.object({ phase: v.string(), timeline: v.string(), items: v.array(v.string()) }),
  ),
  risks: v.array(v.string()),
  fundingAsk: v.string(),
  useOfFunds: v.array(v.string()),
  competitors: v.array(
    v.object({
      name: v.string(),
      category: v.string(),
      strengths: v.array(v.string()),
      weaknesses: v.array(v.string()),
      advantage: v.string(),
    }),
  ),
  missing: v.array(v.string()),
});

const readinessValidator = v.object({
  overall: v.number(),
  metrics: v.array(
    v.object({ key: v.string(), label: v.string(), score: v.number(), note: v.string() }),
  ),
});

/** Generate a short, URL-safe share code. */
function makeShareCode(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  const bytes = new Uint8Array(10);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < bytes.length; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return code;
}

/**
 * Persist a generated deck: creates (or reuses) a project row from the source
 * README, then stores the deck with a fresh share code. Returns ids.
 */
export const createDeck = mutation({
  args: {
    projectName: v.string(),
    sourceMarkdown: v.string(),
    title: v.string(),
    tagline: v.string(),
    sections: v.array(sectionValidator),
    stats: statsValidator,
    insights: insightsValidator,
    readiness: readinessValidator,
    template: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    // Free plan allows 2 decks; Pro is unlimited.
    const plan = user.plan ?? "free";
    if (plan !== "pro") {
      const owned = await ctx.db
        .query("decks")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .collect();
      if (owned.length >= 2) {
        throw new Error(
          "Free plan limit reached — upgrade to Founder for unlimited decks (Wallet → upgrade).",
        );
      }
    }

    // Reuse an existing project with the same owner + name when present.
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .filter((q) => q.eq(q.field("name"), args.projectName))
      .first();

    let projectId = existing?._id;
    if (!projectId) {
      projectId = await ctx.db.insert("projects", {
        ownerId: user._id,
        name: args.projectName,
        sourceMarkdown: args.sourceMarkdown,
      });
    } else {
      await ctx.db.patch(projectId, { sourceMarkdown: args.sourceMarkdown });
    }

    const deckId = await ctx.db.insert("decks", {
      ownerId: user._id,
      projectId,
      projectName: args.projectName,
      title: args.title,
      tagline: args.tagline,
      shareCode: makeShareCode(),
      sections: args.sections,
      stats: args.stats,
      insights: args.insights,
      readiness: args.readiness,
      template: args.template ?? "glass",
    });

    return { projectId, deckId };
  },
});

/** Delete a deck; also removes its project row when no other decks remain. */
export const deleteDeck = mutation({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.ownerId !== user._id) throw new Error("Not found");

    await ctx.db.delete(args.deckId);

    if (deck.projectId) {
      const siblings = await ctx.db
        .query("decks")
        .withIndex("by_project", (q) => q.eq("projectId", deck.projectId))
        .first();
      if (!siblings) {
        const project = await ctx.db.get(deck.projectId);
        if (project && project.ownerId === user._id) {
          await ctx.db.delete(deck.projectId);
        }
      }
    }
  },
});

/** Delete a project and every deck it contains. */
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== user._id) throw new Error("Not found");

    const decks = await ctx.db
      .query("decks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const deck of decks) await ctx.db.delete(deck._id);
    await ctx.db.delete(args.projectId);
  },
});

/** All projects for the signed-in user, newest first. */
export const listProjects = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();
  },
});

/** All decks for the signed-in user, newest first. */
export const listDecks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return ctx.db
      .query("decks")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();
  },
});

/** A single deck, only for its owner. */
export const getDeck = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.ownerId !== user._id) return null;
    return deck;
  },
});

/** Public lookup used by the share link — no auth required. */
export const getDeckByShareCode = query({
  args: { shareCode: v.string() },
  handler: async (ctx, args) => {
    const deck = await ctx.db
      .query("decks")
      .withIndex("by_share_code", (q) => q.eq("shareCode", args.shareCode))
      .first();
    if (!deck) return null;
    return deck;
  },
});

/** Update a deck's template (owner or admin only). */
export const setDeckTemplate = mutation({
  args: { deckId: v.id("decks"), template: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");
    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Not found");
    const isOwner = deck.ownerId === user._id;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) throw new Error("Not allowed");
    await ctx.db.patch(args.deckId, { template: args.template });
    return args.template;
  },
});

/** Toggle a deck's visibility in the public catalog (owner or admin only). */
export const publishDeck = mutation({
  args: { deckId: v.id("decks"), published: v.boolean() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");
    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Not found");
    const isOwner = deck.ownerId === user._id;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) throw new Error("Not allowed");
    await ctx.db.patch(args.deckId, { published: args.published });
    return args.published;
  },
});

/** Public catalog — published decks, newest first, optional text search. */
export const listPublishedDecks = query({
  args: { query: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const q = (args.query ?? "").trim().toLowerCase();
    const decks = await ctx.db
      .query("decks")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .collect();
    if (!q) return decks;
    return decks.filter((d) => {
      const haystack = `${d.title} ${d.tagline} ${d.projectName}`.toLowerCase();
      return q.split(/\s+/).every((term) => haystack.includes(term));
    });
  },
});
