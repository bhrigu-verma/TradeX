<div align="center">

# 🚀 TraderX Pro

### AI-Powered Trading Intelligence Platform

**Turn Twitter/X noise into actionable trading signals.**

A full-stack platform combining a Chrome Extension, Next.js Dashboard, and Enterprise API Server — powered by AI sentiment analysis, whale tracking, and institutional-grade analytics.

[![Version](https://img.shields.io/badge/version-1.0.0-6366F1.svg?style=for-the-badge)](https://github.com/bhrigu-verma/TradeX)
[![License](https://img.shields.io/badge/license-MIT-10B981.svg?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000.svg?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Chrome](https://img.shields.io/badge/Chrome-Extension_MV3-4285F4.svg?style=for-the-badge&logo=googlechrome)](https://developer.chrome.com/docs/extensions/mv3)

<br />

[Website](http://localhost:3000) · [Features](#-features) · [Get Started](#-getting-started) · [Architecture](#-architecture) · [API Reference](#-api-reference) · [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Chrome Extension](#-chrome-extension)
- [Dashboard (Next.js)](#-dashboard-nextjs)
- [Backend Server](#-backend-server)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Data Sources](#-data-sources)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

TraderX Pro is a **three-part platform** that gives retail and institutional traders an information edge:

| Component | Description | Tech |
|-----------|-------------|------|
| **Chrome Extension** | Injects an AI-powered trading sidebar directly into Twitter/X | Vanilla JS, Manifest V3 |
| **Next.js Dashboard** | Marketing website + real-time dashboard with portfolio tracking | Next.js 16, React 19, Framer Motion |
| **Enterprise Server** | REST API, Telegram/Discord bots, scheduled jobs, Stripe billing | Express 5, SQLite, Redis, Bull |

**The core idea:** Millions of traders share alpha on Twitter/X every day. TraderX intercepts that signal, runs AI sentiment analysis, combines it with on-chain whale data and price action, and surfaces high-confidence trade ideas — all without leaving your browser.

---

## ✨ Features

### 🤖 AI Trading Copilot
The flagship feature — a multi-factor trade idea generator that runs in real-time.

| Signal | Weight | Source |
|--------|--------|--------|
| Sentiment Analysis | 35% | FinBERT NLP on scraped tweets |
| Technical Indicators | 30% | Price action, momentum, volume |
| Volume Activity | 20% | Spike detection, unusual activity |
| Influencer Signals | 15% | Tier-weighted account monitoring |

- **65%+ confidence threshold** — only high-probability setups surface
- **2:1 minimum R:R** — risk/reward filtering for quality over quantity
- **Auto position sizing** via Kelly Criterion-inspired calculations
- **Entry, stop-loss, and take-profit targets** for every idea
- **Performance tracking** — win rate, profit factor, cumulative P&L
- **Explainable AI** — each idea includes a reasoning breakdown

### 🐋 Whale Flow Tracker
Follow institutional money with on-chain analytics.

- Monitor **$100K+ transactions** across BTC, ETH, SOL, BSC
- **Exchange flow analysis** — inflows (bearish) vs outflows (bullish)
- **100+ pre-loaded exchange wallets** (Binance, Coinbase, Kraken, OKX, Bybit, etc.)
- **Smart money tracking** — follow wallets with proven track records
- **Real-time alerts** for $1M+ whale movements
- **Net flow sentiment** — automatic bullish/bearish interpretation

### 📊 Market Pulse Dashboard
A live sidebar that appears on Twitter/X with real-time data:

- Sentiment gauges for every ticker in your watchlist
- Live price feeds (CoinGecko for crypto, Yahoo Finance for stocks)
- Volume spike detection with visual indicators
- Influencer-weighted sentiment scoring
- Click any ticker card to drill into analyzed tweets

### 🔍 Advanced Search Engine
Deep-dive research on any ticker:

- Load **150–200+ tweets** per search with auto-scroll pagination
- Smart filtering — verified accounts, engagement thresholds, time decay
- **Export to CSV** for spreadsheet analysis
- **Export to JSON** for programmatic use
- **Copy for AI** — formatted for ChatGPT/Claude analysis
- Stop/resume search with progress tracking

### 🎯 Intelligent Content Filtering
Cut through the noise:

- Hide engagement bait, crypto scams, and promotional content
- Filter low-effort posts and stale news
- Time-sensitive content prioritization
- Customizable filter sensitivity per category

### 👥 Signal Directory
A curated database of 250+ verified trading accounts across 13 categories:

| Category | Examples | Tier Weight |
|----------|----------|-------------|
| Central Banks | @federalreserve, @ecaboricuabank | 10× (Tier 1) |
| Institutional | @jpmorgan, @GoldmanSachs | 10× (Tier 1) |
| Breaking News | @DeItaone, @unusual_whales | 5× (Tier 2) |
| Macro Analysis | @charliebilello, @LizAnnSonders | 5× (Tier 2) |
| Crypto / DeFi | @CryptoCapo_, @inversebrah | 2× (Tier 3) |
| VCs / Founders | @elaboratecrash, @punk6529 | 2× (Tier 3) |
| ...and 7 more | Commodities, Options, ETFs, Education, Quant, Geopolitical, Earnings | — |

### 📈 Portfolio & Analytics Suite
- **Portfolio Tracker** — positions, cost basis, real-time P&L, sentiment alignment
- **Sector Heatmap** — rotation analysis, relative strength across sectors
- **Combo Alerts** — divergence detection, influencer bursts, sentiment flips
- **Backtesting** — historical accuracy tracking for AI-generated signals

### 💳 Premium Subscription System
Monetized via Stripe with three tiers:

| Feature | Free | Pro ($19/mo) | Enterprise ($99/mo) |
|---------|:----:|:------------:|:-------------------:|
| Watchlist Tickers | 5 | 50 | Unlimited |
| Monthly Searches | 10 | Unlimited | Unlimited |
| Basic Sentiment | ✅ | ✅ | ✅ |
| AI Copilot | ❌ | ✅ | ✅ |
| Whale Tracker | ❌ | ✅ | ✅ |
| Portfolio Tracking | ❌ | ✅ | ✅ |
| Combo Alerts | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Webhooks | ❌ | ❌ | ✅ |
| White-Label | ❌ | ❌ | ✅ |
| Team Accounts | ❌ | ❌ | ✅ |

### 🤖 Bot Integrations
- **Telegram Bot** — 15+ slash commands, alert delivery, portfolio queries
- **Discord Bot** — Slash commands, channel alerts, role-based access

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          TraderX Pro Platform                            │
├──────────────┬──────────────────────┬────────────────────────────────────┤
│              │                      │                                    │
│  Chrome      │  Next.js Dashboard   │  Enterprise Server                 │
│  Extension   │  (traderx-dashboard) │  (traderx-server)                  │
│              │                      │                                    │
│  ┌─────────┐ │  ┌────────────────┐  │  ┌──────────────────────────────┐  │
│  │Sidebar  │ │  │Marketing Site  │  │  │ Express REST API             │  │
│  │Dashboard│ │  │ / /features    │  │  │  ├─ /api/sentiment           │  │
│  │Search   │ │  │ / /pricing     │  │  │  ├─ /api/watchlist           │  │
│  │AI Copilot│ │  │ / /guide      │  │  │  ├─ /api/portfolio           │  │
│  │Whale    │ │  │ / /docs/*      │  │  │  ├─ /api/alerts              │  │
│  │Portfolio│ │  │ / /community   │  │  │  ├─ /api/backtest            │  │
│  │Alerts   │ │  │ / /changelog   │  │  │  ├─ /api/whale               │  │
│  └────┬────┘ │  └────────┬───────┘  │  │  ├─ /api/copilot             │  │
│       │      │           │          │  │  ├─ /api/auth                 │  │
│       │      │           │          │  │  └─ /api/subscription         │  │
│       ▼      │           ▼          │  ├──────────────────────────────┤  │
│  Chrome      │  React 19 +          │  │ Telegram Bot (Telegraf)      │  │
│  Storage API │  Framer Motion       │  │ Discord Bot (discord.js)     │  │
│              │  Recharts             │  │ Job Scheduler (node-cron)    │  │
│              │                      │  │ Queue System (Bull + Redis)  │  │
│              │                      │  │ SQLite Database              │  │
│              │                      │  │ Stripe Webhooks              │  │
└──────────────┴──────────────────────┴──┴──────────────────────────────┴──┘
                                    │
                     ┌──────────────┼──────────────┐
                     ▼              ▼              ▼
              ┌────────────┐ ┌───────────┐ ┌────────────┐
              │ CoinGecko  │ │ Yahoo     │ │ Blockchain │
              │ API        │ │ Finance   │ │ Explorers  │
              │ (crypto)   │ │ (stocks)  │ │ (whales)   │
              └────────────┘ └───────────┘ └────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** or **yarn**
- **Google Chrome** (for the extension)
- **Redis** (optional — for caching layer)

### 1. Clone the Repository

```bash
git clone https://github.com/bhrigu-verma/TradeX.git
cd TradeX
```

### 2. Chrome Extension (Zero-Config)

The extension works standalone with no build step:

```bash
# 1. Open Chrome → chrome://extensions/
# 2. Enable "Developer mode" (top right toggle)
# 3. Click "Load unpacked"
# 4. Select the root trader-x-extension/ folder
# 5. Visit https://x.com — the sidebar appears automatically
```

### 3. Dashboard (Next.js)

```bash
cd traderx-dashboard
npm install
npm run dev
# → http://localhost:3000
```

### 4. Backend Server

```bash
cd traderx-server
npm install

# Set up the database
npm run setup-db
npm run seed

# Configure environment (see Environment Variables section)
cp .env.example .env

# Start the server
npm run dev
# → http://localhost:3001
```

---

## 🧩 Chrome Extension

### How It Works

The extension injects content scripts into Twitter/X pages that:

1. **Scrape tweets** matching tickers in your watchlist
2. **Run FinBERT sentiment analysis** via a Web Worker (`finbert-worker.js`)
3. **Fetch live prices** from CoinGecko (crypto) and Yahoo Finance (stocks)
4. **Render a sidebar** with real-time sentiment dashboards, AI copilot, whale tracker, and portfolio views
5. **Background service worker** handles alarms, notifications, and cross-tab state

### Content Scripts Loaded

| Script | Purpose |
|--------|---------|
| `sidebar.js` | Main UI — sidebar rendering, tab navigation |
| `content.js` | Bootstrap, lifecycle management |
| `analysisEngine.js` | FinBERT-based sentiment scoring |
| `priceFetcher.js` | CoinGecko + Yahoo Finance price feeds |
| `twitterFetcher.js` | Tweet scraping and pagination |
| `tweetProcessor.js` | Tweet extraction, dedup, enrichment |
| `aiCopilot.js` | Multi-factor trade idea generation |
| `whaleTracker.js` | On-chain whale transaction monitoring |
| `portfolioTracker.js` | Position tracking, P&L calculations |
| `comboAlerts.js` | Multi-signal alert triggers |
| `sectorHeatmap.js` | Sector rotation analysis |
| `advancedsearch.js` | Deep search with export (CSV/JSON/AI) |
| `accountDirectory.js` | Signal directory UI (250+ accounts) |
| `premiumSystem.js` | Subscription gating and usage tracking |
| `trackerDashboard.js` | Market Pulse dashboard UI |

### Settings Page

Accessible via right-click extension icon → **Options**:

- **Watchlist** — Add/remove tickers (e.g., BTC, TSLA, NVDA)
- **Filters** — Toggle noise filters (engagement bait, scams, old news)
- **Account Tiers** — Configure influencer weighting
- **Suggested Follows** — Browse the 250+ curated Signal Directory

---

## 📱 Dashboard (Next.js)

The marketing website and data dashboard built with **Next.js 16 (App Router)**, **React 19**, and **Framer Motion**.

### Pages

| Route | Description |
|-------|-------------|
| `/` | Animated landing page with hero, bento grid, testimonials |
| `/features` | Deep-dive into 6 core features with animated checklists |
| `/pricing` | 3-tier pricing cards, comparison table, FAQ accordion |
| `/guide` | 5-step animated timeline with pro tips |
| `/community` | Discord, Telegram, and X/Twitter community links |
| `/changelog` | Release timeline with filterable change types |
| `/docs` | Full documentation hub with sidebar navigation |
| `/docs/overview` | Platform architecture overview |
| `/docs/api` | REST API reference |
| `/docs/ai-copilot` | AI Copilot guide |
| `/docs/whale-tracker` | Whale tracking documentation |
| `/docs/telegram-setup` | Telegram bot setup guide |
| `/docs/discord-bot-setup` | Discord bot setup guide |
| `/docs/webhooks` | Webhook event reference |
| `/docs/environment` | Local development setup |
| `/docs/deployment` | Production deployment guide |
| `/docs/pricing-billing` | Subscription and billing docs |
| `/contact` | Contact form + support channels |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

### UI Component Library

Custom animated components in `src/components/ui/`:

| Component | Description |
|-----------|-------------|
| `FadeIn` | Scroll-triggered fade with directional support (up/down/left/right) |
| `StaggerContainer` + `StaggerItem` | Staggered children animation container |
| `GlassCard` | Glassmorphism card with hover lift, glow, and shimmer effects |
| `GlowButton` | Animated CTA button — primary/secondary/ghost variants |
| `AnimatedCounter` | Number counter animation on scroll into view |
| `FloatingOrbs` | Ambient floating gradient background blobs |
| `SectionHeading` | Animated badge + title + subtitle for page sections |

---

## ⚙️ Backend Server

Enterprise-grade Node.js server at `traderx-server/`.

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sentiment/:ticker` | GET | Aggregated sentiment data for a ticker |
| `/api/watchlist` | GET/POST/DELETE | Manage user watchlists |
| `/api/portfolio` | GET/POST/PUT/DELETE | Portfolio positions and P&L |
| `/api/alerts` | GET/POST/DELETE | Alert rules and delivery config |
| `/api/backtest` | GET | Backtest results and leaderboard |
| `/api/whale/:chain` | GET | Whale transactions by blockchain |
| `/api/copilot/ideas` | GET | AI-generated trade ideas |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | JWT authentication |
| `/api/auth/refresh` | POST | Token refresh |
| `/api/subscription` | GET/POST | Stripe subscription management |
| `/api/webhook/stripe` | POST | Stripe webhook handler |
| `/api/sync` | POST | Extension ↔ Server data sync |

### Services

| Service | Purpose |
|---------|---------|
| `sentiment.service.js` | Tweet sentiment aggregation and scoring |
| `price.service.js` | Multi-source price feeds with caching |
| `alert.service.js` | Alert evaluation and delivery routing |
| `intelligence.service.js` | AI trade idea generation (OpenAI) |
| `twitter.service.js` | Twitter/X API integration |
| `x-feed.service.js` | X feed polling and processing |
| `aggregator.service.js` | Cross-signal data aggregation |
| `ranking.service.js` | Ticker ranking and scoring |
| `cache.service.js` | Redis caching layer |

### Background Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| Tracked Poller | Every 5 min | Fetch new data for tracked tickers |
| Alert Evaluator | Every 1 min | Check alert conditions and trigger delivery |
| Backtest Scorer | Every 4 hours | Score AI predictions against actual price movement |
| Cache Cleanup | Daily | Prune stale cache entries |

### Bot Commands

**Telegram Bot** (via Telegraf):

| Command | Description |
|---------|-------------|
| `/start` | Welcome and onboarding |
| `/watchlist` | View/manage your watchlist |
| `/sentiment <ticker>` | Get sentiment analysis |
| `/price <ticker>` | Get current price |
| `/alert <ticker> <condition>` | Set a price/sentiment alert |
| `/portfolio` | View portfolio summary |
| `/ideas` | Get latest AI trade ideas |
| `/whale <chain>` | Recent whale transactions |
| `/help` | Command reference |

**Discord Bot** (via discord.js):

- Same command set available as slash commands
- Channel-based alert delivery
- Role-based access control

---

## 🔐 Environment Variables

Create a `.env` file in `traderx-server/`:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./data/traderx.db

# Authentication
JWT_SECRET=your_jwt_secret_here
API_KEY_SALT=your_salt_here

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Discord Bot
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_guild_id
DISCORD_ALERT_CHANNEL_ID=your_channel_id

# Twitter / X API
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret

# Price APIs
COINGECKO_API_KEY=demo

# OpenAI (for AI Copilot server-side)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_...

# Redis (optional)
REDIS_URL=redis://localhost:6379
USE_REDIS=false

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## �� Project Structure

```
trader-x-extension/
│
├── manifest.json                    # Chrome Extension manifest (MV3)
├── background.js                    # Extension service worker
├── popup.html / popup.js            # Extension popup UI
├── accounts.json                    # 250+ curated trading accounts
├── suggested.js                     # Suggested follows logic
├── utils.js                         # Shared utilities
│
├── content/                         # Content scripts (injected into Twitter/X)
│   ├── sidebar.js                   # Main sidebar UI + tab navigation
│   ├── content.js                   # Bootstrap + lifecycle
│   ├── aiCopilot.js                 # AI trade idea generator
│   ├── whaleTracker.js              # On-chain whale monitoring
│   ├── analysisEngine.js            # FinBERT sentiment analysis
│   ├── priceFetcher.js              # CoinGecko + Yahoo Finance
│   ├── twitterFetcher.js            # Tweet scraping engine
│   ├── tweetProcessor.js            # Tweet extraction & enrichment
│   ├── advancedsearch.js            # Deep search + export (CSV/JSON)
│   ├── portfolioTracker.js          # Position tracking + P&L
│   ├── comboAlerts.js               # Multi-signal alert triggers
│   ├── sectorHeatmap.js             # Sector rotation analysis
│   ├── trackerDashboard.js          # Market Pulse dashboard
│   ├── accountDirectory.js          # Signal Directory UI
│   ├── premiumSystem.js             # Subscription gating
│   ├── finbert-worker.js            # Web Worker for ML inference
│   ├── content.css                  # Sidebar styles
│   └── dom-selectors.js             # Twitter DOM selectors
│
├── settings/                        # Extension settings page
│   ├── settings.html
│   ├── settings.js
│   ├── settings.css
│   └── all-settings.js
│
├── traderx-dashboard/               # Next.js 16 marketing site + dashboard
│   ├── src/
│   │   ├── app/                     # App Router pages (24 routes)
│   │   │   ├── page.js              # Home (server wrapper)
│   │   │   ├── HomeClient.js        # Animated home page
│   │   │   ├── features/            # Features deep-dive
│   │   │   ├── pricing/             # Pricing + comparison table
│   │   │   ├── guide/               # 5-step setup guide
│   │   │   ├── docs/                # Documentation hub (10 sub-pages)
│   │   │   ├── community/           # Community links
│   │   │   ├── changelog/           # Release timeline
│   │   │   ├── contact/             # Contact form
│   │   │   ├── privacy/             # Privacy policy
│   │   │   └── terms/               # Terms of service
│   │   ├── components/
│   │   │   ├── marketing/           # Navbar, Footer (Framer Motion)
│   │   │   └── ui/                  # Reusable animated components
│   │   ├── content/                 # Marketing copy
│   │   └── hooks/                   # Custom React hooks
│   └── package.json
│
├── traderx-server/                  # Enterprise backend server
│   ├── src/
│   │   ├── index.js                 # Express app entry point
│   │   ├── api/
│   │   │   ├── routes/              # 11 route modules
│   │   │   └── middleware/          # Auth middleware (JWT)
│   │   ├── services/               # 9 business logic services
│   │   ├── delivery/               # Telegram + Discord bots
│   │   ├── jobs/                   # Scheduled background jobs
│   │   ├── db/                     # SQLite setup + seed data
│   │   ├── config/                 # Environment + logger config
│   │   └── tests/                  # Test runner
│   ├── data/                       # SQLite database files
│   ├── logs/                       # Winston log files
│   └── package.json
│
└── utils/                          # Shared utilities
    ├── constants.js
    ├── helpers.js
    ├── logger.js
    └── storage.js
```

---

## 🛠 Technology Stack

### Chrome Extension
| Technology | Purpose |
|------------|---------|
| JavaScript (ES2022) | Core logic — no build step required |
| Chrome Extensions API (MV3) | Permissions, storage, service worker, scripting |
| FinBERT (via Web Worker) | ML-powered sentiment classification |
| CSS3 | Glassmorphism sidebar UI |

### Next.js Dashboard
| Technology | Purpose |
|------------|---------|
| Next.js 16.1.6 | App Router, SSR/SSG, file-based routing |
| React 19 | UI components with Server + Client components |
| Framer Motion 12 | Page transitions, scroll animations, spring physics |
| Lucide React | Icon library (500+ icons) |
| Recharts 3 | Data visualization charts |
| CSS-in-JS (inline) | Styled components (RSC-compatible) |

### Backend Server
| Technology | Purpose |
|------------|---------|
| Express 5 | HTTP server and REST API routing |
| better-sqlite3 | Embedded database (zero config) |
| Redis + Bull | Job queues and caching layer |
| Telegraf | Telegram Bot API framework |
| discord.js 14 | Discord bot with slash commands |
| Stripe SDK | Payment processing and subscriptions |
| JWT + bcrypt | Authentication and password hashing |
| Winston | Structured logging |
| node-cron | Background job scheduling |
| Helmet + CORS | Security middleware |

### External APIs
| API | Data | Rate Limit |
|-----|------|------------|
| CoinGecko | Crypto prices, market data | Free tier (no key needed) |
| Yahoo Finance | Stock prices, volume | Free (15-min delay) |
| Blockchain.com | BTC whale transactions | Public |
| Etherscan | ETH whale transactions | Free tier |
| Solscan | SOL whale transactions | Free tier |
| Unavatar | Twitter profile pictures | Unlimited |
| OpenAI (GPT-4o-mini) | AI trade idea reasoning | Per-token billing |
| Stripe | Payment processing | Standard pricing |

---

## 📊 Data Sources & Algorithms

### Sentiment Analysis Pipeline

```
Tweet → Clean → Tokenize → FinBERT Score → Weight by Influencer Tier → Aggregate
                                                        │
                                                        ├─ Tier 1: 10× weight
                                                        ├─ Tier 2: 5× weight
                                                        └─ Tier 3: 2× weight
```

**Scoring:**
- Bullish: `+0.5 to +1.0`
- Neutral: `-0.5 to +0.5`
- Bearish: `-1.0 to -0.5`
- Final score = weighted average across all analyzed tweets

### AI Copilot Multi-Factor Model

```
Confidence Score = (Sentiment × 0.35) + (Technical × 0.30) + (Volume × 0.20) + (Influencer × 0.15)

Thresholds:
  ├─ Minimum confidence: 65%
  ├─ Minimum R:R ratio: 2:1
  └─ Position size: Kelly Criterion (capped at 5% portfolio)
```

### Whale Detection Thresholds

| Chain | Minimum Transaction | Alert Threshold |
|-------|-------------------|-----------------|
| Bitcoin | $100,000 | $1,000,000 |
| Ethereum | $100,000 | $1,000,000 |
| Solana | $100,000 | $500,000 |
| BSC | $100,000 | $500,000 |

---

## 🗺 Roadmap

### ✅ Completed (v1.0)
- [x] AI Trading Copilot with multi-factor trade generation
- [x] Whale Flow Intelligence with exchange flow analysis
- [x] Premium subscription system (Free / Pro / Enterprise)
- [x] Telegram bot (15+ commands) + Discord bot
- [x] Portfolio tracker with real-time P&L
- [x] Combo alerts (divergence, influencer burst, sentiment flip)
- [x] Sector heatmap and rotation analysis
- [x] Advanced search with CSV/JSON/AI export
- [x] Stripe billing with webhook handling
- [x] JWT auth with refresh token rotation
- [x] Full marketing website (24 animated pages)
- [x] Documentation hub with 10 sub-pages
- [x] Redis caching layer
- [x] Background job scheduler

### 🔜 In Progress
- [ ] Social trading network (copy trades, leaderboards)
- [ ] News aggregator with AI summarization
- [ ] Options flow tracking
- [ ] Mobile app (React Native)

### 🔮 Future
- [ ] Brokerage integration (Alpaca, Interactive Brokers)
- [ ] Custom ML models (fine-tuned transformers)
- [ ] Team accounts and collaboration
- [ ] API marketplace for third-party developers
- [ ] Multi-language support
- [ ] Earnings calendar and event tracking

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open** a Pull Request

### Commit Convention

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructuring |
| `test:` | Adding tests |
| `chore:` | Build, tooling, dependencies |

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Bhrigu Verma**

[![GitHub](https://img.shields.io/badge/GitHub-bhrigu--verma-181717?style=flat-square&logo=github)](https://github.com/bhrigu-verma)

---

## 🙏 Acknowledgments

- [CoinGecko](https://www.coingecko.com/) — Free crypto price API
- [Yahoo Finance](https://finance.yahoo.com/) — Stock market data
- [Unavatar](https://unavatar.io/) — Profile picture service
- [FinBERT](https://huggingface.co/ProsusAI/finbert) — Financial sentiment NLP model
- [Framer Motion](https://www.framer.com/motion/) — React animation library
- [Lucide](https://lucide.dev/) — Beautiful open-source icons
- All 250+ verified accounts in the Signal Directory

---

<div align="center">

**⚠️ Disclaimer:** TraderX Pro is for informational and educational purposes only. It does not constitute financial advice. AI-generated trade ideas are algorithmic suggestions — always do your own research before making investment decisions.

<br />

**Built with ❤️ by [Bhrigu Verma](https://github.com/bhrigu-verma)**

**TraderX Pro v1.0** — Where AI meets institutional-grade an