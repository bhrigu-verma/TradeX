# TraderX Production Deploy and .me Domain Guide

This guide deploys:
- Dashboard: Vercel (auto deploy from GitHub)
- API Server: Render (Docker deploy via deploy hook)
- Domain: your .me domain through DNS

## 1. One-time platform setup

### A) Vercel (dashboard)
1. Import GitHub repo in Vercel.
2. Set Root Directory to traderx-dashboard.
3. Build command: npm run build
4. Output: default Next.js
5. Add env vars:
   - NEXT_PUBLIC_API_URL=https://api.yourdomain.me/api
   - NEXT_PUBLIC_EXTENSION_URL=https://chromewebstore.google.com/detail/traderx-pro/YOUR_EXTENSION_ID
6. Grab these from Vercel project settings:
   - VERCEL_PROJECT_ID
   - VERCEL_ORG_ID
7. Create Vercel token and save as VERCEL_TOKEN.

### B) Render (server)
1. Create a new Web Service from this repo.
2. Root Directory: traderx-server
3. Runtime: Docker
4. Instance type: start with 1-2 instances, autoscaling on CPU and memory.
5. Set env vars (production secrets):
   - NODE_ENV=production
   - PORT=3001
   - FRONTEND_URL=https://yourdomain.me
   - JWT_SECRET
   - API_KEY_SALT
   - TELEGRAM_BOT_TOKEN (if used)
   - DISCORD_BOT_TOKEN (if used)
   - OPENAI_API_KEY (if used)
   - STRIPE_SECRET_KEY and related Stripe vars (if used)
6. Copy Render Deploy Hook URL.
7. Set API_HEALTHCHECK_URL to https://api.yourdomain.me/health

## 2. GitHub secrets

In GitHub repo settings, add repository secrets:
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
- RENDER_DEPLOY_HOOK_URL
- API_HEALTHCHECK_URL

Then push to main. Workflow file:
- .github/workflows/deploy.yml

CI file:
- .github/workflows/ci.yml

## 3. Connect .me domain

Assuming Cloudflare DNS (recommended):

1. Dashboard domain
- Add yourdomain.me in Vercel Domains.
- Add www.yourdomain.me too.
- In DNS:
  - CNAME www -> cname.vercel-dns.com
  - Apex yourdomain.me -> follow Vercel apex instructions (A records or flattening)

2. API domain
- In Render, add custom domain api.yourdomain.me to your web service.
- Render provides a CNAME target.
- In DNS:
  - CNAME api -> <render-cname-target>

3. SSL
- Keep proxy/SSL enabled in Cloudflare.
- SSL mode: Full (strict).
- Enable Always Use HTTPS.

## 4. Verify deployment

After push to main:
1. Check GitHub Actions deploy workflow status.
2. Verify:
   - https://yourdomain.me
   - https://www.yourdomain.me
   - https://api.yourdomain.me/health
3. Confirm dashboard uses API URL from NEXT_PUBLIC_API_URL.

## 5. Scaling settings

### Dashboard (Vercel)
- Edge CDN is automatic.
- Enable Web Analytics and Speed Insights.

### API (Render)
- Horizontal autoscaling: min 2, max based on budget.
- Set health checks to /health.
- Use Redis for queue/cache if USE_REDIS=true.

## 6. Important production notes

1. Current server uses SQLite by default.
2. For true horizontal scaling, migrate to managed Postgres and shared Redis.
3. Do not use development defaults for JWT_SECRET and API_KEY_SALT.
4. Restrict CORS to your domain and extension origin only.

## 7. Fast rollback

- Vercel: Promote previous deployment.
- Render: Roll back to previous deploy from Render dashboard.
- DNS: keep low TTL during launch week (60-300 seconds).
