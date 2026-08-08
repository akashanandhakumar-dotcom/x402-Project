import { v } from "convex/values";
import { ROLES } from "./schema";
import { getCurrentUser } from "./users";
import { mutation, query } from "./_generated/server";

async function requireAdmin(ctx: Parameters<typeof getCurrentUser>[0]) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not signed in");
  if (user.role !== ROLES.ADMIN) throw new Error("Admins only");
  return user;
}

/** All users, newest first. Admin only. */
export const adminListUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("users").order("desc").collect();
  },
});

/** All decks, newest first. Admin only. */
export const adminListDecks = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("decks").order("desc").collect();
  },
});

/** All comments, newest first. Admin only. */
export const adminListComments = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("comments").order("desc").collect();
  },
});

/** Change a user's role or plan. Admin only. */
export const adminSetUser = mutation({
  args: {
    userId: v.id("users"),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"), v.literal("member"))),
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found");
    await ctx.db.patch(args.userId, {
      ...(args.role ? { role: args.role } : {}),
      ...(args.plan ? { plan: args.plan } : {}),
    });
  },
});

/** Delete any deck. Admin only. */
export const adminDeleteDeck = mutation({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    await ctx.db.delete(args.deckId);
    if (deck.projectId) {
      const siblings = await ctx.db
        .query("decks")
        .withIndex("by_project", (q) => q.eq("projectId", deck.projectId))
        .first();
      if (!siblings) await ctx.db.delete(deck.projectId);
    }
  },
});

/** Delete any comment. Admin only. */
export const adminDeleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.commentId);
  },
});
