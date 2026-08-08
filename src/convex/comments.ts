import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { mutation, query } from "./_generated/server";

/** Comments on a deck, oldest first. Public. */
export const listComments = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("comments")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .order("asc")
      .collect();
  },
});

/** Post a comment on any deck. Signed-in users only. */
export const addComment = mutation({
  args: { deckId: v.id("decks"), body: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");
    const body = args.body.trim();
    if (body.length < 2) throw new Error("Comment too short");
    if (body.length > 500) throw new Error("Comment too long");

    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");

    const authorName = user.name || user.email?.split("@")[0] || "Guest";
    return ctx.db.insert("comments", {
      deckId: args.deckId,
      authorId: user._id,
      authorName,
      body,
    });
  },
});

/** Delete a comment — its author or any admin. */
export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Not found");
    const isAdmin = user.role === "admin";
    if (comment.authorId !== user._id && !isAdmin) throw new Error("Not allowed");
    await ctx.db.delete(args.commentId);
  },
});
