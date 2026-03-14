export const metadata = {
  title: 'Environment Setup - TraderX Pro Docs',
  description: 'Set up your local development environment for TraderX Pro backend and dashboard.',
};

export default function EnvironmentPage() {
  return (
    <article className="doc-article">
      <h1>Environment Setup</h1>
      <p className="lead">Configure your local development environment for the TraderX Pro backend server and Next.js dashboard.</p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 18+ (LTS recommended)</li>
        <li>npm or yarn package manager</li>
        <li>Redis (optional, for caching — falls back to in-memory)</li>
        <li>Stripe CLI (optional, for webhook testing)</li>
      </ul>

      <h2>Backend Server Setup</h2>
      <div className="code-block"><code>{`# Clone and install
cd traderx-server
npm install

# Create environment file
cp .env.example .env

# Start the server
npm start`}</code></div>

      <h3>Required Environment Variables</h3>
      <table>
        <thead><tr><th>Variable</th><th>Description</th><th>Default</th></tr></thead>
        <tbody>
          <tr><td>PORT</td><td>Server port</td><td>3001</td></tr>
          <tr><td>JWT_SECRET</td><td>Secret for signing JWT tokens</td><td>—</td></tr>
          <tr><td>DB_PATH</td><td>SQLite database file path</td><td>./data/traderx.db</td></tr>
          <tr><td>COINGECKO_API_KEY</td><td>CoinGecko API key</td><td>—</td></tr>
          <tr><td>TELEGRAM_BOT_TOKEN</td><td>Telegram bot token</td><td>—</td></tr>
        </tbody>
      </table>

      <h3>Optional Environment Variables</h3>
      <table>
        <thead><tr><th>Variable</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>REDIS_URL</td><td>Redis connection string (redis://localhost:6379)</td></tr>
          <tr><td>STRIPE_SECRET_KEY</td><td>Stripe secret key for billing</td></tr>
          <tr><td>STRIPE_WEBHOOK_SECRET</td><td>Stripe webhook signing secret</td></tr>
          <tr><td>STRIPE_PUBLISHABLE_KEY</td><td>Stripe publishable key</td></tr>
          <tr><td>DISCORD_BOT_TOKEN</td><td>Discord bot token</td></tr>
          <tr><td>DISCORD_GUILD_ID</td><td>Discord server ID</td></tr>
          <tr><td>FRONTEND_URL</td><td>Dashboard URL for CORS</td></tr>
        </tbody>
      </table>

      <h2>Dashboard Setup</h2>
      <div className="code-block"><code>{`cd traderx-dashboard
npm install

# Set environment
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start development server
npm run dev`}</code></div>

      <h2>Database</h2>
      <p>SQLite database is automatically created and migrated on first server start. Tables are set up via <code>src/db/setup.js</code>.</p>
      <p>To seed sample data:</p>
      <div className="code-block"><code>node src/db/seed.js</code></div>

      <h2>Redis (Optional)</h2>
      <p>If Redis is not available, the server automatically falls back to an in-memory cache. To use Redis:</p>
      <div className="code-block"><code>{`# macOS
brew install redis
brew services start redis

# Set in .env
REDIS_URL=redis://localhost:6379`}</code></div>

      <h2>Stripe Testing</h2>
      <p>Use Stripe CLI to forward webhook events to your local server:</p>
      <div className="code-block"><code>{`stripe listen --forward-to localhost:3001/webhooks/stripe
# Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET`}</code></div>
    </article>
  );
}
