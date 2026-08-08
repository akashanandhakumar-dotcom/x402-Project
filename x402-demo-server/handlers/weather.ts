import type { Context } from "hono";

export function handleWeatherRequest(c: Context) {
  const location = c.req.query("location") || "San Francisco, CA";
  return c.json({
    report: {
      location,
      weather: "sunny",
      temperature: 70,
      humidity: 65,
      timestamp: new Date().toISOString(),
    },
    paidVia: "x402 / USDC / Algorand TestNet",
  });
}
