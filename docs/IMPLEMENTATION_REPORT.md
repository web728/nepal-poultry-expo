# Nepal Poultry & Livestock International Expo 2027 — Implementation & Testing Report

Updated 24 November 2026 (v2 — matched to the official 2027 brochure).
Stack: Next.js 16.4.6 (App Router, Turbopack, Cache Components), React 19.3, TypeScript, Tailwind CSS 4.3,
Framer Motion 14, MongoDB driver 7, Nodemailer 10, Zod 4. Setup and deployment: see `README.md`.

## 1. Sources used
- **Official 2027 brochure** (`Nepal Poultry 2027 1-1.pdf`, Adobe Illustrator, 4 pages): dates, venue, copy, sectors,
  visitor profile, why-exhibit list, figures, organiser descriptions, contacts, promoter/supporter/concurrent-event logos,
  cover artwork and photographs. Typeface identified from the embedded fonts: **Poppins** (+ Bebas Neue for one numeral).
  The PDF itself is served as the gated brochure download.
- WordPress backup: 95 unique 2017-edition photos (one duplicate dropped), original logos. No database export was present.
- Live WordPress site: page structure and original copy (some lists kept on the About page).
- Expo banner photo (2017): previous edition 3–5 Nov 2017, Chitwan Expo Center, Bharatpur.

## 2. Design (v3 — international trade-show style)
- Modelled on the layouts of World Health Expo, India Energy Week, RE+, electronica India and GlassBuild America:
  full-bleed photographic hero, wide heavy headlines, a floating key-facts card, charcoal "market" band with large
  figures, large photo cards for "Why exhibit / Why visit", full-bleed closing call to action.
- Colours from the brochure: red `#E32B1B` and orange `#FF5E21` (used as the signature red→orange gradient), charcoal
  `#0E0E10` sections, warm off-white surfaces. Type: **Archivo** (semi-expanded ExtraBold, uppercase) for headlines,
  **Inter** for text. Pill buttons; thin gradient kicker rules instead of boxed labels.
- Inner pages share a dark photographic banner with breadcrumb and the gradient rule along its edge.
- Logo ("Nepal Poultry & Livestock International Expo") extracted from the brochure in colour and white versions;
  favicon from the rooster mark. Government of Nepal emblem, NFIA and Nepal Agritech logos extracted from the brochure.

## 3. Motion and scroll effects
- Scroll reveals, staggered card reveals, image unmask reveals and gentle parallax are **CSS scroll-driven animations**
  (zero JavaScript, no layout shift); they switch off for reduced-motion users and degrade to static content in browsers
  without support. Header gains a shadow on scroll (CSS). Category ticker (CSS marquee, pauses on hover).
- Framer Motion powers the interactive motion: mobile menu, brochure dialog, gallery lightbox, form confirmations —
  each loaded on demand so it never weighs on first load.

## 4. Pages
`/`, `/about`, `/about/organizers`, `/exhibitors`, `/visitors`, `/media`, `/register/exhibitor`, `/register/visitor`,
`/contact`, `/brochure`, `/privacy-policy`, 404. Old WordPress URLs redirect in a single 308 hop.

## 5. Forms and backend
Exhibitor, visitor, contact and brochure forms (fields exactly as specified), searchable country combobox (ISO 3166-1 +
Kosovo, aliases), reCAPTCHA v2 checkbox verified server-side, honeypot, minimum fill time, MongoDB rate limit,
idempotency + content de-duplication, MongoDB transaction (submission + 4 outbox jobs), delivery to Google Sheets
("Website Enquiries"), two admin e-mails and a visitor confirmation, retries with backoff, dead-letter + requeue,
cron endpoint + PM2 worker. Brochure download only via a signed 7-day link issued after an accepted request.

## 6. SEO
Unique titles/descriptions, canonicals, Open Graph + Twitter cards with per-page branded images, sitemap, robots,
JSON-LD: Organization (with both contact points), WebSite, BreadcrumbList on every inner page and **ExhibitionEvent**
(18–20 Feb 2027, Bhrikuti Mandap, organisers, promoter). One H1 per page, no heading skips, alt text on every image.

## 7. Testing performed (all passing on 24 Nov 2026)
- `npm run lint` 0 problems · `npm run typecheck` 0 errors · `npm run build` success (all pages + OG images static).
- `npm test` — 41 tests incl. 9 MongoDB integration tests (atomic insert, idempotency, concurrent double-submit,
  race-free delivery, retry/backoff, waiting on missing credentials, dead-letter + requeue, lease reclaim).
- End-to-end against the production build with a local MongoDB and Google's reCAPTCHA test keys: all four forms
  accepted (150–500 ms), invalid data/consent/token/honeypot/too-fast rejected, rate limit 429, cron 401 without auth,
  **real brochure PDF delivered via signed link (7.4 MB), direct URL 404**, forged/expired tokens 403.
- Smoke test: every route 200, all internal links resolve; no horizontal overflow at 375 px; no hydration errors.
- **Lighthouse 13 (production build, local):**

  | Page | Perf. mobile | Accessibility | Best practices | SEO |
  | --- | --- | --- | --- | --- |
  | Home (v3 redesign) | 88 | 100 | 100 | 100 |
  | About | 96 | 100 | 100 | 100 |
  | Exhibitors | 94 | 100 | 100 | 100 |
  | Visitors | 97 | 100 | 100 | 100 |
  | Contact | 93 | 100 | 100 | 100 |

  Home was re-measured after the v3 redesign (CLS 0); the inner-page rows are from v2, before the new banner.

## 8. Not verified / please confirm
1. **Live credentials** (Atlas, Gmail, Google Sheets, production reCAPTCHA keys) — integrations are tested with spies and a
   local database only; jobs wait as "not configured" until credentials are set.
2. **Goat (15.95M) and cattle (5.14M) figures** are shown as "published in the official 2027 expo brochure"; I could not find
   their primary source (probably the National Sample Census of Agriculture 2021/22). Farms (22,928) and poultry meat
   sales (NPR 60.96B) are verified against the NSO Commercial Poultry Survey 2081/82.
3. **Privacy policy and brochure consent wording** describe what the site does but have not had legal review.
4. **Country list**: the brief referred to a list that was not attached; ISO 3166-1 + Kosovo is used.
5. **Nepal Poultry Federation** was a co-organiser on the 2017 banner; per the brief and the 2027 brochure it is shown as
   "Supported by".
6. The old WordPress install looks compromised — retire it and rotate its credentials.
