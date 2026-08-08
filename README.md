# GlassPitch AI

GlassPitch AI is an AI-powered investor pitch-deck platform with **pay-per-use
premium generation powered by x402 on Algorand**.

> **Hackathon note:** this project is intended to live inside the team's fork of
> `marotipatre/x402-Project`. Keep the fork relationship intact.

## Stack

- Vite + React 19 + TypeScript
- React Router v7
- Tailwind v4 + shadcn/ui
- Convex + Convex Auth — application backend
- Hono + `@x402/*` — payment-protected API
- Algorand TestNet + USDC — settlement
- Pera / Defly — wallet signing

## Architecture

```text
                    GLASSPITCH AI
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        Vercel frontend       x402 API server
        React + Vite          Hono + @x402/*
              │                     │
              │                     │ 402 / PAYMENT-REQUIRED
              │                     │ PAYMENT-SIGNATURE
              │                     ▼
              │              GoPlausible facilitator
              │                     │
              │                     ▼
              │              Algorand TestNet
              │                  USDC
              │
              ▼
           Convex
       auth · users · decks
       comments · unlocks
```

### Responsibilities

| Concern | Service |
|---|---|
| UI, routing, editor | Vercel |
| Auth, users, decks, app data | Convex |
| x402 payment negotiation + verification/settlement | `x402-demo-server` |
| Blockchain settlement | Algorand TestNet |
| Wallet signing | Pera / Defly |

## Premium payment flow

```text
1. User opens Premium deck
2. Frontend → POST /generate-deck
3. x402 server → HTTP 402 + PAYMENT-REQUIRED
4. Frontend creates x402 PaymentPayload
5. Pera/Defly signs the Algorand USDC payment group
6. Frontend retries → PAYMENT-SIGNATURE
7. @x402/hono → facilitator → Algorand verification/settlement
8. Server returns 200 + premium generation result
9. Convex records the unlock
```

x402 v2 uses dedicated `PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE`, and
`PAYMENT-RESPONSE` headers rather than the older JSON-only quote flow.

## Local development

### Frontend + Convex

```bash
npm install
npm run dev
```

### x402 payment server

```bash
cd x402-demo-server
npm install
copy .env.example .env
npm run dev
```

Set the server `.env`:

```env
AVM_ADDRESS=YOUR_ALGORAND_TESTNET_RECEIVER
FACILITATOR_URL=https://facilitator.goplausible.xyz
PORT=4021
DECK_PRICE_USD=1.00
```

Set the frontend environment:

```env
VITE_CONVEX_URL=YOUR_CONVEX_URL
VITE_X402_SERVER_URL=http://localhost:4021
```

## Production deployment

### 1. Convex

Deploy your Convex functions with the Convex CLI and obtain the production
`VITE_CONVEX_URL`.

### 2. x402 server

Deploy the `x402-demo-server/` directory to Render or Fly.io using its included
Dockerfile.

Required server variables:

```text
AVM_ADDRESS
FACILITATOR_URL
DECK_PRICE_USD
PORT
```

### 3. Vercel

The repository root is the Vite frontend.

```text
Install: npm install
Build:   npm run build
Output:  dist
```

Set:

```text
VITE_CONVEX_URL=https://YOUR-CONVEX-DEPLOYMENT.convex.cloud
VITE_X402_SERVER_URL=https://YOUR-X402-SERVER
```

The included `vercel.json` also provides the SPA rewrite required for direct
React Router routes such as `/dashboard` and `/d/:shareCode`.

## Hackathon x402 checklist

- [x] Repository is a GitHub fork of the official starter
- [x] `x402-demo-server/` retained
- [x] `endpoints.config.ts` retained/extended
- [x] `handlers/` retained/extended
- [x] Hono server retained
- [x] Official `@x402/hono` middleware
- [x] Official `@x402/core` resource server
- [x] Official `@x402/avm` Algorand exact scheme
- [x] Custom `POST /generate-deck` paid endpoint
- [x] USDC payment on Algorand TestNet
- [x] Pera / Defly wallet flow
- [x] Convex unlock persistence
- [x] Vercel SPA deployment configuration

