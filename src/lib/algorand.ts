/**
 * Client-side Algorand wallet helpers for the x402 premium gate.
 *
 * Heavily-dynamic imports keep algosdk + wallet SDKs out of the main bundle —
 * they only load when a user actually opens the payment gate.
 */

export type WalletKind = "pera" | "defly" | "manual";

export interface X402ClientConfig {
  network: "testnet" | "mainnet";
  genesisID: string;
  algodUrl: string;
  indexerUrl: string;
  receiverAddress: string;
  amountAlgo: number;
  amountMicro: number;
  assetId: number;
  explorerBase: string;
}

/** Connect the Pera wallet (mobile / extension via WalletConnect v2). */
export async function connectPera(): Promise<string> {
  const { PeraWalletConnect } = await import("@perawallet/connect");
  const pera = new PeraWalletConnect();
  const accounts = await pera.connect();
  if (!accounts?.[0]) throw new Error("No account selected in Pera.");
  return accounts[0];
}

/** Connect the Defly wallet (mobile / extension). */
export async function connectDefly(): Promise<string> {
  const { DeflyWalletConnect } = await import("@blockshake/defly-connect");
  const defly = new DeflyWalletConnect();
  const accounts = await defly.connect();
  if (!accounts?.[0]) throw new Error("No account selected in Defly.");
  return accounts[0];
}

/** Build a native ALGO payment transaction (unsigned, algosdk Transaction). */
async function buildPaymentTxn(opts: {
  from: string;
  to: string;
  amountMicro: number;
  note: string;
  algodUrl: string;
}) {
  const algosdk = await import("algosdk");
  const algod = new algosdk.Algodv2("", opts.algodUrl);
  const suggestedParams = await algod.getTransactionParams().do();
  return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: opts.from,
    receiver: opts.to,
    amount: opts.amountMicro,
    note: new TextEncoder().encode(opts.note.slice(0, 500)),
    suggestedParams,
  });
}

type AlgoTxn = Awaited<ReturnType<typeof buildPaymentTxn>>;

/** Sign a transaction with the connected wallet and submit it to the network. */
async function signAndSubmit(opts: {
  kind: Exclude<WalletKind, "manual">;
  walletAddress: string;
  txn: AlgoTxn;
  algodUrl: string;
}): Promise<string> {
  if (opts.kind === "pera") {
    const { PeraWalletConnect } = await import("@perawallet/connect");
    const pera = new PeraWalletConnect();
    const signed = await pera.signTransaction([[{ txn: opts.txn, signers: [opts.walletAddress] }]]);
    const blob = signed?.[0];
    if (!blob) throw new Error("Pera returned no signed transaction.");
    const algosdk = await import("algosdk");
    const algod = new algosdk.Algodv2("", opts.algodUrl);
    const { txid } = await algod.sendRawTransaction(blob).do();
    return txid;
  }

  // Defly
  const { DeflyWalletConnect } = await import("@blockshake/defly-connect");
  const defly = new DeflyWalletConnect();
  const signed = await defly.signTransaction([[{ txn: opts.txn, signers: [opts.walletAddress] }]]);
  const blob = signed?.[0];
  if (!blob) throw new Error("Defly returned no signed transaction.");
  const algosdk = await import("algosdk");
  const algod = new algosdk.Algodv2("", opts.algodUrl);
  const { txid } = await algod.sendRawTransaction(blob).do();
  return txid;
}

/**
 * Sign + submit a native ALGO payment using the connected wallet. Returns the
 * on-chain transaction id, which the server then verifies via the indexer.
 */
export async function payWithWallet(opts: {
  kind: WalletKind;
  walletAddress: string;
  to: string;
  amountMicro: number;
  note: string;
  algodUrl: string;
}): Promise<{ txId: string }> {
  if (opts.kind === "manual") {
    throw new Error("Manual mode: paste an existing transaction hash to verify.");
  }

  const txn = await buildPaymentTxn({
    from: opts.walletAddress,
    to: opts.to,
    amountMicro: opts.amountMicro,
    note: opts.note,
    algodUrl: opts.algodUrl,
  });

  const txId = await signAndSubmit({
    kind: opts.kind,
    walletAddress: opts.walletAddress,
    txn,
    algodUrl: opts.algodUrl,
  });
  return { txId };
}

