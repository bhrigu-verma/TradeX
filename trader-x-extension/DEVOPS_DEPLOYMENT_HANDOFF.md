# TraderX DevOps Deployment Handoff

Date: 14 March 2026
Owner: Bhrigu Verma
Project Root: trader-x-extension

## 1) What this product includes

TraderX is a multi-part platform:

1. Chrome Extension (Manifest V3) for X/Twitter UI injection and analytics.
2. Frontend web app (Next.js) in traderx-dashboard.
3. Backend API and bots (Express) in traderx-server.

## 2) Current technology stack

### Frontend (traderx-dashboard)

- Framework: Next.js 16.1.6 (App Router)
- Runtime: Node.js 20 recommended
- UI: React 19.2.3, Framer Motion, Recharts, Lucide
- Build commands:
  - npm ci
  - npm run lint
  - npm run build
  - npm run start
- Main scripts defined in traderx-dashboard/package.json

### Backend (traderx-server)

- Framework: Express 5.2.1
- Runtime: Node.js 20 recommended
- Database today: SQLite via better-sqlite3 (file-based)
- Queue/cache libs: Bull + ioredis
- Bots: Telegraf (Telegram), discord.js (Discord)
- Billing: Stripe SDK
- Security middleware: helmet, cors, express-rate-limit
- Build/run commands:
  - npm ci
  - npm test
  - npm run setup-db
  - npm run seed
  - npm run start
- Main scripts defined in traderx-server/package.json

### Extension (root)

- Manifest: manifest.json (Manifest version 3)
- Target host permissions:
  - x.com
  - twitter.com
  - CoinGecko API
  - Yahoo Finance API
- Packaging script available at scripts/package-extension.sh

## 3) Deployment model to use now

Recommended immediate production model:

1. Frontend: Vercel (from GitHub)
2. Backend: Render (Docker web service from GitHub)
3. DNS/Domain: Cloudflare (or existing DNS provider)
4. Domain split:
  - root domain: yourdomain.me -> frontend
  - www.yourdomain.me -> frontend alias
  - api.yourdomain.me -> backend API

Reason:
- Fastest path with managed infra and autoscaling options.
- Minimal ops burden while still production-grade.

## 4) Existing CI/CD that is already added in repo

### CI workflow

File: .github/workflows/ci.yml

Runs on PR and pushes to main:
- Dashboard lint and build
- Server tests

### CD workflow

File: .github/workflows/deploy.yml

Runs on push to main or manual dispatch:
- Deploy dashboard to Vercel using VERCEL secrets
- Trigger backend deploy on Render via deploy hook
- Run API health check after deploy

## 5) Required GitHub repository secrets

Add these in GitHub Repository Settings -> Secrets and variables -> Actions:

1. VERCEL_TOKEN
2. VERCEL_ORG_ID
3. VERCEL_PROJECT_ID
4. RENDER_DEPLOY_HOOK_URL
5. API_HEALTHCHECK_URL

## 6) Required app environment variables

Source of truth file: traderx-server/.env.example

Must set for production at backend platform level:

1. NODE_ENV=production
2. PORT=3001
3. FRONTEND_URL=https://yourdomain.me
4. JWT_SECRET (strong random)
5. API_KEY_SALT (strong random)
6. TELEGRAM_BOT_TOKEN (if Telegram is enabled)
7. TELEGRAM_WEBHOOK_URL and TELEGRAM_WEBHOOK_SECRET (if webhook mode used)
8. DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, DISCORD_ALERT_CHANNEL_ID (if Discord enabled)
9. OPENAI_API_KEY, OPENAI_MODEL (if AI copilot backend features enabled)
10. STRIPE_SECRET_KEY and all Stripe price/webhook IDs (if billing enabled)
11. REDIS_URL and USE_REDIS=true (if Redis is enabled)

Frontend production env vars on Vercel:

1. NEXT_PUBLIC_API_URL=https://api.yourdomain.me/api
2. NEXT_PUBLIC_EXTENSION_URL=https://chromewebstore.google.com/detail/traderx-pro/YOUR_EXTENSION_ID

## 7) Docker details for backend

Dockerfile already added at traderx-server/Dockerfile:

- Base image: node:20-alpine
- Installs production dependencies only
- Copies src and data
- Exposes port 3001
- Entrypoint: node src/index.js

Docker ignore file added at traderx-server/.dockerignore

## 8) Domain and DNS cutover checklist (.me)

1. Add root domain and www domain in Vercel project settings.
2. Add custom domain api.yourdomain.me in Render service settings.
3. Create DNS records:
   - www CNAME -> cname.vercel-dns.com
   - apex/root -> Vercel provided apex target records
   - api CNAME -> Render provided CNAME target
4. Enable HTTPS everywhere.
5. Verify endpoints:
   - https://yourdomain.me
   - https://www.yourdomain.me
   - https://api.yourdomain.me/health

## 9) Current production caveats DevOps should know

1. Backend currently uses SQLite file database.
   - Good for single instance.
   - Not ideal for multi-instance horizontal scale.
2. For true scale, plan migration to managed Postgres + shared Redis.
3. CORS has been hardened to allow configured frontend domain and Chrome extension origins.
4. There is a known transitive dependency security advisory path related to undici via discord.js chain; DevOps should track and patch when non-breaking upstream updates become available.

## 10) Recommended scalable target architecture (next phase)

Phase 1 (now):
- Vercel + Render + DNS + health checks + alerts

Phase 2 (scaling):
- Move backend to AWS ECS/Fargate
- Move DB to RDS Postgres
- Move cache/queue to ElastiCache Redis
- Keep frontend on Vercel or move behind CloudFront if required
- Add centralized logs, metrics, tracing, and SLO alerts

## 11) Operations checklist for launch day

1. Confirm GitHub secrets exist.
2. Confirm Vercel env vars exist.
3. Confirm Render env vars exist.
4. Push to main and monitor deploy workflow.
5. Validate health endpoint.
6. Validate frontend -> API calls from browser.
7. Validate Telegram/Discord bot startup logs if enabled.
8. Validate Stripe webhook endpoint if billing enabled.
9. Keep DNS TTL low (60-300 sec) for launch window.
10. Have rollback plan ready:
    - Vercel: promote previous deployment
    - Render: rollback to previous deploy

## 12) Extension deployment note

The Chrome extension is independent from web/app domain hosting.

Release path:
1. Build release zip via scripts/package-extension.sh
2. Upload zip to Chrome Web Store Developer Dashboard
3. Publish and update extension listing

## 13) File references for DevOps

- Frontend package: traderx-dashboard/package.json
- Backend package: traderx-server/package.json
- Backend env template: traderx-server/.env.example
- Backend app entry: traderx-server/src/index.js
- Backend Dockerfile: traderx-server/Dockerfile
- CI workflow: .github/workflows/ci.yml
- CD workflow: .github/workflows/deploy.yml
- Extension manifest: manifest.json
- Domain guide: DEPLOY_ME_DOMAIN_GUIDE.md