## Setup

This project is set up already and running on a cloud environment, as well as a convex development in the sandbox.

## Environment Variables

The project is set up with project specific CONVEX_DEPLOYMENT and VITE_CONVEX_URL environment variables on the client side.

The convex server has a separate set of environment variables that are accessible by the convex backend.

Currently, these variables include auth-specific keys: JWKS, JWT_PRIVATE_KEY, and SITE_URL.


# Using Authentication (Important!)

You must follow these conventions when using authentication.

## Auth is already set up.

All convex authentication functions are already set up. The auth currently uses email OTP and anonymous users, but can support more.

The email OTP configuration is defined in `src/convex/auth/emailOtp.ts`. DO NOT MODIFY THIS FILE.

Also, DO NOT MODIFY THESE AUTH FILES: `src/convex/auth.config.ts` and `src/convex/auth.ts`.

## Using Convex Auth on the backend

On the `src/convex/users.ts` file, you can use the `getCurrentUser` function to get the current user's data.

## Using Convex Auth on the frontend

The `/auth` page is already set up to use auth. Navigate to `/auth` for all log in / sign up sequences.

You MUST use this hook to get user data. Never do this yourself without the hook:
```typescript
import { useAuth } from "@/hooks/use-auth";

const { isLoading, isAuthenticated, user, signIn, signOut } = useAuth();
```

## Protected Routes

The starter `/dashboard` route is protected with `RequireAuth`, which sends
signed-out users to `/auth?returnTo=<current route>`. Extend that page for the
product's authenticated experience, and reuse `RequireAuth` when adding another
protected route.

## Auth Page

The auth page is defined in `src/pages/Auth.tsx`. Send sign-in and sign-up actions
to `/auth`.

## Authorization

You can perform authorization checks on the frontend and backend.

On the frontend, you can use the `useAuth` hook to get the current user's data and authentication state.

You should also be protecting queries, mutations, and actions at the base level, checking for authorization securely.

## Adding a redirect after auth

The `/auth` route in `src/main.tsx` redirects to `/dashboard` by default. If the
product's main authenticated route is different, update `redirectAfterAuth` to
that route. A validated same-origin `returnTo` query parameter takes priority so
users can resume the protected page they originally requested. Never leave an
authenticated product redirecting back to the public landing page.

## Complete authenticated products

When the requested product implies accounts, a workspace, a dashboard, or other
signed-in functionality, the task is not complete with only a landing page and
auth form. Build the main authenticated experience, protect its route, and verify
that signing in reaches it.

# Frontend Conventions

You will be using the Vite frontend with React 19, Tailwind v4, and Shadcn UI.

Generally, pages should be in the `src/pages` folder, and components should be in the `src/components` folder.

Shadcn primitives are located in the `src/components/ui` folder and should be used by default.

## Page routing

Your page component should go under the `src/pages` folder.

When adding a page, update the react router configuration in `src/main.tsx` to include the new route you just added.

## Shad CN conventions

Follow these conventions when using Shad CN components, which you should use by default.
- Remember to use "cursor-pointer" to make the element clickable
- For title text, use the "tracking-tight font-bold" class to make the text more readable
- Always make apps MOBILE RESPONSIVE. This is important
- AVOID NESTED CARDS. Try and not to nest cards, borders, components, etc. Nested cards add clutter and make the app look messy.
- AVOID SHADOWS. Avoid adding any shadows to components. stick with a thin border without the shadow.
- Avoid skeletons; instead, use the loader2 component to show a spinning loading state when loading data.


## Landing Pages

You must always create good-looking designer-level styles to your application. 
- Make it well animated and fit a certain "theme", ie neo brutalist, retro, neumorphism, glass morphism, etc

Use known images and emojis from online.

If the user is logged in already, show the get started button to say "Dashboard" or "Profile" instead to take them there.

