# GlassPitch AI — x402 Resource Server

This directory is the **payment backend** for GlassPitch AI. It follows the
structure and middleware pattern of the official x402 Hackathon Starter Kit,
with a custom `POST /generate-deck` use case.

## x402 flow

```text
GlassPitch frontend
      |
      | POST /generate-deck
      v
Hono + @x402/hono
      |
      | no payment
      v
HTTP 402 + PAYMENT-REQUIRED
      |
      | wallet signs x402 payment
      v
PAYMENT-SIGNATURE
      |
      v
GoPlausible facilitator
      |
      v
Algorand TestNet / USDC
      |
      v
200 + premium deck generation result
```

The current x402 v2 protocol uses `PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE`, and
`PAYMENT-RESPONSE` headers. The official SDK handles those encodings.

## Endpoints

| Endpoint | Price | Purpose |
|---|---:|---|
| `POST /generate-deck` | $1.00 USDC | GlassPitch premium pitch-deck generation |
| `GET /weather` | $0.005 USDC | Starter-kit demonstration endpoint |
| `GET /health` | Free | Health check |
| `GET /info` | Free | Service information |
| `GET /` | Free | Service status |

## Local setup

```bash
cd x402-demo-server
npm install
copy .env.example .env
```

Set:

```env
AVM_ADDRESS=YOUR_ALGORAND_TESTNET_RECEIVER
FACILITATOR_URL=https://facilitator.goplausible.xyz
PORT=4021
DECK_PRICE_USD=1.00
```

Run:

```bash
npm run dev
```

Check:

```bash
curl http://localhost:4021/health
```

A request without payment should return `402`:

```bash
curl -i -X POST http://localhost:4021/generate-deck ^
  -H "Content-Type: application/json" ^
  -d "{\"projectName\":\"GlassPitch Demo\"}"
```

## Deployment

This is a long-running Node/Hono server, so deploy it separately from the
Vite frontend. Render or Fly.io can run the included Dockerfile.

After deployment, set the Vercel frontend variable:

```env
VITE_X402_SERVER_URL=https://YOUR-X402-SERVER
```

## Hackathon compliance

The parent repository remains the fork of `marotipatre/x402-Project`. This
server keeps the starter-kit concepts:

- `x402-demo-server/`
- `endpoints.config.ts`
- `handlers/`
- Hono server
- x402 payment middleware
- Algorand TestNet + USDC
- a custom payment-protected endpoint

The custom endpoint is:

```text
POST /generate-deck
```

That is the core GlassPitch AI x402 use case.
