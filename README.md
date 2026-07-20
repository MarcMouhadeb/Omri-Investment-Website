# Omri Investments Website

Navy/charcoal, card-based marketing site for omriinvestments.com, plus an
Education Materials store (login + Stripe checkout + gated downloads) built
with Supabase (accounts/database) and deployed on Vercel (static pages +
serverless functions) instead of GoDaddy — GoDaddy's shared hosting can only
serve static files, it can't run the backend code the store needs.

## Pages
- `index.html` — home (hero, stats, services overview, clients, about teaser)
- `services.html` — full service breakdown
- `insights.html` — published research (the REFJ derivatives article)
- `education.html` — **Education Materials**: the 6-course catalog, $29.99 each
- `login.html` / `signup.html` — account creation and login (Supabase Auth)
- `account.html` — "My Purchases" — lists what you've bought with download links
- `about.html` — bio built from your resume (GFI Capital, Bluerock Real Estate,
  Schonbraun McCann Group, Stillwater Capital, NYU / Baruch)
- `contact.html` — contact info + a form that opens the visitor's email client

## How the store works
- **Stripe** takes the payment (Checkout — a Stripe-hosted page, so you never
  handle card numbers directly).
- **Supabase** provides login/signup (Auth) and a `purchases` table (Postgres)
  recording who bought what, plus private Storage for the actual course files.
- Three small serverless functions in `api/` glue it together:
  - `create-checkout-session.js` — starts a Stripe Checkout session for a course
  - `stripe-webhook.js` — Stripe calls this after a successful payment; it's the
    *only* place a purchase gets written to the database (the browser can't
    write to `purchases` directly — see `supabase/schema.sql`)
  - `get-download-url.js` — checks the logged-in user actually bought the
    course, then hands back a short-lived signed download link to the real
    file in private Storage

Nobody can get a course file without both being logged in and having a
matching row in `purchases` — there's no plain public URL to the files at all.

## Setup — required before the store is live

This is a real (if fairly small) backend, so there are more moving parts than
a Gumroad button would've needed. Budget ~30-45 minutes, done once.

### 1. Create a Stripe account
stripe.com → Sign Up. Use **test mode** keys first (they start with `sk_test_`
/ `pk_test_`) to try the whole flow with fake card numbers before switching to
live keys. Dashboard → Developers → API keys → copy the **Secret key**
(`sk_test_...`). You don't need the publishable key for this setup — checkout
redirects via a server-generated URL, no Stripe.js in the browser.

*(You already sent me a test secret key in chat — I did not write it into any
file. It only ever belongs in Vercel's environment variables, step 5 below.
When you switch to live mode later, Stripe issues separate `sk_live_...` keys
— same steps, just swap the value.)*

### 2. Create a Supabase project
supabase.com → New Project (the free tier is plenty at this volume — no
bank/tax info needed, just an email signup). Once it's created:

- **Project Settings → API**: copy the **Project URL** and the **anon
  public** key. Paste both into `js/supabase-config.js` (replacing the two
  `REPLACE_WITH_...` placeholders) — this file is safe to be public, Supabase
  is designed so the anon key can be seen in browser source.
- Also copy the **service_role** key from the same page — this one is a real
  secret, it goes in Vercel's environment variables only (step 5), never in
  any file in this folder.
- **SQL Editor → New query**: paste in the entire contents of
  `supabase/schema.sql` and run it. This creates the `purchases` table and
  locks it down so only Stripe's webhook (via the service_role key) can ever
  write a purchase record.
- **Storage → New bucket**: create a bucket named exactly `course-files`, and
  make sure **Public bucket is OFF** (private) — this is what makes signed,
  time-limited download links the only way to get a file.
- **Authentication → Providers**: Email is on by default, that's all you need.
  Under **Authentication → URL Configuration**, once you know your Vercel URL
  (step 6), add it as a Site URL / Redirect URL so email confirmation links
  work.

