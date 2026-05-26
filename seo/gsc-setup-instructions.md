# Google Search Console Setup Instructions for Bloomport
**Platform:** bloomport.fun  
**Purpose:** Step-by-step GSC verification, sitemap submission, API setup, and weekly monitoring guide

---

## Overview

Google Search Console (GSC) is a free tool that lets you monitor how Google sees your site — what keywords you rank for, which pages get clicks, and where you have technical issues. This document covers everything needed to get Bloomport fully set up and actively monitored.

**Estimated setup time:** 30–60 minutes for full configuration

---

## Part 1: Verify bloomport.fun in Google Search Console

### Step 1: Access Google Search Console

1. Go to [https://search.google.com/search-console](https://search.google.com/search-console)
2. Sign in with the Google account you want to use as the primary GSC owner (recommended: use a Google account tied to a business email, not a personal Gmail)
3. Click **"Start now"** if this is your first time, or **"Add property"** if you already have other properties

### Step 2: Add bloomport.fun as a Property

1. In the property selector dropdown (top-left), click **"Add property"**
2. You'll see two options:
   - **Domain** (recommended): Covers all subdomains and protocols (http/https, www/non-www)
   - **URL prefix**: Only covers the exact URL entered
3. Select **Domain** and enter: `bloomport.fun`
4. Click **Continue**

### Step 3: Verify Ownership via DNS

The Domain method requires DNS verification. Here's how:

1. GSC will provide a TXT record that looks like: `google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
2. Log in to your DNS provider (the registrar where bloomport.fun is registered — e.g., Namecheap, GoDaddy, Cloudflare, Google Domains)
3. Navigate to DNS settings for bloomport.fun
4. Add a new **TXT record**:
   - **Type:** TXT
   - **Host/Name:** @ (or leave blank, depending on provider)
   - **Value:** Paste the full google-site-verification string from GSC
   - **TTL:** 3600 (or default)
5. Save the record
6. Return to GSC and click **"Verify"**

**Note:** DNS propagation can take up to 48 hours, but usually completes in under 30 minutes. If verification fails, wait 15 minutes and try again.

### Step 4: Confirm Verification

Once verified, you'll see: "Ownership verified" and bloomport.fun will appear in your GSC property list.

**Pro tip:** Add multiple owners as "Full users" under Settings > Users and permissions. Add at least one backup owner.

---

## Part 2: Submit sitemap.xml

### Step 1: Confirm Your Sitemap Exists

Bloomport's sitemap should be accessible at: `https://bloomport.fun/sitemap.xml`

Open that URL in a browser and confirm it returns valid XML. If the sitemap doesn't exist yet, generate one. For a Vite/React SPA, use one of these approaches:

**Option A: Static sitemap (manual)**
Create `/public/sitemap.xml` with all your routes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bloomport.fun/</loc>
    <lastmod>2026-05-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://bloomport.fun/app</loc>
    <lastmod>2026-05-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://bloomport.fun/blog</loc>
    <lastmod>2026-05-26</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Add each blog post URL here as published -->
</urlset>
```

**Option B: Vite plugin (automated)**
Install `vite-plugin-sitemap` and configure it in `vite.config.ts` to auto-generate a sitemap on build.

### Step 2: Submit Sitemap in GSC

1. In GSC, select the `bloomport.fun` property
2. In the left sidebar, click **"Sitemaps"** (under Indexing)
3. In the "Add a new sitemap" field, enter: `sitemap.xml`
4. Click **"Submit"**
5. The status should change to "Success" within a few minutes

**If you have multiple sitemaps** (e.g., one for pages, one for blog posts):
- Submit each separately: `sitemap-pages.xml`, `sitemap-blog.xml`
- Or create a sitemap index file that references all of them

### Step 3: Check Indexing Status

After submitting, click on the sitemap to see:
- **Discovered URLs:** How many pages Google found
- **Indexed URLs:** How many are currently in the index

If Discovered > Indexed, some pages may have issues preventing indexing (covered in Part 5).

---

## Part 3: Set Up the Google Search Console API

The GSC API lets you pull ranking data programmatically — useful for tracking keywords, automating reports, or building a custom dashboard.

### Step 1: Create a Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown (top of page) → **"New Project"**
3. Enter project name: `Bloomport SEO Dashboard`
4. Select your billing account (API usage is free within GSC quotas)
5. Click **"Create"**
6. Wait for the project to be created, then select it

### Step 2: Enable the Search Console API

1. In Google Cloud Console, navigate to **"APIs & Services" → "Library"**
2. Search for: `Google Search Console API`
3. Click on it → Click **"Enable"**
4. Also enable the **Google Analytics Data API** if you plan to pull GA4 data alongside GSC data

### Step 3: Create OAuth 2.0 Credentials

1. In Cloud Console, go to **"APIs & Services" → "Credentials"**
2. Click **"+ Create Credentials" → "OAuth client ID"**
3. If prompted, configure the OAuth consent screen first:
   - App name: `Bloomport SEO Dashboard`
   - User support email: your email
   - Authorized domains: `bloomport.fun`
   - Scopes: Add `https://www.googleapis.com/auth/webmasters.readonly`
   - Save and continue
4. Back in Credentials, select:
   - Application type: **Web application**
   - Name: `Bloomport GSC Client`
   - Authorized redirect URIs: `http://localhost:3000/oauth/callback` (for development)
   - Add production URI: `https://bloomport.fun/oauth/callback` (when ready)
5. Click **"Create"**
6. A dialog will show your `Client ID` and `Client Secret` — **download the JSON file immediately**

### Step 4: Store Credentials as Environment Variables

Add the following to your `.env` file (never commit to git — ensure `.env` is in `.gitignore`):

```env
# Google Search Console API
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GSC_SITE_URL=https://bloomport.fun/

# Optional: Pre-authorized refresh token (obtained via OAuth flow)
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

For Vercel deployment, add these as Environment Variables in the Vercel project settings under Settings → Environment Variables.

### Step 5: Authenticate and Get a Refresh Token

To use the API server-side without requiring manual login each time:

1. Run the OAuth flow once (you can use the `google-auth-library` Node.js package)
2. Authorize the app with your GSC-owning Google account
3. Capture the `refresh_token` from the response (it's returned once on first authorization)
4. Store it as `GOOGLE_REFRESH_TOKEN` in your environment variables

**Example using googleapis Node.js library:**
```javascript
const { google } = require('googleapis');
const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://bloomport.fun/oauth/callback'
);

