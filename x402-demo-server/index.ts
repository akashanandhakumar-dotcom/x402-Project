/**
 * GlassPitch AI x402 Resource Server
 *
 * This server follows the x402 Hackathon Starter Kit architecture:
 * - @x402/hono payment middleware
 * - @x402/core resource server + facilitator client
 * - @x402/avm exact Algorand/USDC scheme
 * - @x402-avm/extensions Bazaar discovery
 *
 * Premium endpoint:
 *   POST /generate-deck
 */
import { config } from "dotenv";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { paymentMiddleware } from "@x402/hono";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import type { ResourceServerExtension } from "@x402/core/types";
import { ExactAvmScheme } from "@x402/avm/exact/server";
import { ALGORAND_TESTNET_CAIP2 } from "@x402/avm";
import { bazaarResourceServerExtension } from "@x402-avm/extensions";

import createPaymentConfig from "./endpoints.config.js";
import { handleWeatherRequest } from "./handlers/weather.js";
import { handleDeckGenerationRequest } from "./handlers/deck-generation.js";

config();

const avmAddress = process.env.AVM_ADDRESS?.trim();
const facilitatorUrl =
  process.env.FACILITATOR_URL?.trim() || "https://facilitator.goplausible.xyz";
const port = Number.parseInt(process.env.PORT || "4021", 10);

if (!avmAddress) {
  console.error("❌ Missing AVM_ADDRESS. Set your Algorand TestNet receiver address.");
  process.exit(1);
}

console.log("═".repeat(64));
console.log("GLASSPITCH AI — x402 RESOURCE SERVER");
console.log("═".repeat(64));
console.log(`Receiver:    ${avmAddress}`);
console.log(`Network:     ${ALGORAND_TESTNET_CAIP2}`);
console.log(`Facilitator: ${facilitatorUrl}`);
console.log(`Port:        ${port}`);
console.log("═".repeat(64));

const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });

const x402Server = new x402ResourceServer(facilitatorClient)
  .register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme())
  .registerExtension(
    bazaarResourceServerExtension as unknown as ResourceServerExtension,
  );

const app = new Hono();

/**
 * x402 v2 requires the payment headers to be readable by browser clients.
 */
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE, HEAD",
  );
  c.header("Access-Control-Allow-Headers", "*");
  c.header("Access-Control-Expose-Headers", "*");
  c.header("Access-Control-Max-Age", "86400");

  if (c.req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  await next();
});

app.use("*", async (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`);
  if (c.req.header("payment-signature")) {
    console.log("  ✓ PAYMENT-SIGNATURE header detected");
  }
  await next();
  console.log(`  Response: ${c.res.status}`);
});

const paymentConfig = createPaymentConfig(avmAddress);
console.log("📋 Payment-protected endpoints:");
for (const [route, routeConfig] of Object.entries(paymentConfig)) {
  const accepts = Array.isArray(routeConfig.accepts)
    ? routeConfig.accepts
    : [routeConfig.accepts];
  console.log(`  ${route} — ${accepts[0]?.price ?? "unknown"} USDC`);
}

app.use(paymentMiddleware(paymentConfig as any, x402Server));

/**
 * Payment is already verified by x402 middleware when these handlers run.
 */
app.get("/weather", handleWeatherRequest);
app.post("/generate-deck", handleDeckGenerationRequest);

/**
 * Public health/info endpoints.
 */
app.get("/", (c) =>
  c.json({
    status: "ok",
    service: "glasspitch-ai-x402",
    protocol: "x402-v2",
    network: "Algorand TestNet",
    receiver: avmAddress,
    endpoints: Object.keys(paymentConfig),
  }),
);

app.get("/health", (c) =>
  c.json({
    status: "ok",
    service: "glasspitch-ai-x402",
    uptime: process.uptime(),
  }),
);

app.get("/info", (c) =>
  c.json({
    service: "glasspitch-ai-x402",
    protocol: "x402-v2",
    network: "Algorand TestNet",
    receiver: avmAddress,
    facilitator: facilitatorUrl,
    endpoints: Object.keys(paymentConfig),
  }),
);

app.notFound((c) =>
  c.json(
    {
      error: "Endpoint not found",
      path: c.req.path,
      hint: "Try GET /health or GET /info",
    },
    404,
  ),
);

app.onError((error, c) => {
  console.error("Server error:", error);
  return c.json({ error: "Internal server error", message: error.message }, 500);
});

serve(
  { fetch: app.fetch, port },
  () => console.log(`\n✅ GlassPitch x402 server listening on :${port}\n`),
);

export default app;