/** Build a USDC (ASA) asset-transfer transaction (unsigned, algosdk Transaction). */
async function buildAssetTransferTxn(opts: {
  from: string;
  to: string;
  assetId: number;
  amountUnits: number;
  note: string;
  algodUrl: string;
}) {
  const algosdk = await import("algosdk");
  const algod = new algosdk.Algodv2("", opts.algodUrl);
  const suggestedParams = await algod.getTransactionParams().do();
  return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: opts.from,
    receiver: opts.to,
    assetIndex: opts.assetId,
    amount: opts.amountUnits,
    note: new TextEncoder().encode(opts.note.slice(0, 500)),
    suggestedParams,
  });
}

/**
 * Sign + submit a USDC (ASA) payment using the connected wallet — used by the
 * live x402 server flow, which quotes prices in USDC. Returns the on-chain
 * transaction id for the server to verify.
 */
export async function payUsdcWithWallet(opts: {
  kind: Exclude<WalletKind, "manual">;
  walletAddress: string;
  to: string;
  assetId: number;
  amountUsd: number;
  note: string;
  algodUrl: string;
}): Promise<{ txId: string }> {
  // USDC has 6 decimals on Algorand
  const amountUnits = Math.round(opts.amountUsd * 1_000_000);
  const txn = await buildAssetTransferTxn({
    from: opts.walletAddress,
    to: opts.to,
    assetId: opts.assetId,
    amountUnits,
    note: opts.note,
    algodUrl: opts.algodUrl,
  });

  const txId = await signAndSubmit({
    kind: opts.kind,
    walletAddress: opts.walletAddress,
    txn,
    algodUrl: opts.algodUrl,
  });
  return { txId };
}

/** Explorer link for a transaction on the configured network. */
export function explorerUrl(base: string, txId: string): string {
  return `${base}/tx/${txId}`;
}

/** Explorer link for an asset. */
export function assetExplorerUrl(base: string, assetId: number): string {
  return `${base}/asset/${assetId}`;
}

/* ------------------------------------------------------------------ */
/* ARC-3 NFT minting                                                   */
/* ------------------------------------------------------------------ */

export interface Arc3Metadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  properties: Record<string, string | number>;
}

/** Build the ARC-3 metadata JSON for a pitch deck NFT. */
export function buildArc3Metadata(opts: {
  title: string;
  tagline: string;
  creator: string;
  shareCode: string;
  origin: string;
  sections: { key: string; title: string }[];
}): Arc3Metadata {
  return {
    name: opts.title,
    description: `${opts.tagline}\n\nGenerated by GlassPitch AI — an investor-ready pitch deck forged from your repository docs.`,
    image: `${opts.origin}/api/og?deck=${opts.shareCode}`,
    external_url: `${opts.origin}/d/${opts.shareCode}`,
    properties: {
      Creator: opts.creator || "Anonymous",
      Sections: opts.sections.length,
      Slides: 13,
      "Generated by": "GlassPitch AI",
      ...Object.fromEntries(opts.sections.map((s, i) => [`Slide ${i + 1}`, s.title])),
    },
  };
}

