import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { mutation, query } from "./_generated/server";

/**
 * Settings module — profile + wallet preferences for the signed-in user.
 * Kept separate from users.ts (which is read-only template code).
 */

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    const patch: { name?: string; image?: string; bio?: string } = {};
    if (args.name !== undefined) {
      const name = args.name.trim().slice(0, 60);
      if (name.length < 2) throw new Error("Name must be at least 2 characters.");
      patch.name = name;
    }
    if (args.image !== undefined) {
      const image = args.image.trim().slice(0, 500);
      patch.image = image || undefined;
    }
    if (args.bio !== undefined) {
      patch.bio = args.bio.trim().slice(0, 240) || undefined;
    }

    await ctx.db.patch(user._id, patch);
    return { ok: true };
  },
});

/** Save the user's primary Algorand wallet address (used for minting/payments). */
export const saveWalletAddress = mutation({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    const address = args.walletAddress.trim();
    if (!/^[A-Z2-7]{40,58}$/.test(address)) {
      throw new Error("Invalid Algorand address — expected 58-char base32 format.");
    }
    await ctx.db.patch(user._id, { walletAddress: address });
    return { ok: true };
  },
});

/** Summary of everything the Settings page needs in one reactive query. */
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return {
      name: user.name ?? "",
      image: user.image ?? "",
      email: user.email ?? "",
      bio: user.bio ?? "",
      walletAddress: user.walletAddress ?? "",
      plan: user.plan ?? "free",
      role: user.role ?? "user",
      isAnonymous: user.isAnonymous ?? false,
    };
  },
});
