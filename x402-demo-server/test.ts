/**
 * Smoke tests for the GlassPitch x402 resource server.
 *
 * These tests deliberately avoid fabricating a successful payment. The
 * facilitator must be used for a real paid-flow test.
 */
process.env.AVM_ADDRESS =
  process.env.AVM_ADDRESS ||
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
process.env.FACILITATOR_URL =
  process.env.FACILITATOR_URL || "https://facilitator.goplausible.xyz";

const { default: app } = await import("./index.js");

const check = (name: string, condition: boolean) => {
  if (!condition) throw new Error(`✗ ${name}`);
  console.log(`✓ ${name}`);
};

const run = async () => {
  const health = await app.request("/health");
  check("GET /health returns 200", health.status === 200);

  const info = await app.request("/info");
  check("GET /info returns 200", info.status === 200);

  const unpaid = await app.request("/generate-deck", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectName: "Smoke Test" }),
  });
  check("POST /generate-deck without payment returns 402", unpaid.status === 402);
  check(
    "402 response exposes PAYMENT-REQUIRED",
    Boolean(unpaid.headers.get("PAYMENT-REQUIRED")),
  );

  const missing = await app.request("/does-not-exist");
  check("Unknown endpoint returns 404", missing.status === 404);

  console.log("\n✓ GlassPitch x402 smoke tests passed\n");
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