/** SHA-256 hash of a string → 32-byte Uint8Array (Web Crypto API). */
async function sha256Bytes(input: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

/** Mint a pitch deck as an ARC-3 NFT on Algorand. Returns asset ID + tx hash. */
export async function mintDeckNft(opts: {
  kind: Exclude<WalletKind, "manual">;
  walletAddress: string;
  metadata: Arc3Metadata;
  algodUrl: string;
}): Promise<{ assetId: number; txHash: string; metadataUrl: string }> {
  const algosdk = await import("algosdk");
  const algod = new algosdk.Algodv2("", opts.algodUrl);
  const suggestedParams = await algod.getTransactionParams().do();

  // 1. Serialize metadata JSON and compute SHA-256 hash
  const jsonStr = JSON.stringify(opts.metadata, null, 2);
  const metadataHash = await sha256Bytes(jsonStr);
  const metadataDataUri = `data:application/json;base64,${btoa(jsonStr)}`;

  // 2. Build asset creation transaction (ARC-3 NFT)
  const truncate = (s: string, max: number) =>
    s.length > max ? s.slice(0, max) : s;

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    sender: opts.walletAddress,
    total: 1n, // 1 of 1 — true NFT
    decimals: 0,
    defaultFrozen: false,
    manager: opts.walletAddress,
    reserve: opts.walletAddress,
    freeze: undefined,
    clawback: undefined,
    assetName: truncate(opts.metadata.name, 32),
    unitName: "PITCH",
    assetURL: truncate(metadataDataUri, 96), // data URI truncated if needed
    assetMetadataHash: metadataHash,
    note: new TextEncoder().encode("GlassPitch AI — ARC-3 NFT mint"),
    suggestedParams,
  });

  // 3. Sign + submit via the connected wallet
  if (opts.kind === "pera") {
    const { PeraWalletConnect } = await import("@perawallet/connect");
    const pera = new PeraWalletConnect();
    const signed = await pera.signTransaction([[{ txn, signers: [opts.walletAddress] }]]);
    const blob = signed?.[0];
    if (!blob) throw new Error("Pera returned no signed transaction.");
    const { txid } = await algod.sendRawTransaction(blob).do();
    // Wait for confirmation to get the asset ID
    const result = await algosdk.waitForConfirmation(algod, txid, 4);
    const assetId = Number(result.assetIndex ?? 0);
    return { assetId, txHash: txid, metadataUrl: metadataDataUri };
  }

  // Defly
  const { DeflyWalletConnect } = await import("@blockshake/defly-connect");
  const defly = new DeflyWalletConnect();
  const signed = await defly.signTransaction([[{ txn, signers: [opts.walletAddress] }]]);
  const blob = signed?.[0];
  if (!blob) throw new Error("Defly returned no signed transaction.");
  const { txid } = await algod.sendRawTransaction(blob).do();
  const result = await algosdk.waitForConfirmation(algod, txid, 4);
  const assetId = Number(result.assetIndex ?? 0);
  return { assetId, txHash: txid, metadataUrl: metadataDataUri };
}


/* ------------------------------------------------------------------ */
/* x402 v2 browser client                                               */
/* ------------------------------------------------------------------ */

type X402PaymentKind = Exclude<WalletKind, "manual">;

let peraSession: any = null;
let deflySession: any = null;

async function getPeraSession() {
  if (!peraSession) {
    const { PeraWalletConnect } = await import("@perawallet/connect");
    peraSession = new PeraWalletConnect();
  }
  return peraSession;
}

async function getDeflySession() {
  if (!deflySession) {
    const { DeflyWalletConnect } = await import("@blockshake/defly-connect");
    deflySession = new DeflyWalletConnect();
  }
  return deflySession;
}

/**
 * Sign the transaction group produced by the official @x402/avm client.
 * x402 v2 uses an Algorand ASA transfer group as its payment payload.
 */
async function createBrowserAvmSigner(
  kind: X402PaymentKind,
  walletAddress: string,
) {
  return {
    address: walletAddress,
    signTransactions: async (
      txns: Uint8Array[],
      indexesToSign: number[] = txns.map((_, i) => i),
    ) => {
      const algosdk = await import("algosdk");
      const decoded = txns.map((raw) => {
        const encodingData = algosdk.decodeObj(raw) as any;
        const TransactionClass = algosdk.Transaction as any;
        if (typeof TransactionClass.fromEncodingData === "function") {
          return TransactionClass.fromEncodingData(encodingData);
        }
        if (typeof TransactionClass.from_obj === "function") {
          return TransactionClass.from_obj(encodingData);
        }
        return encodingData;
      });

      const signers = new Set(indexesToSign);

      const request = [
        decoded.map((txn, index) => ({
          txn,
          signers: signers.has(index) ? [walletAddress] : [],
        })),
      ];

      const wallet = kind === "pera"
        ? await getPeraSession()
        : await getDeflySession();

      const signedGroups = await wallet.signTransaction(request);
      const signed = signedGroups?.[0];

      if (!signed || signed.length !== txns.length) {
        throw new Error("Wallet returned an incomplete x402 transaction group.");
      }

      return signed.map((blob: Uint8Array, index: number) =>
        signers.has(index) ? blob : null,
      );
    },
  };
}

export interface X402BrowserQuote {
  amount: string;
  amountUsd: number;
  network: string;
  receiver: string;
  asset: string;
  assetId: number;
  description: string;
  resourceUrl: string;
}

/**
 * Fetch a standard x402 v2 PAYMENT-REQUIRED challenge and turn it into the
 * compact quote shape already used by the GlassPitch UI.
 */
