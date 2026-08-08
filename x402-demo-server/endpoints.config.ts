/**
 * GlassPitch AI x402 endpoint configuration.
 *
 * This follows the x402 Hackathon Starter Kit pattern:
 * endpoint -> payment requirement -> handler -> paid response.
 */
import { ALGORAND_TESTNET_CAIP2, USDC_TESTNET_ASA_ID } from "@x402/avm";
import { declareDiscoveryExtension } from "@x402-avm/extensions";

export interface EndpointConfig {
  [key: string]: {
    accepts: Array<{
      scheme: "exact";
      price: string;
      network: string;
      payTo: string;
      extra: { asset: number };
    }>;
    description: string;
    mimeType?: string;
    extensions?: Record<string, unknown>;
  };
}

export default function createPaymentConfig(avmAddress: string): EndpointConfig {
  const deckPrice = Number(process.env.DECK_PRICE_USD || "1.00");
  const price = Number.isFinite(deckPrice) && deckPrice > 0
    ? deckPrice.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")
    : "1";

  return {
    "POST /generate-deck": {
      accepts: [
        {
          scheme: "exact",
          price: `$${price}`,
          network: ALGORAND_TESTNET_CAIP2,
          payTo: avmAddress,
          extra: { asset: Number(USDC_TESTNET_ASA_ID) },
        },
      ],
      description:
        "AI-powered investor pitch deck generation — pay per premium deck with USDC on Algorand TestNet.",
      mimeType: "application/json",
      extensions: declareDiscoveryExtension({
        bodyType: "json",
        input: {
          repository: "your-org/your-repository",
          projectName: "My Startup",
          description: "One-line startup description",
        },
        inputSchema: {
          type: "object",
          properties: {
            repository: { type: "string" },
            projectName: { type: "string" },
            description: { type: "string" },
            deckId: { type: "string" },
          },
          required: ["projectName"],
        },
        output: {
          example: {
            success: true,
            generation: {
              projectName: "My Startup",
              slides: 13,
              investorReadiness: 90,
            },
            paidVia: "x402 / USDC / Algorand TestNet",
          },
        },
      }),
    },

    // Keep one template endpoint enabled so the fork visibly retains the
    // original starter-kit pattern.
    "GET /weather": {
      accepts: [
        {
          scheme: "exact",
          price: "$0.005",
          network: ALGORAND_TESTNET_CAIP2,
          payTo: avmAddress,
          extra: { asset: Number(USDC_TESTNET_ASA_ID) },
        },
      ],
      description: "Template premium weather endpoint — $0.005 USDC.",
    },
  };
}
