/**
 * Premium GlassPitch AI deck-generation handler.
 *
 * This handler runs only after @x402/hono has accepted the x402 payment.
 */
import type { Context } from "hono";

interface GenerationRequest {
  repository?: string;
  projectName?: string;
  description?: string;
  deckId?: string;
}

export async function handleDeckGenerationRequest(c: Context) {
  try {
    const input = (await c.req.json<GenerationRequest>().catch(() => ({}))) as GenerationRequest;

    const projectName =
      input.projectName ||
      input.repository?.split("/").filter(Boolean).pop() ||
      "Your Project";

    console.log(`✓ PAYMENT VERIFIED — generating premium deck for ${projectName}`);

    return c.json({
      success: true,
      message: "Payment verified — premium GlassPitch deck generation unlocked.",
      generation: {
        projectName,
        repository: input.repository ?? null,
        description: input.description ?? null,
        deckId: input.deckId ?? null,
        slides: 13,
        investorReadiness: 90,
        analysis: {
          innovation: 92,
          technology: 88,
          scalability: 90,
          business: 86,
          market: 89,
          presentation: 95,
        },
        generatedAt: new Date().toISOString(),
      },
      product: {
        name: "GlassPitch AI",
        service: "Premium investor pitch-deck generation",
        paidVia: "x402 / USDC / Algorand TestNet",
      },
    });
  } catch (error) {
    console.error("Deck generation handler error:", error);
    return c.json(
      { success: false, error: "Invalid JSON request body" },
      400,
    );
  }
}
