# GlassPitch AI Deployment Checklist

## GitHub
- [ ] Repository is `akashanandhakumar-dotcom/x402-Project`
- [ ] GitHub says `forked from marotipatre/x402-Project`
- [ ] Existing template folders were not deleted

## Frontend
- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds
- [ ] `VITE_CONVEX_URL` is set in Vercel
- [ ] `VITE_X402_SERVER_URL` points to the deployed x402 API
- [ ] Direct routes such as `/dashboard` work after refresh

## Convex
- [ ] Production deployment exists
- [ ] Auth works
- [ ] Deck creation works
- [ ] `recordX402Unlock` works

## x402 backend
- [ ] `npm install` succeeds inside `x402-demo-server`
- [ ] `npm run build` succeeds
- [ ] `GET /health` returns 200
- [ ] `POST /generate-deck` without payment returns 402
- [ ] `PAYMENT-REQUIRED` header is present
- [ ] `AVM_ADDRESS` is funded/opted into TestNet USDC
- [ ] `FACILITATOR_URL=https://facilitator.goplausible.xyz`
- [ ] `DECK_PRICE_USD=1.00`
- [ ] `PAYMENT-SIGNATURE` reaches the server from the browser

## Wallet
- [ ] Pera or Defly connects
- [ ] Wallet is on Algorand TestNet
- [ ] Wallet has TestNet USDC
- [ ] Wallet has enough ALGO for transaction fees
- [ ] Receiver address is opted into USDC

## Demo
- [ ] Show unpaid request → 402
- [ ] Show wallet approval
- [ ] Show payment settlement
- [ ] Show premium deck unlocked
- [ ] Show Algorand transaction in the explorer
