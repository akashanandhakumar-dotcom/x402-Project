import { v } from "convex/values";
import Stripe from "stripe";
import { getCurrentUser } from "./users";
import { action, mutation, query } from "./_generated/server";

/**
 * Create a hosted Stripe Checkout session for a one-time Pro upgrade.
 *
 * Returns { ok: false, error: "not_configured" } when STRIPE_SECRET_KEY is
 * missing so the UI can prompt the operator to add it (Freebuff Keys tab).
 */
export const createCheckoutSession = action({
  args: { plan: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not signed in");

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return { ok: false as const, error: "not_configured" as const };
    }

    const origin = process.env.SITE_URL || "http://localhost:5173";
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: identity.email ?? undefined,
      client_reference_id: identity.subject,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: "Pitch Forge Pro",
              description:
                "Unlimited pitch decks, catalog publishing, PDF export, priority support.",
            },
            unit_amount: 1900, // $19.00 one-time
          },
        },
      ],
      metadata: { userId: identity.subject, plan: args.plan },
      success_url: `${origin}/wallet?checkout=success`,
      cancel_url: `${origin}/wallet?checkout=cancelled`,
    });

    return { ok: true as const, url: session.url ?? "" };
  },
});

/**
 * Grant the Pro plan after a successful checkout redirect.
 *
 * NOTE: for production this should be verified server-side with a Stripe
 * webhook; for v1 the confirmation is client-side post-redirect.
 */
export const markPro = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");
    await ctx.db.patch(user._id, { plan: "pro" });
    return "pro";
  },
});

/** Billing state for the wallet page. */
export const getBilling = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const deckCount = await ctx.db
      .query("decks")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();
    return {
      plan: user.plan ?? "free",
      email: user.email ?? "",
      deckCount: deckCount.length,
      isAdmin: user.role === "admin",
    };
  },
});
