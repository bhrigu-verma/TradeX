# TraderX Platform Feature Audit (Non-Extension)

## Scope
This document covers the non-extension platform stack found in this repository:
- Backend API/server: `traderx-server/`
- Web/dashboard/frontend: `traderx-dashboard/`
- Delivery channels integrated at platform level (Telegram/Discord)

This intentionally excludes extension implementation details except where platform APIs are consumed by extension sync.

---

## 1) Platform Topology

## 1.1 Components
Implemented components:
1. Node.js/Express API server (`traderx-server/src/index.js`)
2. SQLite persistence layer (`traderx-server/src/db/setup.js`)
3. Job scheduler and background workers (`traderx-server/src/jobs/`)
4. Telegram bot delivery layer (`traderx-server/src/delivery/telegram.bot.js`)
5. Discord bot delivery layer (`traderx-server/src/delivery/discord.bot.js`)
6. Next.js dashboard + docs + marketing web app (`traderx-dashboard/src/app/`)

## 1.2 Backend startup and orchestration
Implemented startup flow in `traderx-server/src/index.js`:
- Initializes DB via `getDb()`
- Boots Telegram bot (webhook mode or polling mode)
- Injects bot into scheduler and tracked poller
- Boots scheduler jobs
- Boots Discord bot
- Starts HTTP server and exposes health/info routes

## 1.3 API route mounting
Implemented mounts in `traderx-server/src/index.js`:
- `/api/auth`
- `/api/subscriptions`
- `/api/sentiment`
- `/api/watchlist`
- `/api/portfolio`
- `/api/alerts`
- `/api/backtest`
- `/api/sync`
- `/api/whale`
- `/api/copilot`
- Stripe webhooks mounted at `/webhooks`

---

## 2) Persistence and Data Model

## 2.1 Database engine
Implemented:
- `better-sqlite3`
- WAL mode and foreign keys enabled
- Auto-creation of DB and logs directories

## 2.2 Implemented tables
From `traderx-server/src/db/setup.js`, platform stores:
- `users`
- `watchlist`
- `tracked_accounts`
- `tweets`
- `sentiment_snapshots`
- `alerts`
- `alert_history`
- `positions`
- `price_cache`
- `backtest_results`
- `subscriptions`
- `refresh_tokens`
- `whale_transactions`
- `trade_ideas`
- `usage_metrics`
- `analytics_events`
- `sentiment_states`

## 2.3 Persistence coverage by domain
Implemented:
- Auth + session refresh state
- Subscription + billing lifecycle state
- Sentiment history and volume spike context
- Portfolio and trade outcomes
- Alert rules and delivery history
- Whale flow capture
- AI trade idea lifecycle

---

## 3) Authentication and Access Model

## 3.1 JWT auth for dashboard/web clients
Implemented in `traderx-server/src/api/routes/auth.routes.js` + middleware:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Mechanics implemented:
- Access tokens (15m)
- Refresh tokens (30 days)
- Token rotation on refresh
- Password hashing with `bcryptjs`

## 3.2 API key auth for extension/server sync
Implemented in `traderx-server/src/api/middleware/auth.js`:
- `apiKeyAuth` checks `x-api-key` or `api_key` query param
- User lookup by `users.api_key`
- Last-seen heartbeat update on request

Used by:
- `POST /api/sync/tweets`
- `GET /api/sync/watchlist`

---

## 4) API Surface (Implemented)

## 4.1 Sentiment APIs
Defined in `traderx-server/src/api/routes/sentiment.routes.js`:
- `GET /api/sentiment/:ticker`
- `GET /api/sentiment/:ticker/history`
- `GET /api/sentiment/multi`

