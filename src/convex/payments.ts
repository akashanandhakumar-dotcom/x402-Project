import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";

/**
 * Algorand x402 payments for premium deck generation.
 *
 * The flow is fully on-chain when configured:
 *
 *   1. Client connects a real Algorand wallet (Pera or Lute) and gets the
 *      sender address.
 *   2. `requestX402Authorization` stores an "authorized" payment record and
 *      returns the exact amount + receiver for the client to pay.
 *   3. The client builds & signs a payment transaction with algosdk, submits
 *      it to the network, and calls `verifyX402Payment` with the txid.
 *   4. `verifyX402Payment` can verify a direct Algorand payment when needed
 *      and only marks the payment "verified" if it is confirmed on-chain,
 *      the sender matches, the receiver is ours, and the amount matches.
 *
 * The deck unlocks only after a payment with status "verified" exists.
 *
 * Configuration (Convex env / Keys tab):
 *   - ALGORAND_NETWORK: "testnet" (default) | "mainnet"
 *   - ALGORAND_RECEIVER_ADDRESS: Algorand address that receives payments.
 *     Defaults to a shared demo address on the configured network.
 *   - ALGORAND_ALGOD_URL / ALGORAND_INDEXER_URL: optional overrides
 *     (defaults to public AlgoNode endpoints for the configured network).
 */

/** Price for a premium deck, in ALGO. */
export const PREMIUM_DECK_ALGO = 2.5;

/** Price for the Founder plan, in ALGO. */
export const FOUNDER_ALGO = 19;

/** Default receiver for demo flows (public testnet address). */
const DEFAULT_TESTNET_RECEIVER =
  "GD64YIY3TWGDMCNPP553DZPPR6LDUSFQOIJVFDPPXWEG3FVOJCCDBBHU5A";
const DEFAULT_MAINNET_RECEIVER =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";

interface X402Network {
  network: "testnet" | "mainnet";
  genesisID: string;
  algodUrl: string;
  indexerUrl: string;
}

function getNetwork(): X402Network {
  const network = (process.env.ALGORAND_NETWORK ?? "testnet").toLowerCase() === "mainnet" ? "mainnet" : "testnet";
  return network === "mainnet"
    ? {
        network,
        genesisID: "mainnet-v1.0",
        algodUrl: process.env.ALGORAND_ALGOD_URL ?? "https://mainnet-api.algonode.cloud",
        indexerUrl: process.env.ALGORAND_INDEXER_URL ?? "https://mainnet-idx.algonode.cloud",
      }
    : {
        network,
        genesisID: "testnet-v1.0",
        algodUrl: process.env.ALGORAND_ALGOD_URL ?? "https://testnet-api.algonode.cloud",
        indexerUrl: process.env.ALGORAND_INDEXER_URL ?? "https://testnet-idx.algonode.cloud",
      };
}

/** The address that receives ALGO for premium decks. */
function getReceiverAddress(): string {
  const configured = process.env.ALGORAND_RECEIVER_ADDRESS?.trim();
  if (configured) return configured;
  return getNetwork().network === "mainnet" ? DEFAULT_MAINNET_RECEIVER : DEFAULT_TESTNET_RECEIVER;
}

/** Public payment config the client needs to build + sign the transaction. */
export const getX402Config = query({
  args: {},
  handler: async () => {
    const net = getNetwork();
    return {
      network: net.network,
      genesisID: net.genesisID,
      algodUrl: net.algodUrl,
      indexerUrl: net.indexerUrl,
      receiverAddress: getReceiverAddress(),
      amountAlgo: PREMIUM_DECK_ALGO,
      amountMicro: Math.round(PREMIUM_DECK_ALGO * 1_000_000),
      assetId: 0,
      explorerBase: `https://${net.network === "testnet" ? "testnet." : ""}explorer.perawallet.app`,
    };
  },
});