export async function fetchX402Quote(opts: {
  serverUrl: string;
  body: Record<string, unknown>;
}): Promise<X402BrowserQuote> {
  const { x402HTTPClient } = await import("@x402/core/http");
  const { x402Client } = await import("@x402/core/client");
  const { ExactAvmScheme } = await import("@x402/avm");

  // A signer is not needed to decode a 402 response, so use a dummy client.
  const dummySigner = {
    address: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ",
    signTransactions: async () => [],
  };
  const coreClient = new x402Client().register(
    "algorand:*" as any,
    new ExactAvmScheme(dummySigner as any),
  );
  const httpClient = new x402HTTPClient(coreClient);

  const response = await fetch(`${opts.serverUrl.replace(/\/$/, "")}/generate-deck`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts.body),
  });

  if (response.status !== 402) {
    throw new Error(`Payment server responded with ${response.status} — expected HTTP 402.`);
  }

  const paymentRequired = httpClient.getPaymentRequiredResponse(
    (name) => response.headers.get(name),
  );
  const accepted = paymentRequired.accepts?.[0];

  if (!accepted) {
    throw new Error("Payment server returned no supported payment requirement.");
  }

  const amountUnits = Number(accepted.amount);
  if (!Number.isFinite(amountUnits) || amountUnits <= 0) {
    throw new Error("Payment server returned an invalid payment amount.");
  }

  const isTestnet = accepted.network.includes("SGO1GKSzyE7IEPItTxCByw9x8FmnrCDe");
  return {
    amount: `$${(amountUnits / 1_000_000).toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}`,
    amountUsd: amountUnits / 1_000_000,
    network: isTestnet ? "algorand-testnet" : "algorand-mainnet",
    receiver: accepted.payTo,
    asset: "USDC",
    assetId: Number((accepted.extra as any)?.asset ?? 0),
    description: (paymentRequired.resource as any)?.description ?? "GlassPitch premium deck generation",
    resourceUrl: (paymentRequired.resource as any)?.url ?? "",
  };
}

/**
 * Execute a complete x402 v2 payment flow:
 * 1. request resource
 * 2. receive PAYMENT-REQUIRED
 * 3. create/sign PaymentPayload with official @x402/avm
 * 4. retry with PAYMENT-SIGNATURE
 * 5. return the resource response + PAYMENT-RESPONSE settlement
 */
export async function payForX402Resource(opts: {
  serverUrl: string;
  kind: X402PaymentKind;
  walletAddress: string;
  body: Record<string, unknown>;
}) {
  const { x402Client } = await import("@x402/core/client");
  const { x402HTTPClient } = await import("@x402/core/http");
  const { ExactAvmScheme } = await import("@x402/avm");;

  const signer = await createBrowserAvmSigner(opts.kind, opts.walletAddress);
  const coreClient = new x402Client().register(
    "algorand:*" as any,
    new ExactAvmScheme(signer as any),
  );
  const httpClient = new x402HTTPClient(coreClient);

  const url = `${opts.serverUrl.replace(/\/$/, "")}/generate-deck`;
  const requestInit: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts.body),
  };

  const unpaid = await fetch(url, requestInit);
  if (unpaid.status !== 402) {
    const text = await unpaid.text().catch(() => "");
    throw new Error(
      `x402 server returned ${unpaid.status} before payment.${text ? ` ${text}` : ""}`,
    );
  }

  const paymentRequired = httpClient.getPaymentRequiredResponse(
    (name) => unpaid.headers.get(name),
  );

  const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
  const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);

  const paid = await fetch(url, {
    ...requestInit,
    headers: {
      "Content-Type": "application/json",
      ...paymentHeaders,
    },
  });

  const responseBody = await paid.json().catch(() => null);
  if (!paid.ok) {
    const reason =
      (responseBody as any)?.error ||
      (responseBody as any)?.message ||
      `Payment request failed with HTTP ${paid.status}.`;
    throw new Error(String(reason));
  }

  let settlement: any = null;
  try {
    settlement = httpClient.getPaymentSettleResponse(
      (name) => paid.headers.get(name),
    );
  } catch {
    // Some facilitators/versions may not include a settlement header.
  }

  return {
    body: responseBody,
    settlement,
    paymentRequired,
  };
}