## 4.2 Watchlist APIs
Defined in `traderx-server/src/api/routes/watchlist.routes.js`:
- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/:ticker`

## 4.3 Portfolio APIs
Defined in `traderx-server/src/api/routes/portfolio.routes.js`:
- `GET /api/portfolio`
- `POST /api/portfolio`
- `PATCH /api/portfolio/:id/close`
- `DELETE /api/portfolio/:id`

## 4.4 Alerts APIs
Defined in `traderx-server/src/api/routes/alerts.routes.js`:
- Alert list/create/update/history style endpoints (file present and mounted)

## 4.5 Backtest APIs
Defined in `traderx-server/src/api/routes/backtest.routes.js`:
- `GET /api/backtest/leaderboard`
- `GET /api/backtest/:ticker`

## 4.6 Sync bridge APIs (extension ingestion)
Defined in `traderx-server/src/api/routes/sync.routes.js`:
- `POST /api/sync/tweets`
- `GET /api/sync/watchlist`

## 4.7 Whale APIs
Defined in `traderx-server/src/api/routes/whale.routes.js`:
- `GET /api/whale/transactions`
- `GET /api/whale/flow`
- `POST /api/whale/transactions`
- `GET /api/whale/summary`

## 4.8 Copilot APIs
Defined in `traderx-server/src/api/routes/copilot.routes.js`:
- `GET /api/copilot/ideas`
- `POST /api/copilot/ideas`
- `POST /api/copilot/feedback`
- `GET /api/copilot/performance`
- `GET /api/copilot/generate/:ticker`

## 4.9 Subscription APIs
Defined in `traderx-server/src/api/routes/subscription.routes.js`:
- `POST /api/subscriptions/create-checkout`
- `POST /api/subscriptions/cancel`
- `POST /api/subscriptions/reactivate`
- `GET /api/subscriptions/validate`
- `POST /api/subscriptions/activate`
- `POST /api/subscriptions/update-payment`
- `POST /api/subscriptions/track` (analytics event capture)

## 4.10 Webhook APIs
Defined in `traderx-server/src/api/routes/webhook.routes.js`:
- `POST /webhooks/stripe`

## 4.11 Health and root info
Defined in `traderx-server/src/index.js`:
- `GET /`
- `GET /health`

---

## 5) Market Intelligence Pipeline

## 5.1 Data fetch layer
Implemented services include:
- `twitter.service.js` (live API when configured, demo fallback otherwise)
- `x-feed.service.js` (account feed support)
- `price.service.js` (CoinGecko + Yahoo + demo fallback)
- `sentiment.service.js` (tweet analysis)
- `intelligence.service.js` (composed intelligence output)

## 5.2 Scheduler-driven processing
`traderx-server/src/jobs/scheduler.js` schedules:
1. Ticker analysis: every minute
2. Tracked account polling: every 3 minutes
3. Price cache refresh: every 30 seconds
4. Backtest scoring: hourly
5. Daily digest: 8 AM IST equivalent UTC cron

## 5.3 Alert evaluation and delivery coupling
Implemented flow:
- Scheduler computes analysis + price context
- Calls `alertService.evaluateForUser`
- Sends via injected Telegram/Discord delivery channels when available

## 5.4 Extension ingestion path
Implemented flow in `sync.routes.js`:
- Extension submits tweet batches by ticker
- Server stores tweet rows
- Server computes aggregate snapshot
- Alerts are evaluated and optionally dispatched

---

## 6) Telegram Integration (Implemented)

## 6.1 Runtime modes
Implemented in `traderx-server/src/index.js` + bot module:
- Webhook mode when `TELEGRAM_WEBHOOK_URL` exists
- Polling mode otherwise

## 6.2 Telegram webhook endpoint
Implemented:
- `POST /webhook/telegram`
- Optional secret token check via header `x-telegram-bot-api-secret-token`

## 6.3 User onboarding and identity
Implemented in `telegram.bot.js`:
- User auto-create on `/start`
- API key generation per user
- Last-seen updates and profile linking to Telegram user

## 6.4 Command surface (implemented handlers)
Repository evidence confirms handlers for:
- `/start`
- `/help`
- `/watch`, `/unwatch`, `/watchlist`
- `/track`, `/untrack`, `/tracked`
- `/sentiment`
- `/heatmap`
- `/portfolio`
- `/buy`, `/long`
- `/short`
- `/sell`, `/close`
- `/alerts`, `/alert`
- `/mute`, `/unmute`
- `/apikey`
- `/settings`
- `/digest`

Also implemented:
- callback query handling
- keyboard shortcuts/buttons

## 6.5 Telegram alerting and digest
Implemented:
- Scheduler alert dispatch through `sendAlertToUser`
- Daily digest generation with watchlist summary

---

## 7) Discord Integration (Implemented)

Implemented integration in platform startup:
- `startDiscordBot()` boot attempt on startup
- Discord client injected in app locals on success
- `sendDiscordAlert` hook available for dispatch

Caveat:
- Runtime requires bot token/guild/channel env values to be effective

---

## 8) Billing and Subscription Platform

## 8.1 Stripe checkout and lifecycle
Implemented in subscription + webhook routes:
- Checkout session creation
- Subscription cancel/reactivate
- Billing portal session
- Webhook processing for:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.deleted`

