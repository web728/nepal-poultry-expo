# Nepal Poultry & Livestock International Expo 2027 — website

Production website for **Nepal Poultry & Livestock International Expo 2027**
(18–20 February 2027, Bhrikuti Mandap, Kathmandu) — www.nepalpoultryexpo.com

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · MongoDB Atlas ·
Google Sheets API · Nodemailer (Gmail SMTP) · Google reCAPTCHA v2 · Zod

---

## 1. Requirements

- Node.js **20.9 or newer** (tested on Node 24)
- A MongoDB Atlas cluster (any tier, including the free M0)
- Google reCAPTCHA **v2 "I'm not a robot" checkbox** keys
- A Google Cloud service account with the Google Sheets API enabled
- A Gmail account with 2-Step Verification and an **App Password**

## 2. Install and run locally

```bash
npm ci
cp .env.example .env.local      # then fill in the values (see section 3)
npm run dev                     # http://localhost:3000
```

No Atlas cluster yet? `npm run dev:db` starts a local throwaway MongoDB replica set; set
`MONGODB_URI=mongodb://127.0.0.1:27117/?replicaSet=rs0` in `.env.local`.

Production build:

```bash
npm run build
npm run start                   # serves on port 3000
```

## 3. Environment variables

Every variable is documented in **`.env.example`**. Never commit `.env.local`.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | `https://www.nepalpoultryexpo.com` (no trailing slash) |
| `MONGODB_URI`, `MONGODB_DB_NAME` | yes | Atlas connection string; forms return "temporarily unavailable" without it |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` | yes | v2 Checkbox keys; add `nepalpoultryexpo.com` and `www.nepalpoultryexpo.com` as domains |
| `GOOGLE_SERVICE_ACCOUNT_BASE64`, `GOOGLE_SHEET_ID` | for Sheets | Base64 of the whole service-account JSON key; share the sheet with the account's `client_email` as **Editor**. Rows go to the tab **"Website Enquiries"** (header row is created automatically) |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | for e-mail | 16-character App Password (spaces are ignored) |
| `EMAIL_TO_PRIMARY`, `EMAIL_TO_SECONDARY` | for e-mail | both receive every submission |
| `CRON_SECRET` | yes | long random string — protects `/api/cron/outbox` and signs brochure links |

Base64 of the service-account key:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
```
```bash
base64 -w0 service-account.json
```

Google's public reCAPTCHA **test** keys (always pass, show a red "testing" banner) can be used locally:
site `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`, secret `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`.
Never use them in production.

## 4. How form submissions work

```
browser ─► POST /api/submissions
            1. Zod validation + honeypot + minimum fill time
            2. rate limit (MongoDB) ∥ reCAPTCHA verification with Google
            3. MongoDB transaction: submission + 4 outbox jobs
            4. respond to the visitor (typically 150–500 ms)
            5. after(): deliver this submission's jobs
                 • Google Sheets row   • admin e-mail #1   • admin e-mail #2   • confirmation to the visitor
cron / worker ─► /api/cron/outbox   (retries anything still pending)
```

- A submission is **never lost** if Sheets or Gmail is down: jobs stay in `outbox_jobs` and are retried
  with backoff (1 min → 24 h, 8 attempts). Missing credentials keep jobs waiting instead of failing.
- Jobs are leased atomically, so two workers can't double-send; Sheets checks for an existing row on retry.
- Duplicate submits (double clicks, retries, identical content within 10 minutes) return the original reference.
- Collections: `submissions`, `outbox_jobs`, `rate_limits` (indexes are created automatically).

Operations:

```bash
npm run outbox:status       # job counts and recent errors
npm run outbox:retry-dead   # re-queue failed jobs after fixing credentials
```

## 5. Deployment

### Option A — Vercel

1. Import the repository, add the environment variables (Production + Preview).
2. `vercel.json` schedules `/api/cron/outbox` every 5 minutes. Vercel sends `Authorization: Bearer $CRON_SECRET`
   automatically. **Hobby plans only allow daily crons** — use Pro, or call the endpoint from an external
   scheduler (cron-job.org, GitHub Actions) every 5 minutes with that header. Jobs are normally delivered
   immediately after each submission anyway; the cron is the safety net.
3. Point `www.nepalpoultryexpo.com` and the apex domain at Vercel.

### Option B — VPS (Ubuntu + Nginx + PM2)

```bash
npm ci && npm run build
pm2 start ecosystem.config.cjs     # runs the site (port 3000) and the outbox worker
pm2 save && pm2 startup
```

Reverse-proxy Nginx to `http://127.0.0.1:3000` with HTTPS (Let's Encrypt). The worker calls the
cron endpoint every 30 s (`OUTBOX_INTERVAL_SECONDS`).

### After go-live

- Submit `https://www.nepalpoultryexpo.com/sitemap.xml` in Google Search Console.
- Old WordPress URLs (`/about-expo/`, `/exhibitors-information/`, `/gallery/` …) 308-redirect to the new pages.
- Send one test submission per form and check MongoDB, the sheet and both inboxes.

## 6. Editing content

| What | Where |
| --- | --- |
| Dates, venue, contacts, organisers, promoters, supporters, concurrent event | `src/config/site.ts` |
| Page copy (about, why Nepal, figures, sectors, visitor profile, benefits) | `src/data/content.ts` |
| Form dropdown options (booth sizes, interests, visitor categories) | `src/data/form-options.ts` |
| Country list | `src/data/countries.ts` |
| Logos | `public/logos/` |
| Brochure PDF (served only through signed links) | `private/brochure/nepal-poultry-expo-brochure.pdf` |
| E-mail templates | `src/lib/email/templates.ts` (`npm run email:preview` writes HTML previews to `.email-previews/`) |

### Gallery — automatic

Drop photos into a folder under `public/images/gallery/` (e.g. `public/images/gallery/2027-kathmandu/`).
`scripts/generate-image-manifest.mjs` runs before every `dev`/`build`, measures each image, creates blur
placeholders and adds it to the gallery — no code changes. Optional captions, folder labels and exclusions are
in `src/config/image-manifest.config.json`. Keep photos around 2000 px wide (JPEG ~80 %).

## 7. Quality checks

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm test            # 41 tests incl. MongoDB integration tests (in-memory replica set)
npm run build
```

## 8. Security notes

- Secrets live only in environment variables; nothing sensitive is sent to the browser.
- Raw IP addresses are never stored (salted hash only). Error logs are scrubbed of credentials.
- The old WordPress installation showed signs of compromise (unknown plugins, PHP in `uploads/`).
  Retire it and rotate any passwords used there before or at launch.

## 9. Project structure

```
src/app/                 routes, API route handlers, sitemap, robots, OG images
src/components/          layout, sections, forms, gallery, ui, motion, icons
src/config/site.ts       event facts and brand configuration
src/data/                copy, countries, form options, generated image manifest
src/lib/                 mongodb, queue (outbox), google-sheets, email, recaptcha, security, seo, validation
scripts/                 image manifest, outbox worker/admin, local MongoDB, WordPress asset migration
private/brochure/        brochure PDF (not public)
docs/                    implementation & testing report
tests/                   Vitest unit + integration tests
```
