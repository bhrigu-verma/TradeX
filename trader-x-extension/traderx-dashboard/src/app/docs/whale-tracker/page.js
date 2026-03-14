export const metadata = {
  title: 'Whale Tracker Guide - TraderX Pro Docs',
  description: 'Track large wallet movements, exchange flows, and smart money behavior with TraderX Whale Tracker.',
};

export default function WhaleTrackerPage() {
  return (
    <article className="doc-article">
      <h1>Whale Tracker</h1>
      <p className="lead">Follow smart money behavior with near real-time large transaction monitoring across major blockchain networks.</p>

      <h2>Overview</h2>
      <p>The Whale Tracker monitors on-chain transactions above significant thresholds to identify accumulation, distribution, and exchange flow patterns that often precede major price movements.</p>

      <h2>Supported Networks</h2>
      <table>
        <thead><tr><th>Network</th><th>Coverage</th></tr></thead>
        <tbody>
          <tr><td>Bitcoin</td><td>Transactions &gt; $100K</td></tr>
          <tr><td>Ethereum</td><td>Transactions &gt; $100K, ERC-20 transfers</td></tr>
          <tr><td>Solana</td><td>Large SPL token transfers</td></tr>
          <tr><td>BSC</td><td>BEP-20 large transfers</td></tr>
        </tbody>
      </table>

      <h2>Transaction Classification</h2>
      <p>Each whale transaction is automatically classified:</p>
      <ul>
        <li><strong>Exchange Inflow</strong> — Tokens moving TO known exchange wallets (potentially bearish — selling pressure)</li>
        <li><strong>Exchange Outflow</strong> — Tokens moving FROM exchanges to private wallets (potentially bullish — accumulation)</li>
        <li><strong>Wallet-to-Wallet</strong> — Large transfers between non-exchange addresses (smart money repositioning)</li>
        <li><strong>Contract Interaction</strong> — Large DeFi protocol interactions (liquidity events)</li>
      </ul>

      <h2>Flow Analysis</h2>
      <p>Beyond individual transactions, the Whale Tracker computes aggregate flow metrics:</p>
      <ul>
        <li><strong>Net Flow</strong> — Inflow minus outflow over a time window (negative = accumulation)</li>
        <li><strong>Flow Trend</strong> — Direction of net flow over 24h/7d/30d periods</li>
        <li><strong>Flow Sentiment</strong> — Combined with social sentiment for cross-signal confirmation</li>
      </ul>

      <h2>API Endpoints</h2>
      <div className="code-block">
        <code>GET  /api/whale/transactions        — List whale transactions (filterable)</code><br/>
        <code>GET  /api/whale/flow/:ticker         — Inflow/outflow analysis for a ticker</code><br/>
        <code>POST /api/whale/transactions         — Batch ingest transactions (max 500)</code><br/>
        <code>GET  /api/whale/summary              — 24h aggregate by ticker</code>
      </div>

      <h3>Query Parameters for /transactions</h3>
      <table>
        <thead><tr><th>Param</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>ticker</td><td>string</td><td>Filter by asset symbol</td></tr>
          <tr><td>network</td><td>string</td><td>Filter by blockchain network</td></tr>
          <tr><td>type</td><td>string</td><td>exchange_inflow, exchange_outflow, or transfer</td></tr>
          <tr><td>minUsd</td><td>number</td><td>Minimum USD value threshold</td></tr>
          <tr><td>limit</td><td>number</td><td>Results per page (default 50, max 200)</td></tr>
          <tr><td>offset</td><td>number</td><td>Pagination offset</td></tr>
        </tbody>
      </table>

      <h2>Wallet Watchlists</h2>
      <p>Create custom watchlists to track specific whale addresses:</p>
      <ul>
        <li>100+ known exchange wallets are pre-loaded</li>
        <li>Add any wallet address to your personal watchlist</li>
        <li>Receive alerts when watched wallets make significant moves</li>
        <li>Tag wallets with custom labels for easy identification</li>
      </ul>

      <h2>Signal Integration</h2>
      <p>Whale flow data feeds into other TraderX systems:</p>
      <ul>
        <li>AI Copilot uses flow direction as a factor in confidence scoring</li>
        <li>Combo Alerts can trigger on whale flow + sentiment divergence</li>
        <li>Portfolio dashboard shows whale activity for tracked positions</li>
      </ul>
    </article>
  );
}
