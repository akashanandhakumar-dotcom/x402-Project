# GlassPitch AI → Existing x402 Fork Merge Guide

Your GitHub repository is already the correct fork:

`akashanandhakumar-dotcom/x402-Project` → forked from `marotipatre/x402-Project`.

**Do not create another repository and do not delete the fork relationship.**

## 1. Open the existing fork locally

```bash
git clone https://github.com/akashanandhakumar-dotcom/x402-Project.git
cd x402-Project
git status
```

Make sure GitHub still shows **forked from `marotipatre/x402-Project`**.

## 2. Extract this GlassPitch package

Copy the contents of `glasspitch-ai-main/` from this package into the root
of your cloned fork.

Choose **Replace** when Windows asks about files with the same name.

### IMPORTANT

Do **not** delete these existing template folders/files from the fork:

```text
402-demo-client/
X402-Usecase/
.gitmodules
ARCHITECTURE.md
BAZAAR_DISCOVERY.md
COMPLETE_SETUP_GUIDE.md
CONCEPT_NOTE_X402_BUILD_SPRINT.md
FACILITATOR_CHECKLIST.md
IMPLEMENTATION_SUMMARY.md
QUICK_REFERENCE.md
STARTER_KIT_COMPLETE.md
X402_IMPLEMENTATION_GUIDE.md
```

The GlassPitch files replace the application root and the customized
`x402-demo-server/`, while the original starter material remains in the fork.

## 3. Install the frontend

From the repository root:

```bash
npm install
npm run build
```

Then:

```bash
npm run dev
```

## 4. Configure Convex

Create/configure your production Convex deployment and set:

```text
VITE_CONVEX_URL
CONVEX_DEPLOYMENT
CONVEX_SITE_URL
```

Never commit real secrets.

## 5. Configure the x402 server

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

Then verify that:

```bash
curl -i -X POST http://localhost:4021/generate-deck ^
  -H "Content-Type: application/json" ^
  -d "{\"projectName\":\"GlassPitch Demo\"}"
```

returns `402` and includes a `PAYMENT-REQUIRED` header.

## 6. Deploy the x402 server

Render or Fly.io can use:

```text
x402-demo-server/Dockerfile
```

After deployment, test:

```text
https://YOUR-X402-SERVER/health
```

## 7. Deploy the frontend to Vercel

The root `vercel.json` is already configured for:

```text
Install: npm install
Build:   npm run build
Output:  dist
```

Set Vercel environment variables:

```text
VITE_CONVEX_URL
VITE_X402_SERVER_URL
```

`VITE_X402_SERVER_URL` must be your deployed x402 API, not localhost.

## 8. Commit into the fork

From the fork root:

```bash
git add .
git commit -m "Add GlassPitch AI x402 use case"
git push origin main
```

GitHub should continue to display:

```text
forked from marotipatre/x402-Project
```

## 9. Final judge flow

```text
GitHub fork
   ↓
Vercel GlassPitch frontend
   ↓
Convex auth/data
   ↓
POST /generate-deck
   ↓
HTTP 402 + PAYMENT-REQUIRED
   ↓
Pera / Defly signs USDC payment
   ↓
PAYMENT-SIGNATURE
   ↓
@x402/hono + GoPlausible facilitator
   ↓
Algorand TestNet
   ↓
PAYMENT-RESPONSE
   ↓
Premium deck unlocked
```
