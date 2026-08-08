import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { mutation, query } from "./_generated/server";

/**
 * NFT minting records for pitch decks.
 *
 * When a user mints a deck as an ARC-3 NFT on Algorand, the client signs the
 * asset creation transaction in their wallet and then calls `recordMint` to
 * persist the on-chain record (asset ID, tx hash, metadata) on Convex.
 *
 * The client can also check `hasNft` before showing the mint button.
 */

export const recordMint = mutation({
  args: {
    deckId: v.id("decks"),
    assetId: v.number(),
    txHash: v.string(),
    metadataHash: v.string(),
    network: v.string(),
    creatorAddress: v.string(),
    assetName: v.string(),
    unitName: v.string(),
    metadataUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    // Prevent duplicate mints for the same deck
    const existing = await ctx.db
      .query("nfts")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .first();
    if (existing) {
      throw new Error("This deck has already been minted as an NFT.");
    }

    const nftId = await ctx.db.insert("nfts", {
      deckId: args.deckId,
      userId: user._id,
      assetId: args.assetId,
      txHash: args.txHash,
      metadataHash: args.metadataHash,
      network: args.network,
      creatorAddress: args.creatorAddress,
      assetName: args.assetName,
      unitName: args.unitName,
      metadataUrl: args.metadataUrl,
      status: "confirmed",
    });

    return { nftId, assetId: args.assetId, status: "confirmed" as const };
  },
});

/** Check if a deck has already been minted as an NFT. */
export const getNftForDeck = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("nfts")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .first();
  },
});

/** List all NFTs minted by the current user. */
export const listMyNfts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return ctx.db
      .query("nfts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});
