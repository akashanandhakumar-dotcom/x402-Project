import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      plan: v.optional(v.string()), // billing plan: "free" | "pro"

      // profile settings (editable in the Settings page)
      bio: v.optional(v.string()),
      walletAddress: v.optional(v.string()), // primary Algorand wallet
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // pitch deck projects — one per source README
    projects: defineTable({
      ownerId: v.id("users"),
      name: v.string(), // project / repo name
      sourceMarkdown: v.string(), // the raw README text
    })
      .index("by_owner", ["ownerId"]),

    // generated pitch decks
    decks: defineTable({
      ownerId: v.id("users"),
      projectId: v.optional(v.id("projects")),
      projectName: v.string(),
      title: v.string(),
      tagline: v.string(),
      shareCode: v.string(), // public share link token
      sections: v.array(
        v.object({
          key: v.string(),
          title: v.string(),
          eyebrow: v.string(),
          bullets: v.array(v.string()),
          accent: v.string(),
          derived: v.boolean(),
        }),
      ),
      stats: v.object({
        words: v.number(),
        lines: v.number(),
        sectionsFound: v.number(),
      }),
      // AI insights persisted with the deck so preview/share can rehydrate
      insights: v.object({
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
      }),
      readiness: v.object({
        overall: v.number(),
        metrics: v.array(
          v.object({
            key: v.string(),
            label: v.string(),
            score: v.number(),
            note: v.string(),
          }),
        ),
      }),
      template: v.optional(v.string()), // deck template id
      published: v.optional(v.boolean()), // visible in the public catalog
    })
      .index("by_owner", ["ownerId"])
      .index("by_project", ["projectId"])
      .index("by_share_code", ["shareCode"])
      .index("by_published", ["published"]),

    // Algorand x402 payments for premium deck generation
    payments: defineTable({
      userId: v.id("users"),
      deckId: v.optional(v.id("decks")),
      walletAddress: v.string(),
      txHash: v.string(),
      amount: v.number(), // in microAlgos
      assetId: v.number(), // 0 = ALGO native
      status: v.string(), // "authorized" | "verified" | "failed"
      network: v.optional(v.string()), // "testnet" | "mainnet"
      confirmedRound: v.optional(v.number()), // on-chain round when verified
      memo: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_deck", ["deckId"]),

    // NFTs minted from pitch decks
    nfts: defineTable({
      deckId: v.id("decks"),
      userId: v.id("users"),
      assetId: v.number(), // Algorand ASA ID
      txHash: v.string(), // asset creation tx hash
      metadataHash: v.string(), // base64 SHA-256 of ARC-3 metadata JSON
      network: v.string(), // "testnet" | "mainnet"
      creatorAddress: v.string(), // wallet that signed the mint
      assetName: v.string(), // e.g. "Volta — Liquid Restaking #1"
      unitName: v.string(), // e.g. "PITCH"
      metadataUrl: v.string(), // data URI or hosted URL of the metadata JSON
      status: v.string(), // "pending" | "confirmed" | "failed"
    })
      .index("by_deck", ["deckId"])
      .index("by_user", ["userId"]),

    // public comments on decks
    comments: defineTable({
      deckId: v.id("decks"),
      authorId: v.id("users"),
      authorName: v.string(),
      body: v.string(),
    })
      .index("by_deck", ["deckId"])
      .index("by_author", ["authorId"]),

  },
  {
    schemaValidation: false,
  },
);

export default schema;