### 3. Upload the course files to Supabase Storage
In the `course-files` bucket, create one folder per course and upload the
matching files (exact paths matter — they're hard-coded in `api/_products.js`):

| Folder | Files to upload |
|---|---|
| `intro/` | `Introduction-to-Real-Estate.pptx` |
| `fundamentals/` | `Real-Estate-Finance-Fundamentals.pptx`, `Real-Estate-Finance-Fundamentals-Workbook.xlsx` |
| `advanced/` | `Advanced-RE-Finance-Fundamentals.pptx`, `Advanced-RE-Finance-Workbook.xlsx` |
| `multifamily/` | `Multifamily-Underwriting.pptx`, `Multifamily-Adjustments-Worksheet.xlsx` |
| `office/` | `Office-Underwriting.pptx`, `Office-Adjustments-Worksheet.xlsx` |
| `retail-industrial/` | `Retail-Industrial-Underwriting.pptx`, `Retail-Industrial-Adjustments-Worksheet.xlsx` |

All these files are in `projects/Omri/Real Estate Courses/` in whichever
course subfolder matches the name.

### 4. Push this folder to a GitHub repo
Vercel deploys from a Git repo. If you don't already have one for this site,
create a new (private) GitHub repo and push the contents of this
`omri-investments-website/` folder to it.

### 5. Create the Vercel project
vercel.com → New Project → import that GitHub repo. Before the first deploy,
add these under **Environment Variables** (Project Settings → Environment
Variables) — names must match exactly:

| Name | Value |
|---|---|
| `STRIPE_SECRET_KEY` | your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | (leave blank for now — step 7 needs the URL first) |
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service_role key |
| `SITE_URL` | your Vercel URL, e.g. `https://omri-investments.vercel.app` (no trailing slash) |

Deploy. Vercel serves the HTML pages as static files and automatically turns
everything in `api/` into serverless functions — no extra config needed.

### 6. Point your domain at Vercel
Vercel → Project → Settings → Domains → add `omriinvestments.com`. Vercel
gives you DNS records to add at GoDaddy (usually an A record or CNAME) —
GoDaddy → DNS Management → update the records Vercel shows you. Once that
propagates, update `SITE_URL` in Vercel's env vars to `https://omriinvestments.com`
and redeploy.

### 7. Create the Stripe webhook (do this last)
Now that you have a real URL: Stripe dashboard → Developers → Webhooks → Add
endpoint → URL = `https://omriinvestments.com/api/stripe-webhook` (or your
Vercel URL if the domain isn't switched over yet) → select event
`checkout.session.completed` → Add endpoint. Stripe then shows a **Signing
secret** (`whsec_...`) — paste that into Vercel's `STRIPE_WEBHOOK_SECRET`
env var and redeploy.

### 8. Test it end-to-end
With Stripe still in test mode, go to `education.html`, sign up for an
account, buy a course using Stripe's test card `4242 4242 4242 4242` (any
future expiry, any CVC), and confirm it shows up on `account.html` with a
working download link. Once that works, switch Stripe to live mode (new API
keys, new webhook endpoint using the live key) and you're really live.

## Things to fix before you publish

1. **Photo** — `images/headshot.jpg` is now in place on the About and Home
   pages, square-cropped to head-and-shoulders.
2. **Client names** — Home page lists iintoo, Leumi Partners, AMS Acquisitions,
   York Real Estate, and Aminim Holdings as "Selected Clients" per your
   instruction. Worth a quick gut-check that each is fine being named
   publicly on a marketing site before this goes live — some family
   offices/clients prefer not to be listed.
3. **Contact info** — now using marc@omriinvestments.com and your cell from
   your resume. Make sure that mailbox actually exists (set it up via
   GoDaddy Email or forwarding) before this goes live — a mailto: link to
   an inbox that doesn't exist will just bounce.
4. **Contact form** — still uses a `mailto:` action. Now that the site has a
   real backend (Vercel + Supabase), a proper inbox-delivered form is easy to
   add if you want one — just say so.
5. **Favicon** — no square icon-only version of the Omri Investments logo
   was found (only full text lockups). If you want a browser-tab icon,
   send a square version or I can crop one from the logo mark.
6. **Nav polish (not done yet)** — the "Login" link always says "Login," even
   once you're actually logged in. Swapping it for "My Account" / "Log Out"
   when a session exists is a small follow-up, not built yet.