export const requestX402Authorization = mutation({
  args: {
    walletAddress: v.string(),
    deckId: v.optional(v.id("decks")),
    memo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    const address = args.walletAddress.trim();
    if (!/^[A-Z2-7]{40,58}$/.test(address)) {
      throw new Error("Invalid Algorand address — expected 58-char base32 format.");
    }

    const net = getNetwork();
    const paymentId = await ctx.db.insert("payments", {
      userId: user._id,
      deckId: args.deckId,
      walletAddress: address,
      txHash: "",
      amount: Math.round(PREMIUM_DECK_ALGO * 1_000_000), // microAlgos
      assetId: 0, // native ALGO
      status: "authorized",
      network: net.network,
      memo: args.memo ?? "PitchForge AI — premium deck generation",
    });

    return {
      paymentId,
      amountAlgo: PREMIUM_DECK_ALGO,
      amountMicro: Math.round(PREMIUM_DECK_ALGO * 1_000_000),
      assetId: 0,
      receiverAddress: getReceiverAddress(),
      network: net.network,
    };
  },
});

/**
 * Request authorization for a Founder plan upgrade (19 ALGO via x402).
 *
 * Creates a payment record that the client signs and submits, then verifies
 * via `verifyX402Payment`. On successful verification the user is granted Pro.
 */
export const requestFounderPayment = mutation({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    if (user.plan === "pro") {
      throw new Error("You are already on the Founder plan.");
    }

    const address = args.walletAddress.trim();
    if (!/^[A-Z2-7]{40,58}$/.test(address)) {
      throw new Error("Invalid Algorand address — expected 58-char base32 format.");
    }

    const net = getNetwork();
    const amountMicro = Math.round(FOUNDER_ALGO * 1_000_000);
    const paymentId = await ctx.db.insert("payments", {
      userId: user._id,
      walletAddress: address,
      txHash: "",
      amount: amountMicro,
      assetId: 0, // native ALGO
      status: "authorized",
      network: net.network,
      memo: "GlassPitch AI — Founder upgrade via x402",
    });

    return {
      paymentId,
      amountAlgo: FOUNDER_ALGO,
      amountMicro,
      assetId: 0,
      receiverAddress: getReceiverAddress(),
      network: net.network,
    };
  },
});

/**
 * Verify a submitted x402 payment against the Algorand network.
 *
 * Looks the transaction up on the AlgoNode indexer and requires:
 *   - the transaction is confirmed on-chain (confirmed-round present)
 *   - the sender matches the wallet that authorized this payment
 *   - the receiver is our configured merchant address
 *   - the amount is at least the required premium (in microAlgos)
 */
