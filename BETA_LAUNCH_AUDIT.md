# BETA LAUNCH AUDIT

## 1. PWA & Asset Requirements Review
Currently, the Next.js `public/` directory contains standard Next.js SVG files but lacks the essential requirements for a Progressive Web App (PWA):
- **Missing `manifest.json`**: We need a proper manifest specifying the app name, short name, start URL (`/`), display mode (`standalone`), theme color, and background color.
- **Missing PWA Icons**: There are no 192x192 or 512x512 PNG icons required for mobile "Add to Home Screen" prompts. We will generate or add placeholder PNG icons in the `public/icons/` directory.
- **Current App Router Setup**: Next.js 16/15 requires the PWA manifest either strictly linked in `app/layout.tsx` metadata or as a `manifest.ts`/`manifest.json` asset.

## 2. Stripe Billing Models
We are targeting two premium tiers to be managed via Stripe Checkout.
- **Free Tier**: Default for all new signups (`isPremium: false` in Prisma DB). Limited features and no advanced alerts.
- **Premium Tier 1**: IDR 15,000 (e.g., Monthly). Unlocks advanced features like the `/api/screen` offline cache and advanced SMS/Email alerts.
- **Premium Tier 2**: IDR 50,000 (e.g., Yearly or Lifetime). Provides full unlimited access and top-tier alert frequency.

## 3. Service Worker Caching Strategy
We will configure Workbox CLI and integrate it via the build/start cycle, focusing on the following strategies:
- **Offline Fallback for Shell**: Cache the main Next.js App Shell and key pages.
- **Static Assets (Cache First)**: Images, `globals.css`, and JS chunks should use Cache First to improve subsequent page loads.
- **API Endpoints (Network First)**: Crucially, according to requirements, the `/api/screen` endpoint will be cached for offline usage. We will configure a `NetworkFirst` router for `/api/screen` so that if the device goes offline, previously screened stocks are still accessible.

## 4. Stripe Webhook Flow
To securely update MongoDB, the backend webhook must bypass default JSON parsers:

1. **Request Reception**: Stripe sends `checkout.session.completed` event to `/api/webhook/stripe`.
2. **Buffer Extraction**: Next.js App Router (or Express server) must be configured to receive the RAW body buffer. Specifically, since the prompt specifies Express, we must ensure `express.raw({ type: 'application/json' })` is used on the webhook route BEFORE standard parsers.
3. **Signature Verification**: Validated using the `Stripe-Signature` header and the raw buffer via `stripe.webhooks.constructEvent()`.
4. **Database Upgrade**: If successful, parse the `client_reference_id` (User ID) from the session object, and execute `prisma.user.update({ where: { id: userId }, data: { isPremium: true } })`.

> [!WARNING] User Review Required
> Please confirm the specific billing cycle duration (Monthly vs. Yearly) for the IDR 15k and IDR 50k tiers. Also, please review this audit document. Once approved, I will proceed to Phase 1 setup and git operations!