// Use auth.generateAuthUrl() to get the auth URL
// Use auth.getToken(code) to exchange the code for tokens
// Save the refresh_token securely
```

### Step 6: Make Your First API Call

Test the connection by querying your top keywords:

```javascript
const webmasters = google.webmasters({ version: 'v3', auth });

const response = await webmasters.searchanalytics.query({
  siteUrl: 'https://bloomport.fun/',
  requestBody: {
    startDate: '2026-05-01',
    endDate: '2026-05-26',
    dimensions: ['query'],
    rowLimit: 25,
  },
});

console.log(response.data.rows);
// Returns: [{ keys: ['keyword'], clicks: N, impressions: N, ctr: N, position: N }]
```

---

## Part 4: Weekly Monitoring Checklist

Once GSC is set up, check these metrics every Monday morning (takes ~15 minutes):

### Core Metrics to Track Weekly

| Metric | Where to Find | What to Look For |
|---|---|---|
| Total Clicks | Performance → Search results | Week-over-week growth trend |
| Total Impressions | Performance → Search results | Rising impressions before clicks = rankings building |
| Average CTR | Performance → Search results | Below 3%? Rewrite meta titles/descriptions |
| Average Position | Performance → Search results | Any keyword moving from 11-20 to top 10? |
| Indexed Pages | Indexing → Pages | Ensure new articles get indexed within 2-3 weeks |
| Coverage Errors | Indexing → Pages → Error tab | Fix immediately — these block ranking |
| Core Web Vitals | Experience → Core Web Vitals | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| Mobile Usability | Experience → Mobile Usability | Any new errors block mobile rankings |

### Weekly Workflow

**Monday (15 min):**
1. Open GSC → Performance → Last 28 days (compare to previous 28 days)
2. Sort "Queries" by Impressions DESC — note any new keywords appearing
3. Sort "Pages" by Clicks DESC — see which articles are your traffic drivers
4. Check Indexing → Pages → Not indexed: any recent articles stuck?
5. Check Coverage errors tab — fix any 404s or server errors

**Monthly (30 min):**
1. Export top 50 queries to a spreadsheet — track position trends
2. Identify keywords ranking 8-20 (positions just outside top 5) — these are targets for content updates
3. Check which pages have CTR < 2% — update their meta titles/descriptions
4. Verify all new articles published that month are indexed

---

## Part 5: First 30 Days — Quick Wins to Look For

Within the first 30 days of having GSC active, focus on these high-ROI actions:

### 1. Force Indexing of Key Pages
- Go to URL Inspection (search bar at top of GSC)
- Enter your most important pages (/, /app, first 5 blog posts)
- Click "Request Indexing" for each
- This pushes Google to crawl them within hours vs. days

### 2. Find "Impressions but Zero Clicks" Pages
- In Performance, filter by pages with > 100 impressions and 0 clicks
- These pages rank but have poor meta titles — rewrite them immediately
- A CTR improvement from 0% to 3% on a 1,000-impression page = 30 free clicks/week

### 3. Identify "Almost Top 10" Keywords
- Filter queries by average position 10–20
- These keywords are close to page 1 — a content update or 2-3 backlinks can push them over
- This is often the fastest way to increase organic traffic

### 4. Check for Soft 404s
- In Indexing → Pages → "Not indexed" → "Soft 404"
- These pages returned a 200 status but look like error pages to Google
- Fix by ensuring all routes render meaningful content

### 5. Monitor Crawl Budget
- In Settings → Crawl Stats (available for larger sites)
- For now, ensure no pages are being blocked in robots.txt unintentionally
- Check that `https://bloomport.fun/sitemap.xml` is listed in robots.txt:
  ```
  Sitemap: https://bloomport.fun/sitemap.xml
  ```

### 6. First Ranking Keyword Alert Setup
- In GSC, go to Search results → set up email alerts for significant drops
- External tool: Set up a free Keyword.io or Mangools alert for your top 5 keywords
- Celebrate your first page-1 ranking — usually occurs in weeks 3-6 for very low difficulty keywords

---

## Useful GSC Resources

- GSC Help Center: https://support.google.com/webmasters
- GSC API Reference: https://developers.google.com/webmaster-tools/v1/api_reference_index
- Search Console Insights (simpler view): https://search.google.com/search-console/insights
- Rich Results Test: https://search.google.com/test/rich-results (test your JSON-LD schema)
- Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
