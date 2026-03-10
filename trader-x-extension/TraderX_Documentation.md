# 📊 TraderX Pro — Complete Feature & Algorithm Documentation

> **Version:** 2.0.0 | **Manifest:** v3 | **Platform:** Chrome Extension on X.com / Twitter.com  
> **Author:** Bhrigu Verma  
> **Last documented:** March 2026

---

## 📌 Table of Contents

1. [Extension Overview](#1-extension-overview)
2. [Architecture & File Map](#2-architecture--file-map)
3. [Module-by-Module Feature Breakdown](#3-module-by-module-feature-breakdown)
   - [3.1 Background Service Worker](#31-background-service-worker-backgroundjs)
   - [3.2 Analysis Engine — FinBERT + Weighting](#32-analysis-engine-contentanalysisenginejs)
   - [3.3 Price Fetcher](#33-price-fetcher-contentpricefetcherjs)
   - [3.4 Twitter/Tweet Fetcher](#34-twitter-fetcher-contenttwitterfetcherjs)
   - [3.5 Tweet Processor — Trusted Mode](#35-tweet-processor-contenttweetprocessorjs)
   - [3.6 Content Script — Main Orchestrator](#36-content-script-contentcontentjs)
   - [3.7 Tracker Dashboard — Market Pulse](#37-tracker-dashboard-contenttrackerdasboardjs)
   - [3.8 Advanced Search](#38-advanced-search-contentadvancedsearchjs)
   - [3.9 Account Directory — Signal Registry](#39-account-directory-contentaccountdirectoryjs)
   - [3.10 Sidebar — Main UI Panel](#310-sidebar-contentsidebarjs)
   - [3.11 Utils — Constants, Helpers, Storage](#311-utils-layer)
4. [Algorithms & Key Technical Concepts](#4-algorithms--key-technical-concepts)
   - [4.1 Sentiment Analysis (Dual-Path)](#41-sentiment-analysis-dual-path)
   - [4.2 Influencer Weighting System](#42-influencer-weighting-system)
   - [4.3 Volume Spike Detection](#43-volume-spike-detection)
   - [4.4 Multi-Strategy Tweet Fetching](#44-multi-strategy-tweet-fetching)
   - [4.5 Spam Detection Pipeline](#45-spam-detection-pipeline)
   - [4.6 Ticker Extraction (3-Pass)](#46-ticker-extraction-3-pass)
   - [4.7 CORS Bypass via Background Worker](#47-cors-bypass-via-background-worker)
   - [4.8 Auto-Scroll Loader](#48-auto-scroll-loader)
   - [4.9 MutationObserver — Live Feed Processing](#49-mutationobserver--live-feed-processing)
   - [4.10 Quality & Trust Scoring](#410-quality--trust-scoring)
5. [Accounts Registry — accounts.json](#5-accounts-registry--accountsjson)
6. [Data Flows](#6-data-flows)
7. [Settings System](#7-settings-system)
8. [Export Features](#8-export-features)
9. [UI Components Summary](#9-ui-components-summary)
10. [Known Limitations & Future Work](#10-known-limitations--future-work)

---

## 1. Extension Overview

**TraderX Pro** is a Chrome Extension that injects directly into X.com (Twitter) and transforms it into a professional trading intelligence terminal. It adds:

- Real-time **sentiment analysis** on crypto and stock tweets
- **Live price overlays** from CoinGecko (crypto) and Yahoo Finance (stocks)
- **Trusted influencer weighting** using a curated database of ~988 financial accounts
- **Advanced search** with auto-scroll to gather 100–500+ posts per ticker
- A floating **Market Pulse Dashboard** tracking multiple tickers simultaneously
- **Tweet filtering** (spam removal, trusted-only mode, keyword alerts)
- **Data export** (JSON / CSV / AI analysis prompts)
- A browseable **Signal Directory** to discover and follow quality accounts

---

## 2. Architecture & File Map

```
trader-x-extension/
├── manifest.json                        # Chrome Manifest v3
├── background.js                        # Service Worker — API bridge & alerts
├── accounts.json                        # 988-account curated registry
├── popup.html / popup.js                # Extension popup UI
├── alerts.html                          # Alerts page
├── suggested.js                         # Suggested handles list
├── utils.js                             # Global utility exports
│
├── content/
│   ├── content.js                       ★ Main orchestrator (entry point)
│   ├── analysisEngine.js                ★ FinBERT + keyword sentiment engine
│   ├── priceFetcher.js                  ★ CoinGecko + Yahoo Finance prices
│   ├── twitterFetcher.js                ★ Multi-strategy tweet collector
│   ├── tweetProcessor.js               ★ Trusted mode + badge injection
│   ├── trackerDashboard.js             ★ Market Pulse floating dashboard
│   ├── advancedsearch.js               ★ Advanced search UI + auto-scroll
│   ├── accountDirectory.js             ★ Signal Directory browser
│   ├── sidebar.js                       ★ Main slide-in panel
│   ├── dom-selectors.js                 DOM selector constants
│   └── content.css                      Injected styles
│
├── utils/
│   ├── constants.js                     App constants, default settings
│   ├── helpers.js                       Utility functions (debounce, throttle…)
│   ├── storage.js                       Chrome storage wrapper
│   └── logger.js                        Debug logger
│
└── settings/
    ├── settings.html / settings.js      Options page
    ├── all-settings.js                  Settings aggregator
    └── settings.css
```

### Script Load Order (via manifest.json content_scripts)

```
suggested.js → utils.js → priceFetcher.js → analysisEngine.js
→ twitterFetcher.js → trackerDashboard.js → tweetProcessor.js
→ accountDirectory.js → advancedsearch.js → sidebar.js → content.js
```

All scripts run at `document_end`, giving them access to the full DOM.

---

## 3. Module-by-Module Feature Breakdown

### 3.1 Background Service Worker (`background.js`)

**Purpose:** Acts as a trusted intermediary layer that bypasses CORS restrictions.

| Feature | Detail |
|---|---|
| Stock price fetch | Yahoo Finance v8 Chart API (`query1.finance.yahoo.com`) — 5-day range for accurate previous close |
| Crypto price fetch | CoinGecko Simple Price API — USD price + 24h change + volume |
| Batch quote fetch | Parallel `Promise.all()` across multiple tickers |
| Alert notifications | `chrome.notifications.create()` — shows OS-level notifications |
| Alert history | Stored in `chrome.storage.local`, capped at 500 entries |
| Settings open | `chrome.runtime.openOptionsPage()` |

**Message types handled:**

| Message Type | Handler |
|---|---|
| `FETCH_STOCK_PRICE` | Yahoo Finance single ticker |
| `FETCH_CRYPTO_PRICE` | CoinGecko single coin |
| `fetchQuotes` | Batch stock price fetch |
| `triggerAlert` | Store alert + push notification |
| `getAlertHistory` | Return saved alerts |
| `clearAlertHistory` | Wipe alert history |
| `openSettings` | Open options page |

---

### 3.2 Analysis Engine (`content/analysisEngine.js`)

**Class:** `EnhancedAnalysisEngine` (singleton at `window.TraderXAnalysisEngine`)  
**Version:** v3.0

This is the core intelligence module. It does weighted sentiment scoring on tweet batches.

#### Features

| Feature | Implementation |
|---|---|
| ML sentiment (primary) | FinBERT via Transformers.js (`Xenova/distilbert-base-uncased-finetuned-sst-2-english`) |
| Keyword fallback | Custom weighted keyword dictionary |
| Influencer weighting | Tier-based multipliers (1.0x – 3.0x) |
| Volume spike detection | Rolling 24-hour window comparison |
| Volatility detection | Standard deviation of per-tweet scores |
| Sentiment status | 5-level: VERY BULLISH / BULLISH / NEUTRAL / BEARISH / VERY BEARISH |
| Volatile override | If stdDev > 0.35 or volume spike → status = VOLATILE |

#### Tier Weights

```
Tier 1 (Central Banks, Regulatory): 3.0x multiplier
Tier 2 (Institutional, Media, Value): 2.0x multiplier  
Tier 3 (Trading/TA, Crypto, Forex): 1.5x multiplier
Default (everyone else):            1.0x multiplier
```

#### Keyword Libraries

**Bullish keywords** (40+ with weights): `moon` (0.8), `breakout` (0.7), `bullish` (0.6), `rally` (0.6), `ath` (0.8), `parabolic` (0.9), `golden cross` (0.7), `buy` (0.3), `accumulate` (0.4), `hodl` (0.4), etc.

**Bearish keywords** (35+ with weights): `crash` (0.8), `bearish` (0.6), `plunge` (0.8), `collapse` (0.9), `death cross` (0.7), `sell` (0.3), `breakdown` (0.5), `liquidated` (0.7), etc.

**Volatility keywords**: `volatile`, `choppy`, `whipsaw`, `gamma squeeze`, `short squeeze`, etc.

---

### 3.3 Price Fetcher (`content/priceFetcher.js`)

**Class:** `PriceFetcher` (singleton at `window.TraderXPriceFetcher`)

#### Features

| Feature | Detail |
|---|---|
| Crypto prices | CoinGecko Simple Price API (41 mapped crypto IDs) |
| Stock prices | Yahoo Finance v8 Chart API (75+ major tickers pre-mapped) |
| Smart routing | Checks `cryptoIds` first, then `stockTickers`, then tries both |
| Cache layer | 30-second TTL in-memory Map to avoid API hammering |
| Batch fetch | `getPrices([])` splits crypto/stocks and batches CoinGecko requests |
| Price formatting | Adaptive: $0.000001 for micro-caps, $1.23 for mid, $1,234 for BTC |
| Change coloring | #10B981 (green) for positive, #EF4444 (red) for negative |

**Supported Crypto Tickers (41):** BTC, ETH, DOGE, SOL, XRP, ADA, AVAX, DOT, MATIC, LINK, ATOM, LTC, UNI, SHIB, PEPE, ARB, OP, APT, NEAR, FTM, INJ, SUI, SEI, TIA, JUP, WIF, BONK, RENDER, FET, TAO, GRT, IMX, STX, MINA, AAVE, MKR, CRV, SNX, LDO, RPL, ENS, BLUR, SAND, MANA, AXS, APE

**Supported Stock Tickers (75+):** All major S&P 500 components including AAPL, MSFT, NVDA, TSLA, META, AMZN, GOOGL + ETFs (SPY, QQQ, IWM) + meme stocks (GME, PLTR) + crypto-adjacent (COIN, MSTR, HOOD)

---

### 3.4 Twitter Fetcher (`content/twitterFetcher.js`)

**Class:** `TwitterFetcher` (singleton at `window.TraderXFetcher`)  
**Version:** v3.0

Employs a **4-strategy cascade** to collect tweets for any ticker:

| Strategy | Method | Trigger |
|---|---|---|
| 1 (Primary) | DOM scan — `article[data-testid="tweet"]` | Always |
| 2 (Search page) | Grab all visible tweets on `/search` page | If on `/search` |
| 3 (API attempt) | Fetch Twitter search HTML, extract `full_text` JSON | If < 20 tweets |
| 4 (Fallback) | Procedural generation from realistic templates | If < 10 tweets |

#### Cache behavior

- **TTL:** 25 seconds per ticker
- **Rate limit:** 2-second minimum between re-fetches
- **Max tweets:** 50 per ticker (sliced before cache)

#### Strategy 4 — Template Generation

Generates 20 tweets from sentiment-typed templates (bullish/bearish/neutral) with random emoji/punctuation variations and shuffled output — used only as last resort to demonstrate UI functionality.

---

### 3.5 Tweet Processor (`content/tweetProcessor.js`)

**Class:** `TweetProcessor` (singleton at `window.TraderXTweetProcessor`)

#### Features

| Feature | Detail |
|---|---|
| Trusted Mode | Toggle: hide all tweets not from `accounts.json` |
| Badge injection | Shows blue checkmark `✓ Trusted` badge on approved author names |
| MutationObserver | Re-processes timeline as new tweets load |
| WeakSet dedup | Prevents re-processing already-seen DOM nodes |
| Search page guard | Trusted Mode skips filtering on `/search` pages (avoids breaking Advanced Search) |
| Periodic re-check | `setInterval(() => processTimeline(), 2000)` catches edge cases |

---

### 3.6 Content Script (`content/content.js`)

**This is the main orchestrator.** It wires all modules together and does per-tweet annotation.

#### Responsibilities

| Task | Implementation |
|---|---|
| Tweet processing loop | `processTweet()` called via MutationObserver + initial scan |
| Ticker extraction | 3-pass: $TICKER → crypto names → common tickers |
| Sentiment detection | Regex-based bullish/bearish count → label |
| Spam detection | 7-rule filter pipeline (see §4.5) |
| Ticker tag injection | Colored pill tags injected above tweet text |
| Tier border highlighting | Left border color by influencer tier |
| Watchlist highlighting | Yellow background for watchlist tickers |
| Keyword alerts | Rule-based alert triggering → background notification |
| Search filtering | Show/hide tweets by ticker match |

---

### 3.7 Tracker Dashboard (`content/trackerDashboard.js`)

**Class:** `TrackerDashboard` (singleton at `window.TraderXTrackerDashboard`)

The floating **Market Pulse** panel — pinned to the top-left.

#### Features

| Feature | Detail |
|---|---|
| Multi-ticker tracking | Default: BTC, ETH, TSLA, NVDA (persisted to localStorage) |
| Real-time updates | 30-second auto-refresh interval |
| Sentiment bar | Animated fill bar showing bullish/bearish direction |
| Price overlay | Live price + 24h % change per card |
| Volatility badge | BULLISH / BEARISH / VOLATILE / NEUTRAL / SYNCING |
| Volume spike indicator | CSS class `volume-spike` applied to card |
| Influencer count | Shows `N 👤` when influencer tweets detected |
| Draggable | Mouse drag on header, bounded by viewport |
| Minimize | Collapses to 64px header |
| Manage Tickers | Inline dialog to add/remove tickers |
| Click-through | Click card → opens modal with analyzed tweets |
| Tweets Modal | Filterable list with per-tweet sentiment badge + influencer badges |
| Dark glassmorphism UI | Design tokens: Graphite (#141820), Emerald (#00A36C), Brass (#C9A66B) |

---

## 3.8 Advanced Search (`content/advancedsearch.js`)

**Class:** `TraderXAdvancedSearch` (singleton at `window.TraderXAdvancedSearch`)  
**Version:** v2.0

#### Features

| Feature | Detail |
|---|---|
| Query builder | Assembles Twitter search operators: `"$TICKER" lang:en min_faves:1 -filter:replies -filter:retweets since:YYYY-MM-DD -pump -airdrop -giveaway -scam` |
| Trusted-only mode | Optionally appends `(from:CNBC OR from:Reuters OR ...)` — capped at 10 to avoid query limit |
| Auto-scroll | Scrolls page automatically to load up to 500 tweets in batches |
| Loading indicator | Fixed top-right banner with tweet count + % progress |
| Completion banner | Green banner with Copy/Export buttons on finish |
| Stuck detection | If scroll height stops changing for 8 ticks → stop |
| Timeout | Hard 3-minute timeout |
| Tweet post-processing | Scans all loaded tweets: marks trusted accounts, extracts tickers |
| Copy for AI | Copies structured LLM prompt (with all tweet data) to clipboard |
| CSV export | Downloads `TICKER_tweets_DATE.csv` with author, text, engagement |

#### Search UI Modal

A premium modal overlay with:
- Ticker input field
- Date range picker (days back)
- Trusted-only toggle
- Min faves slider  
- Verified-only toggle
- Execute + Close buttons

---

### 3.9 Account Directory (`content/accountDirectory.js`)

**Class:** `AccountDirectory` (singleton at `window.TraderXDirectory`)

A browseable modal UI for discovering curated financial accounts.

#### Features

| Feature | Detail |
|---|---|
| Category sidebar | 13 categories from `accounts.json` |
| Account grid | Card per account: avatar initials, handle, "Follow" button |
| Follow button | Opens `x.com/intent/follow?screen_name=HANDLE` in new tab |
| "Follow Top 10" | Staggered window.open() calls (800ms delay between each) |
| Search capability | Browse by category |
| Count badges | Shows how many accounts per category |

**Categories:** Macro & Central Banks | Institutional Asset Management | Regulatory & Government | Media & News | Wealth & Value Investing | Trading & Technical Analysis | Real Estate & Housing | Geopolitics & OSINT | Crypto & DeFi | Forex | Commodities | Corporate IR | Venture Capital

---

### 3.10 Sidebar (`content/sidebar.js`)

**Class:** `TraderXSidebar` (singleton at `window.TraderXSidebar`)  
**Design:** Deep Sea Blue + Graphite premium fintech theme

#### Features

| Feature | Detail |
|---|---|
| Slide-in panel | 480px wide, animated from right with cubic-bezier easing |
| "MARKET PULSE" FAB | Fixed top-right floating action button to open/close sidebar |
| Trusted Mode toggle | Smooth animated toggle → updates TweetProcessor |
| Tool buttons | Advanced Search, Signal Directory, Market Pulse Dashboard |
| AI Sentiment prompt | Extracts top tweets by engagement, builds 10-section LLM prompt |
| JSON export | Copies all page tweets as structured JSON to clipboard |
| CSV export | Downloads tweets as `.csv` file |
| Toast notifications | Slide-in toasts for action feedback (3-second auto-dismiss) |
| Close animation | 90° rotate on hover for close button |

---

### 3.11 Utils Layer

| File | Contents |
|---|---|
| `utils/constants.js` | `DEFAULT_SETTINGS`, `QUALITY_WEIGHTS`, `TRUST_WEIGHTS`, `PATTERNS`, `SMART_MODES` (Focus/Network/Industry/Quality/Custom), `FILTER_REASONS`, `STORAGE_KEYS` |
| `utils/helpers.js` | `debounce`, `throttle`, `normalizeText`, `extractText`, `safeQuerySelector`, `includesKeyword`, `clamp`, `formatRelativeDate`, `parseLinkedInTimestamp`, `sanitizeText`, `toTitleCase`, `generateId` |
| `utils/storage.js` | Chrome storage `get`/`set` wrappers with error handling |
| `utils/logger.js` | Console logger with log level support |

---

## 4. Algorithms & Key Technical Concepts

### 4.1 Sentiment Analysis (Dual-Path)

```
Tweet Text
    │
    ▼
[FinBERT available?] ──YES──► ML Inference (Transformers.js)
    │                          ├─ Positive label → +score (0 to 1)
    │                          └─ Negative label → -score (-1 to 0)
    │
    NO
    │
    ▼
Keyword Analysis
├─ Scan bullishKeywords (40+ words with weights)
├─ Scan bearishKeywords (35+ words with weights)
├─ Scan volatilityKeywords (10+ words)
├─ rawScore = (bullishScore - bearishScore) / totalWeight
└─ Clamp to [-1, 1]

        ▼ (for each tweet)
Apply Influencer Weight
    weighted_score = raw_score × tier_weight

        ▼ (aggregate over all tweets)
weightedAverage = Σ(score × weight) / Σ(weight)
stdDev = sqrt(variance of scores)

        ▼
Status Assignment:
  stdDev > 0.35 || volumeSpike  → VOLATILE
  avg > 0.30                     → VERY BULLISH  
  avg > 0.15                     → BULLISH
  avg < -0.30                    → VERY BEARISH
  avg < -0.15                    → BEARISH
  otherwise                      → NEUTRAL
```

### 4.2 Influencer Weighting System

Accounts from `accounts.json` are classified into 3 tiers based on category:

| Tier | Categories | Weight |
|---|---|---|
| Tier 1 | Macro_CentralBanks, Regulatory_Government | **3.0×** |
| Tier 2 | Institutional_AssetMgmt, Media_News, Wealth_ValueInvesting | **2.0×** |
| Tier 3 | Trading_TA, Crypto_DeFi, Forex, Commodities | **1.5×** |
| Default | Everyone else | **1.0×** |

Handles are normalized: lowercased, `@` stripped, stored in a `Map<handle, tier>`.

The weighted average formula ensures that a single Tweet from a central bank account outweighs 3 regular user tweets in the sentiment aggregate.

### 4.3 Volume Spike Detection

```javascript
// Recorded per-ticker: [{count, timestamp}] in 24h rolling window
checkVolumeSpike(ticker, currentCount):
  history = last 24h data points
  avg = mean(history.counts)
  return currentCount > avg * 2  // 2× average = spike
```

Volume history is persisted to `localStorage` so spikes are detected across page refreshes.

### 4.4 Multi-Strategy Tweet Fetching

```
fetchTickerTweets(ticker)
    │
    ├── [1] DOM Scan: query all article[data-testid="tweet"]
    │         → filter by "$TICKER" cashtag or word boundary match
    │
    ├── [2] Search page scan: if on /search, grab all visible tweets
    │         → dedup by text equality
    │
    ├── [3] Twitter search fetch: if < 20 tweets so far
    │         → GET https://x.com/search?q=$TICKER...&f=live
    │         → regex parse "full_text":"..." from HTML response
    │         → dedup + add if ticker mentioned
    │
    └── [4] Template generation: if < 10 tweets total
              → 20 templated tweets (bullish/bearish/neutral)
              → shuffled randomly
    
    → Slice to 50 → Cache (25s TTL) → Return
```

### 4.5 Spam Detection Pipeline

7 rules applied in order (each can independently mark a tweet as spam):

| Rule | Regex / Condition | Reason Label |
|---|---|---|
| 1. Engagement bait | `RT if|like if|agree\?|thoughts\?|tag someone|comment below` | `Engagement bait` |
| 2. Promotional | `discord.gg|t.me/|telegram|buy my course|premium signals|airdrop|link in bio` | `Promotional` |
| 3. Low effort | > 7 emojis OR text < 15 chars with no ticker | `Emoji spam` / `Too short` |
| 4. Crypto scams | `send eth/btc|double your|guaranteed returns|0x[hex]{40}|verify wallet` | `Crypto scam` |
| 5. Disclaimers | `not financial advice|NFA|DYOR|not a recommendation` | `Disclaimer` |
| 6. Threads (market hours) | `🧵|thread:|1/N|part 1 of` (only during market hours) | `Thread` |
| 7. Old news | `yesterday|last week|last month|days ago` | `Old news` |

**Exemptions from spam detection:**
- Official accounts (`isOfficialAccount()`)
- Accounts in `suggested.js`
- Tiered accounts (Tier 1–3)
- Tweets mentioning a watchlist ticker

### 4.6 Ticker Extraction (3-Pass)

```javascript
extractAllTickers(text):
  Pass 1: Regex /\$[A-Za-z]{1,5}\b/g  → cashtag extraction (most reliable)
  Pass 2: CRYPTO_NAMES dict lookup      → "bitcoin" → BTC, "ethereum" → ETH, etc.
  Pass 3: COMMON_TICKERS Set lookup    → standalone uppercase words (40 tickers)
  → Return deduplicated Set as Array
```

### 4.7 CORS Bypass via Background Worker

X.com pages cannot directly fetch from external APIs (CoinGecko, Yahoo Finance) due to CORS. The solution:

```
Content Script → chrome.runtime.sendMessage({type: "FETCH_CRYPTO_PRICE", coinId}) 
     ↕  
Background Service Worker (runs in extension context, no CORS)
     → fetch(CoinGecko API)
     → sendResponse({data})
     ↕
Content Script ← response.data
```

This pattern is used for both crypto and stock price fetches. The background worker has `host_permissions` for both `api.coingecko.com` and `query1.finance.yahoo.com`.

### 4.8 Auto-Scroll Loader

The Advanced Search feature automatically scrolls the Twitter search page to load hundreds of tweets:

```
startAutoScroll():
  interval = 1000ms
  scrollAmount = 2 viewports per tick
  maxTweets = 500
  timeout = 3 minutes
  stuckThreshold = 8 consecutive ticks with no height change

  Loop every 1s:
    count = countVisibleTweets()
    if count >= 500 → stop("Complete")
    if height unchanged for 8 ticks → stop("All loaded")  
    if elapsed > 3min → stop("Timeout")
    else → scrollBy(2 viewports, instant)
         → updateLoadingIndicator()
```

### 4.9 MutationObserver — Live Feed Processing

Both `TweetProcessor` and `content.js` use `MutationObserver` to react to dynamically loaded tweets as the user scrolls the infinite Twitter feed:

```javascript
new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.matches('article[data-testid="tweet"]')) 
        processTweet(node);
      // Also check descendants
      node.querySelectorAll('article[data-testid="tweet"]').forEach(processTweet);
    });
  });
}).observe(document.body, { childList: true, subtree: true });
```

A `WeakSet<DOMNode>` prevents re-processing the same tweet element (TweetProcessor), while a `data-traderx-processed` attribute serves the same purpose in `content.js`.

### 4.10 Quality & Trust Scoring

Defined in `utils/constants.js`:

**Quality Score Weights:**

| Signal | Points |
|---|---|
| Broetry detected (short lines) | −2 |
| Engagement bait | −2 |
| Link hiding (`link in bio`) | −1 |
| Excessive short lines | −1 |
| Substantive content | +2 |
| Proper formatting | +1 |
| Citations/sources | +1 |
| AI-generated pattern | −1 |

**Trust Score Weights:**

| Signal | Points |
|---|---|
| New account | −2 |
| No profile photo | −1 |
| Generic title | −2 |
| Very high connections (suspicious) | −1 |
| Very low connections | −1 |
| Established account | +2 |
| Complete profile | +1 |

---

## 5. Accounts Registry — `accounts.json`

**Version:** 3.0 | **Total accounts:** 988 | **Last updated:** 2026-02-04

| Category | Accounts | Notable Inclusions |
|---|---|---|
| **Macro_CentralBanks** | ~70 | @federalreserve, @ECB, @IMFNews, @WorldBank, @RayDalio, @elerianm, @paulkrugman, @LynAldenContact |
| **Regulatory_Government** | ~21 | @SECGov, @CFTC, @USTreasury, @WhiteHouse, @SenatorWarren |
| **Institutional_AssetMgmt** | ~45 | @BlackRock, @GoldmanSachs, @jpmorgan, @Vanguard_Group, @ARKInvest, @Grayscale |
| **Media_News** | ~55 | @business, @CNBC, @Reuters, @FT, @WSJ, @TheEconomist, @unusual_whales |
| **Wealth_ValueInvesting** | ~65 | @morganhousel, @AswathDamodaran, @RaoulGMI, @BillAckman, @HindenburgRes, @CitronResearch |
| **Trading_TechnicalAnalysis** | ~100 | @PeterLBrandt, @markminervini, @Qullamaggie, @OptionsHawk, @allstarcharts |
| **RealEstate_Housing** | ~19 | @LoganMohtashami, @Redfin, @Zillow, @CalculatedRisk |
| **Geopolitics_OSINT** | ~18 | @War_Mapper, @Osinttechnical, @Flexport, @MarineTraffic |
| **Crypto_DeFi** | ~85 | @VitalikButerin, @saylor, @cz_binance, @PlanB, @glassnode, @MessariCrypto |
| **Forex** | ~70 | @ForexLive, @BabyPips, @KathyLien, @SaxoBank, @FXCM |
| **Commodities** | ~75 | @DoombergT, @JavierBlas, @PeterSchiff, @CMEGroup, @GoldCore |
| **Corporate_IR** | ~150 | @Apple, @NVIDIA, @Tesla, @Google, @Meta, @JPMorgan (official corporate accounts) |
| **VentureCapital** | ~80 | @a16z, @sequoia, @naval, @paulg, @sama, @YCombinator, @TechCrunch |

---

## 6. Data Flows

### 6.1 Market Pulse Dashboard Data Flow

```
[TrackerDashboard.startTracking()] every 30s
    │
    ├─ For each ticker:
    │   ├─ TwitterFetcher.fetchTickerTweets(ticker)
    │   │     └─ 4-strategy fetch → cached tweets
    │   │
    │   ├─ AnalysisEngine.analyzeTicker(tweets, ticker)
    │   │     ├─ Per tweet: ML or keyword score
    │   │     ├─ Apply tier weights
    │   │     ├─ Weighted average sentiment
    │   │     ├─ Standard deviation (volatility)
    │   │     └─ Volume spike check
    │   │
    │   └─ PriceFetcher.getPrice(ticker)
    │         ├─ Cache check (30s TTL)
    │         ├─ BG message → Yahoo/CoinGecko
    │         └─ Returns {price, change24h, volume}
    │
    └─ updateCardUI(ticker, {sentiment, status, price, change...})
```

### 6.2 Tweet Processing Flow

```
New tweet appears in DOM
    │ (MutationObserver)
    ▼
content.js: processTweet(element)
    ├─ extractAllTickers(text)  ← 3-pass extraction
    ├─ detectSentiment(text)    ← bullish/bearish/neutral
    ├─ isSpam(text, author)     ← 7-rule pipeline
    │     └─ Hide tweet + count if spam
    ├─ inject ticker pill tags (color-coded)
    ├─ apply tier border (left border color)
    ├─ highlight watchlist mentions (yellow bg)
    └─ checkKeywordAlerts() → background notification

Simultaneously:
tweetProcessor.js: processTweet(element)
    ├─ extractHandle()
    ├─ if trusted → inject "✓ Trusted" badge
    └─ if TrustedMode + not trusted → hide tweet
```

---

## 7. Settings System

**Defined in:** `utils/constants.js` → `DEFAULT_SETTINGS`

### Smart Modes

| Mode | Key Settings |
|---|---|
| **Focus Mode** | hideSecondary, hideSponsored, hideReposts, quality ≥ 6, hideSuspicious |
| **Network Mode** | hideSecondary only, no quality scoring |
| **Industry News** | hideSecondary, hideSponsored, hideReposts, quality ≥ 5 |
| **High Quality Only** | quality ≥ 7, hideSuspicious |
| **Custom Mode** | Full user control |

### Key Settings Categories

- **Core Filters:** enabled, hideSecondaryPosts, hideSponsored, hideReposts, postAgeLimit
- **Quality Detection:** enableQualityScoring, qualityThreshold (1–10), detectBroetry, detectEngagementBait, detectAIContent, detectLinkHiding
- **Trust Scoring:** showTrustBadges, hideSuspiciousAccounts, hideNewAccounts, trustScoreThreshold
- **Post Type Filters:** hidePolls, hideVideos, hideCarousels, hideTextOnly, hideImagePosts
- **Blocklists:** blockedKeywords[], mutedAuthors[], blockedCompanies[], allowlistedSecondaryConnections[]
- **Display:** filteredPostDisplay (collapsed/hidden), showFilterReason, showUndoButton, showQualityBadges
- **Stats Counter:** showStatsCounter, position, style, draggable
- **Search Enhancement:** enableSearchEnhancement, searchReRankByQuality, searchHighlightTerms
- **Performance:** filterDelay, enablePerformanceMonitoring, debugMode

---

## 8. Export Features

All exports are accessible from the Sidebar or the Advanced Search completion banner.

### 8.1 JSON Export

Copies to clipboard:
```json
{
  "exportDate": "2026-03-09T...",
  "source": "https://x.com/search?q=...",
  "totalTweets": 47,
  "tweets": [
    {
      "id": 1,
      "author": "@handle",
      "displayName": "Full Name",
      "timestamp": "2026-03-09T...",
      "text": "...",
      "engagement": { "replies": 12, "retweets": 45, "likes": 230 },
      "engagementScore": 287
    }
  ]
}
```

### 8.2 CSV Export

Downloads `tweets_YYYY-MM-DD.csv` with columns:
`Index, Author, DisplayName, Timestamp, Text, Replies, Retweets, Likes, Engagement`

Handles K/M suffix parsing (e.g. `1.2K` → `1200`).

### 8.3 AI Sentiment Analysis Prompt

Builds a structured multi-section LLM prompt including:
1. Executive Summary request
2. Sentiment Breakdown (Bullish/Bearish/Neutral %)
3. Live Price Check
4. Key Themes & Narratives
5. Influential Voices Summary (top 10 by engagement)
6. Catalysts & Events
7. Risk Factors
8. Technical Analysis Mentions
9. Price Predictions (short/medium/long)
10. Final Recommendation (Outlook + Confidence + Action Items)
11. All tweet data with engagement metrics

---

## 9. UI Components Summary

| Component | Type | Location | Design |
|---|---|---|---|
| Market Pulse FAB | Floating button | Top-right | Graphite + Emerald (#00A36C) |
| TraderX Sidebar | Slide-in panel | Right edge | Deep Sea Blue + Graphite |
| Market Pulse Dashboard | Floating window | Top-left, draggable | Glassmorphism, dark tokens |
| Tweet Modal | Centered modal | Full screen overlay | Slate dark + backdrop blur |
| Advanced Search Modal | Centered modal | Full screen | Graphite dark, slideUp animation |
| Signal Directory | 2-column modal | Full screen | Slate 900/950 dark theme |
| Trusted Badges | Inline DOM injection | Twitter timeline | Blue pill with checkmark SVG |
| Ticker Tags | Inline DOM injection | Above tweet text | Color-coded pills (green/red/grey) |
| Loading Indicator | Fixed top-right | On search pages | Blue gradient, spinning border |
| Completion banner | Fixed top-right | Post-search | Green gradient with action buttons |
| Toast Notifications | Fixed bottom-right | Global | Dark Navy (#001233, #0466c8 border) |

**Font:** Inter (Google Fonts) across all custom UI elements.

---

## 10. Known Limitations & Future Work

### Current Limitations

| Area | Limitation |
|---|---|
| FinBERT model | Only loads if `window.transformers` is available (Transformers.js must be injected separately) |
| Tweet fetching | Twitter's actual GraphQL API not used (requires bearer tokens); DOM scraping can break with X.com updates |
| Strategy 4 | Generated tweets are synthetic — for demo/UI only |
| Stock batch | Yahoo Finance doesn't support true batch queries; stocks fetched sequentially |
| DOM selectors | `dom-selectors.js` must be updated when X.com changes their class names |
| Rate limits | CoinGecko free tier: 10-30 calls/min; heavy use may trigger 429s |

### Possible Future Improvements

- [ ] Integrate real Twitter API v2 bearer token for authentic tweet fetching
- [ ] Load actual FinBERT model from CDN or bundle with extension
- [ ] WebSocket-based real-time price streaming
- [ ] Portfolio tracking with PnL calculations
- [ ] Alert history page with filtering and charts
- [ ] Dark/Light mode toggle for the dashboard
- [ ] Browser sync for settings across devices
- [ ] Export to Notion / Google Sheets integration

---

*Documentation generated by Antigravity (Google DeepMind) — March 2026*
