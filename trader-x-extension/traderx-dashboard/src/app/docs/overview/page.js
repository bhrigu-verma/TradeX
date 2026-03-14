export const metadata = {
  title: 'Platform Overview - TraderX Pro Docs',
  description: 'Understand the TraderX Pro architecture, components, and how to get started.',
};

export default function OverviewPage() {
  return (
    <article className="doc-article">
      <h1>Platform Overview</h1>
      <p className="lead">TraderX Pro is an AI-powered trading intelligence platform that transforms social media noise into actionable trade signals.</p>

      <h2>Architecture</h2>
      <p>The platform consists of three interconnected components:</p>
      <ul>
        <li><strong>Chrome Extension (v1.0)</strong> — Manifest V3 extension that overlays real-time sentiment, AI copilot panels, and whale flow data directly on X/Twitter. Communicates with the backend via API key authentication.</li>
        <li><strong>Backend Server</strong> — Node.js/Express API server with SQLite database, handling sentiment aggregation, price fetching, alert evaluation, whale tracking, and AI copilot logic. Includes Redis caching for performance.</li>
        <li><strong>Dashboard & Marketing Site</strong> — Next.js application for portfolio management, analytics visualization, subscription management, and the public marketing pages.</li>
      </ul>

      <h2>Core Capabilities</h2>
      <table>
        <thead><tr><th>Capability</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>AI Trading Copilot</td><td>Multi-factor trade idea generation with entry, stop, target, and confidence scoring</td></tr>
          <tr><td>Whale Flow Intelligence</td><td>Large transaction monitoring across major blockchain networks</td></tr>
          <tr><td>Sentiment Engine</td><td>Tiered influencer weighting, volume spike detection, engagement-weighted scoring</td></tr>
          <tr><td>Portfolio Tracker</td><td>Position tracking with real-time P&L and sentiment alignment</td></tr>
          <tr><td>Combo Alerts</td><td>Multi-signal alerts combining sentiment, volume, and price conditions</td></tr>
          <tr><td>Telegram & Discord Bots</td><td>Full-featured bots for receiving alerts and querying data</td></tr>
        </tbody>
      </table>

      <h2>Getting Started</h2>
      <ol>
        <li>Download the latest extension release from GitHub and load it through chrome://extensions (Load unpacked)</li>
        <li>Open X/Twitter — the TraderX sidebar loads automatically</li>
        <li>Add tickers to your watchlist</li>
        <li>Configure alerts and enable AI Copilot from settings</li>
        <li>Optionally connect Telegram or Discord for mobile alerts</li>
      </ol>

      <h2>Data Sources</h2>
      <p>TraderX aggregates data from multiple sources:</p>
      <ul>
        <li>X/Twitter API (tweets, engagement metrics, influencer profiles)</li>
        <li>CoinGecko & Yahoo Finance (price data)</li>
        <li>On-chain transaction feeds (whale movements)</li>
        <li>StockTwits, Reddit, CryptoPanic (supplementary sentiment)</li>
      </ul>
    </article>
  );
}