export const verifyX402Payment = mutation({
  args: { paymentId: v.id("payments"), txHash: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    const payment = await ctx.db.get(args.paymentId);
    if (!payment || payment.userId !== user._id) throw new Error("Payment not found");
    if (payment.status === "verified") return { paymentId: payment._id, status: "verified" };

    const hash = args.txHash.trim();
    if (!/^[A-Z2-7]{52,58}$/.test(hash) && !/^[a-f0-9]{64}$/i.test(hash)) {
      throw new Error("Invalid transaction hash.");
    }

    const net = getNetwork();
    const receiver = getReceiverAddress();

    interface IndexerTransaction {
      "confirmed-round"?: number;
      sender?: string;
      "payment-transaction"?: { receiver?: string; amount?: number };
    }
    let tx: IndexerTransaction | undefined;
    try {
      const res = await fetch(`${net.indexerUrl}/v2/transactions/${hash}`, {
        headers: { Accept: "application/json" },
      });
      if (res.status === 404) {
        await ctx.db.patch(payment._id, { status: "failed" });
        throw new Error("Transaction not found on-chain — double-check the hash.");
      }
      if (!res.ok) throw new Error(`Indexer error (${res.status}) — try again in a moment.`);
      const body = (await res.json()) as { transaction?: IndexerTransaction };
      tx = body?.transaction;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Transaction not found")) throw error;
      throw new Error("Could not reach the Algorand indexer — check your connection.");
    }

    if (!tx) throw new Error("Transaction not found on-chain — double-check the hash.");
    const confirmedRound = tx["confirmed-round"];
    if (!confirmedRound || confirmedRound <= 0) {
      throw new Error("Transaction is not confirmed on-chain yet — wait a few seconds and retry.");
    }

    if (tx.sender !== payment.walletAddress) {
      throw new Error("Sender mismatch — the transaction was not sent by the connected wallet.");
    }

    const pay = tx["payment-transaction"];
    if (!pay) {
      throw new Error("This is not a payment transaction.");
    }
    if (pay.receiver !== receiver) {
      throw new Error("Receiver mismatch — the payment did not go to PitchForge's wallet.");
    }
    const paid = Number(pay.amount ?? 0);
    if (paid < payment.amount) {
      throw new Error(`Insufficient payment — expected ${payment.amount} microAlgos, received ${paid}.`);
    }

    await ctx.db.patch(payment._id, {
      status: "verified",
      txHash: hash,
      network: net.network,
      confirmedRound: confirmedRound as number,
    });

    // Grant Pro plan for Founder upgrade payments
    if (payment.memo && payment.memo.includes("Founder upgrade")) {
      await ctx.runMutation(api.billing.markPro);
    }

    return { paymentId: payment._id, status: "verified", confirmedRound: confirmedRound as number };
  },
});

/**
 * Record a payment that was verified by the live x402 server.
 *
 * In the live flow the external x402 server (localhost:4021) performs the
 * on-chain verification and returns a receipt; this mutation persists the
 * verified payment so `isDeckUnlocked` reports the deck as premium.
 */
export const recordX402Unlock = mutation({
  args: {
    deckId: v.optional(v.id("decks")),
    walletAddress: v.string(),
    txHash: v.string(),
    amountUsd: v.number(),
    assetId: v.number(),
    network: v.string(),
    confirmedRound: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in");

    const hash = args.txHash.trim();
    if (!hash) throw new Error("Missing transaction hash.");
    if (!/^[A-Z2-7]{52,58}$/.test(hash) && !/^[a-f0-9]{64}$/i.test(hash)) {
      throw new Error("Invalid transaction hash.");
    }

    // Deck ownership check (when a deck is attached)
    if (args.deckId) {
      const deck = await ctx.db.get(args.deckId);
      if (!deck) throw new Error("Deck not found");
      if (deck.ownerId !== user._id) throw new Error("You don't own this deck");
    }

    // Avoid duplicate unlocks for the same deck
    if (args.deckId) {
      const existing = await ctx.db
        .query("payments")
        .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
        .filter((q) => q.eq(q.field("status"), "verified"))
        .first();
      if (existing) return { status: "already-unlocked", paymentId: existing._id };
    }

    const paymentId = await ctx.db.insert("payments", {
      userId: user._id,
      deckId: args.deckId,
      walletAddress: args.walletAddress.trim(),
      txHash: hash,
      amount: Math.round(args.amountUsd * 1_000_000), // micro-units of USDC
      assetId: args.assetId,
      status: "verified",
      network: args.network,
      confirmedRound: args.confirmedRound,
      memo: "GlassPitch AI — premium deck via x402 server",
    });

    return { status: "verified", paymentId };
  },
});

export const listPayments = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

/** Is a deck unlocked for premium download? (owner + verified payment) */
export const isDeckUnlocked = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { unlocked: false, verified: [] };
    const verified = await ctx.db
      .query("payments")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .filter((q) => q.eq(q.field("status"), "verified"))
      .collect();
    return {
      unlocked: verified.length > 0,
      verified: verified.map((p) => ({
        walletAddress: p.walletAddress,
        txHash: p.txHash,
        amount: p.amount,
        status: p.status,
        network: p.network,
        confirmedRound: p.confirmedRound,
        creationTime: p._creationTime,
      })),
    };
  },
});
