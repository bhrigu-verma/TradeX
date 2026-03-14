export const metadata = {
  title: 'Deployment Guide - TraderX Pro Docs',
  description: 'Deploy TraderX Pro to production: server, dashboard, Docker, monitoring, and scaling.',
};

export default function DeploymentPage() {
  return (
    <article className="doc-article">
      <h1>Deployment Guide</h1>
      <p className="lead">Deploy the TraderX Pro backend and dashboard to production environments.</p>

      <h2>Architecture Overview</h2>
      <ul>
        <li><strong>Backend Server</strong> — Node.js/Express on any VPS or container platform</li>
        <li><strong>Dashboard</strong> — Next.js app on Vercel, Netlify, or self-hosted</li>
        <li><strong>Database</strong> — SQLite file on server (or migrate to PostgreSQL for scale)</li>
        <li><strong>Cache</strong> — Redis instance (managed or self-hosted)</li>
        <li><strong>Chrome Extension</strong> — Published to Chrome Web Store</li>
      </ul>

      <h2>Backend Deployment</h2>
      <h3>Option 1: VPS (DigitalOcean, Hetzner, etc.)</h3>
      <div className="code-block"><code>{`# On your VPS
git clone <your-repo>
cd traderx-server
npm install --production
cp .env.example .env  # Configure all variables

# Use PM2 for process management
npm install -g pm2
pm2 start src/index.js --name traderx-api
pm2 save
pm2 startup`}</code></div>

      <h3>Option 2: Docker</h3>
      <div className="code-block"><code>{`FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "src/index.js"]`}</code></div>

      <h3>Reverse Proxy (Nginx)</h3>
      <div className="code-block"><code>{`server {
    server_name api.traderx.app;
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`}</code></div>

      <h2>Dashboard Deployment</h2>
      <h3>Vercel (Recommended)</h3>
      <ol>
        <li>Connect your GitHub repository to Vercel</li>
        <li>Set root directory to <code>traderx-dashboard</code></li>
        <li>Add environment variables: <code>NEXT_PUBLIC_API_URL</code>, <code>NEXT_PUBLIC_EXTENSION_URL</code></li>
        <li>Deploy — Vercel handles builds and CDN automatically</li>
      </ol>

      <h2>SSL/TLS</h2>
      <p>Use Let&apos;s Encrypt with Certbot for free SSL certificates:</p>
      <div className="code-block"><code>{`sudo certbot --nginx -d api.traderx.app`}</code></div>

      <h2>Monitoring</h2>
      <ul>
        <li><strong>Health endpoint</strong> — <code>GET /health</code> returns server status</li>
        <li><strong>PM2 monitoring</strong> — <code>pm2 monit</code> for real-time metrics</li>
        <li><strong>Structured logging</strong> — Winston logger outputs JSON logs for ingestion</li>
        <li><strong>Uptime monitoring</strong> — Use UptimeRobot or Better Uptime for alerting</li>
      </ul>

      <h2>Scaling Considerations</h2>
      <ul>
        <li>SQLite handles up to ~10K concurrent users well; migrate to PostgreSQL beyond that</li>
        <li>Redis caching reduces API load by 60-80% for read-heavy endpoints</li>
        <li>Use a CDN (Cloudflare) in front of the API for DDoS protection</li>
        <li>Separate background jobs (scheduler, poller) to a worker process</li>
      </ul>

      <h2>Checklist</h2>
      <ul>
        <li>☐ All environment variables configured</li>
        <li>☐ SSL/TLS enabled on all endpoints</li>
        <li>☐ Database backup strategy in place</li>
        <li>☐ Rate limiting configured per tier</li>
        <li>☐ Stripe webhook endpoint registered</li>
        <li>☐ Monitoring and alerting set up</li>
        <li>☐ CORS configured for dashboard domain</li>
        <li>☐ Log rotation configured</li>
      </ul>
    </article>
  );
}
