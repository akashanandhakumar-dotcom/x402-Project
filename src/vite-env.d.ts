/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_VLY_APP_ID?: string;
  readonly VITE_VLY_MONITORING_URL?: string;
  /** Base URL of the live x402 payment server (defaults to http://localhost:4021). */
  readonly VITE_X402_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