## 8.2 Tier features mapping
Implemented in `subscription.routes.js`:
- Free/pro/enterprise feature maps used by `/validate`
- Tier constraints for API/webhooks/custom alerts and feature entitlements

## 8.3 License-based activation
Implemented:
- `POST /api/subscriptions/activate`
- Pattern validation for `TRADERX-PRO-...` and `TRADERX-ENT-...`

---

## 9) Dashboard / Web Frontend (Next.js)

## 9.1 Framework and app structure
Implemented in `traderx-dashboard/`:
- Next.js app router project
- Route groups for:
  - Marketing pages
  - Product/docs pages
  - Pricing, launch, guide, terms, privacy, contact, community

## 9.2 Frontend data hook
Implemented `src/hooks/useTraderX.js`:
- Aggregates watchlist, sentiment, portfolio, alerts, backtest stats
- Polling refresh every 30 seconds

Important caveat:
- Hook uses hardcoded base URL `http://localhost:3001/api`
- Hook uses hardcoded API key placeholder (`traderx_dev_key_here`)

## 9.3 Docs and launch assets
Implemented broad docs content under app docs routes:
- Telegram setup, deployment/environment docs, overview and feature pages

Caveat:
- Some docs/marketing content still contain placeholder handles/URLs

---

## 10) Configuration and Feature Flags

## 10.1 Env config coverage
`traderx-server/src/config/env.js` includes:
- Core server settings
- Telegram, Twitter/X, OpenAI, Stripe, Discord, Redis configs
- Feature flags derived from env presence

## 10.2 Operational mode behavior
Implemented:
- Twitter service can run in demo mode without bearer token
- Price service supports demo fallback values
- Startup logs indicate live vs demo mode for key integrations

---

## 11) Platform Status Matrix

| Domain | Status | Notes |
|---|---|---|
| API server and route mounts | IMPLEMENTED | Express app and route table fully present |
| SQLite schema and setup | IMPLEMENTED | Multi-domain schema with indexes and FK constraints |
| JWT auth + refresh | IMPLEMENTED | Registration/login/refresh/logout/me present |
| API key extension sync | IMPLEMENTED | `/api/sync/*` protected by API key middleware |
| Sentiment analytics pipeline | IMPLEMENTED | Services + scheduler + DB snapshots |
| Alert engine and history | IMPLEMENTED | Rule evaluation + history + delivery hooks |
| Telegram bot | IMPLEMENTED | Command handlers + webhook/polling + digest |
| Discord bot | IMPLEMENTED | Startup + send hooks present |
| Stripe subscriptions | IMPLEMENTED | Checkout, manage, validate, webhooks |
| Dashboard Next.js app | IMPLEMENTED | Multi-page product/docs/marketing app |
| Production-ready frontend auth wiring | PARTIAL | `useTraderX` currently hardcoded dev API URL/key |
| Production-ready public marketing links | PARTIAL | Placeholder values still present in content/layout |

---

## 12) Explicit “NOT IMPLEMENTED” (Platform Scope)

1. Centralized secrets management platform integration (Vault/SSM/etc.): **NOT IMPLEMENTED**
   - Current model is `.env` driven.

2. End-to-end automated CI test pipeline evidence in repo root for server+dashboard release gates: **NOT IMPLEMENTED**
   - Local test script exists, but no full CI workflow evidence in audited scope.

3. Fully productionized frontend API client auth model for dashboard (token/session-driven): **NOT IMPLEMENTED**
   - `useTraderX` currently uses fixed local API URL and hardcoded dev key.

4. Placeholder-free production social/channel links across dashboard marketing content: **NOT IMPLEMENTED**
   - Multiple `REPLACE_WITH_*` URLs remain.

---

## 13) Platform Summary
The non-extension platform is substantial and feature-rich:
- Multi-domain API
- Background intelligence and alerting scheduler
- Telegram and Discord delivery integrations
- Billing/subscription lifecycle with Stripe
- Dashboard/docs site with broad product surface

Primary concerns are operational hardening and production readiness in specific surfaces (frontend API wiring, placeholder link cleanup, secrets posture), rather than core platform feature absence.
