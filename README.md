# Saul Tents — B2B Wholesale Website (MVP)

English-language B2B website for Saul Tents, a factory-direct outdoor
shelter supplier. Built with **Next.js 16 (App Router) + TypeScript +
Tailwind CSS 4**. All product data comes from the real supplier price
sheet — no fabricated products or images.

> **Private data stays private.** Supplier wholesale prices live in
> `web/data/private/prices.json` (gitignored). The public site never
> renders prices — quotations are given per inquiry, which is standard
> B2B wholesale practice.

## Project layout

```
saul-tents/
├── scripts/
│   └── sync_products.py      # Excel → JSON + images pipeline
├── web/
│   ├── app/                  # pages (home, products, detail, wholesale,
│   │   │                     #   about, contact, inquiry API, sitemap, robots)
│   ├── components/           # header, footer, cards, gallery, inquiry form…
│   ├── config/site.ts        # ← pre-launch configuration lives here
│   ├── lib/products.ts       # product data access layer
│   ├── data/
│   │   ├── products.json     # public catalogue (generated — no prices)
│   │   └── private/prices.json  # supplier costs (gitignored, internal only)
│   └── public/images/products/ # WebP product photos (generated)
└── README.md
```

## Run locally

```bash
cd web
npm install        # first time only
npm run dev        # → http://localhost:3000
```

Production-style check:

```bash
npm run build
npm run start      # → http://localhost:3000
```

## Update products (no code changes needed)

The catalogue is generated from the supplier Excel sheet:

```bash
cd web
npm run sync:products
```

This re-reads the source workbook (`scripts/sync_products.py` has the
path), regenerates `data/products.json`, `data/private/prices.json` and
all product images, then restart the dev server. New products, changed
specs and new photos appear automatically — the code never needs editing.

## Pre-launch configuration checklist

Everything lives in `web/config/site.ts` (or `NEXT_PUBLIC_*` env vars):

| Item | Where | Notes |
|---|---|---|
| Public site URL | `url` / `NEXT_PUBLIC_SITE_URL` | Replace `https://www.saul-tents.com` if needed |
| Contact email | `contact.email` / `NEXT_PUBLIC_CONTACT_EMAIL` | Hidden everywhere while empty |
| WhatsApp number | `contact.whatsapp` / `NEXT_PUBLIC_WHATSAPP_NUMBER` | Digits only, no `+`. Floating button + links appear once set |
| Google Analytics 4 | `analytics.googleAnalyticsId` / `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` |
| Google Ads tag | `analytics.googleAdsId` / `NEXT_PUBLIC_ADS_ID` | `AW-XXXXXXXXX` |
| Ads conversion label | `analytics.adsConversionLabel` / `NEXT_PUBLIC_ADS_CONVERSION_LABEL` | Fired on inquiry submit |
| Email service for inquiries | `app/api/inquiries/route.ts` + `demoMode: false` | See below |

### Wiring the inquiry form to real email

The inquiry endpoint (`web/app/api/inquiries/route.ts`) currently runs in
**demo mode**: submissions are validated, then saved as JSON files under
`web/data/inquiries/`. No email is sent, and the UI clearly labels this.

To go live: replace the save block in that route with your email/CRM
integration (Resend, SendGrid, Nodemailer, a form backend like Formspree,
or a webhook to your CRM), then set `demoMode: false` in `config/site.ts`.
Deploy on a Node-capable host (Vercel, a VPS) — the demo file-save only
works with a persistent filesystem, e.g. `npm run start` on a server.

## Deploy

Standard Next.js app — works on Vercel / Netlify / any Node host:

```bash
cd web
npm run build
npm run start        # Node host, port 3000
```

On Vercel: import the repo (or just `web/`), no extra config. Set the
`NEXT_PUBLIC_*` env vars from the table above. Re-run
`npm run sync:products` before each deploy to refresh the catalogue.