## Responsiveness and formatting

Make sure pages are wrapped in a container to prevent the width stretching out on wide screens. Always make sure they are centered aligned and not off-center.

Always make sure that your designs are mobile responsive. Verify the formatting to ensure it has correct max and min widths as well as mobile responsiveness.

- Always create sidebars for protected dashboard pages and navigate between pages
- Always create navbars for landing pages
- On these bars, the created logo should be clickable and redirect to the index page

## Animating with Framer Motion

You must add animations to components using Framer Motion. It is already installed and configured in the project.

To use it, import the `motion` component from `framer-motion` and use it to wrap the component you want to animate.


### Other Items to animate
- Fade in and Fade Out
- Slide in and Slide Out animations
- Rendering animations
- Button clicks and UI elements

Animate for all components, including on landing page and app pages.

## Three JS Graphics

Your app comes with three js by default. You can use it to create 3D graphics for landing pages, games, etc.


## Colors

You can override colors in: `src/index.css`

This uses the oklch color format for tailwind v4.

Always use these color variable names.

Make sure all ui components are set up to be mobile responsive and compatible with both light and dark mode.

Set theme using `dark` or `light` variables at the parent className.

## Styling and Theming

When changing the theme, always change the underlying theme of the shad cn components app-wide under `src/components/ui` and the colors in the index.css file.

Avoid hardcoding in colors unless necessary for a use case, and properly implement themes through the underlying shad cn ui components.

When styling, ensure buttons and clickable items have pointer-click on them (don't by default).

Always follow a set theme style and ensure it is tuned to the user's liking.

## Toasts

You should always use toasts to display results to the user, such as confirmations, results, errors, etc.

Use the shad cn Sonner component as the toaster. For example:

```
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
export function SonnerDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
    >
      Show Toast
    </Button>
  )
}
```

Remember to import { toast } from "sonner". Usage: `toast("Event has been created.")`

## Dialogs

Always ensure your larger dialogs have a scroll in its content to ensure that its content fits the screen size. Make sure that the content is not cut off from the screen.

Ideally, instead of using a new page, use a Dialog instead. 

# Using the Convex backend

You will be implementing the convex backend. Follow your knowledge of convex and the documentation to implement the backend.

## The Convex Schema

You must correctly follow the convex schema implementation.

The schema is defined in `src/convex/schema.ts`.

Do not include the `_id` and `_creationTime` fields in your queries (it is included by default for each table).
Do not index `_creationTime` as it is indexed for you. Never have duplicate indexes.


## Convex Actions: Using CRUD operations

When running anything that involves external connections, you must use a convex action with "use node" at the top of the file.

You cannot have queries or mutations in the same file as a "use node" action file. Thus, you must use pre-built queries and mutations in other files.

You can also use the pre-installed internal crud functions for the database:

```ts
// in convex/users.ts
import { crud } from "convex-helpers/server/crud";
import schema from "./schema.ts";

export const { create, read, update, destroy } = crud(schema, "users");

// in some file, in an action:
const user = await ctx.runQuery(internal.users.read, { id: userId });

await ctx.runMutation(internal.users.update, {
  id: userId,
  patch: {
    status: "inactive",
  },
});
```


## Common Convex Mistakes To Avoid

When using convex, make sure:
- Document IDs are referenced as `_id` field, not `id`.
- Document ID types are referenced as `Id<"TableName">`, not `string`.
- Document object types are referenced as `Doc<"TableName">`.
- Keep schemaValidation to false in the schema file.
- You must correctly type your code so that it passes the type checker.
- You must handle null / undefined cases of your convex queries for both frontend and backend, or else it will throw an error that your data could be null or undefined.
- Always use the `@/folder` path, with `@/convex/folder/file.ts` syntax for importing convex files.
- This includes importing generated files like `@/convex/_generated/server`, `@/convex/_generated/api`
- Remember to import functions like useQuery, useMutation, useAction, etc. from `convex/react`
- NEVER have return type validators.
