export const metadata = {
  title: 'AI Copilot Guide - TraderX Pro Docs',
  description: 'Learn how the AI Trading Copilot generates trade ideas with confidence scoring and performance tracking.',
};

export default function AICopilotPage() {
  return (
    <article className="doc-article">
      <h1>AI Trading Copilot</h1>
      <p className="lead">Get high-confidence trade ideas with entry, stop-loss, and target levels backed by multi-signal analysis.</p>

      <h2>How It Works</h2>
      <p>The AI Copilot synthesizes multiple data inputs to generate actionable trade ideas:</p>
      <ol>
        <li><strong>Sentiment Score</strong> — Aggregated sentiment from tiered influencers, weighted by trust score and engagement</li>
        <li><strong>Volume Analysis</strong> — Tweet volume relative to historical baseline (Z-score)</li>
        <li><strong>Price Context</strong> — Current price, recent trend direction, and volatility</li>
        <li><strong>Influencer Signals</strong> — Count and quality of high-tier influencer mentions</li>
      </ol>

      <h2>Confidence Scoring</h2>
      <p>Every idea receives a confidence score from 0-100. Only ideas above the <strong>65% threshold</strong> are surfaced by default. Confidence is computed from:</p>
      <ul>
        <li>Sentiment magnitude and consistency across sources</li>
        <li>Volume spike strength relative to baseline</li>
        <li>Influencer tier distribution (Tier 1 contributions weighted 3x)</li>
        <li>Price trend alignment with sentiment direction</li>
      </ul>

      <h2>Trade Idea Structure</h2>
      <table>
        <thead><tr><th>Field</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>Ticker</td><td>Asset symbol (e.g., BTC, AAPL)</td></tr>
          <tr><td>Direction</td><td>LONG or SHORT</td></tr>
          <tr><td>Confidence</td><td>0-100 score representing signal strength</td></tr>
          <tr><td>Entry Price</td><td>Suggested entry based on current market price</td></tr>
          <tr><td>Stop Loss</td><td>Calculated at 3% from entry by default</td></tr>
          <tr><td>Target Price</td><td>Based on 2.5:1 risk-reward ratio</td></tr>
          <tr><td>Reasoning</td><td>Human-readable explanation of signal factors</td></tr>
        </tbody>
      </table>

      <h2>Performance Tracking</h2>
      <p>Track historical accuracy of generated ideas:</p>
      <ul>
        <li><strong>Win Rate</strong> — Percentage of ideas that hit target before stop</li>
        <li><strong>Profit Factor</strong> — Total wins / total losses ratio</li>
        <li><strong>By Ticker</strong> — Performance breakdown per asset</li>
        <li><strong>Feedback Loop</strong> — Mark ideas as won/lost/breakeven/skipped to improve future scoring</li>
      </ul>

      <h2>API Endpoints</h2>
      <div className="code-block">
        <code>GET  /api/copilot/ideas          — List recent trade ideas</code><br/>
        <code>POST /api/copilot/ideas          — Submit a new trade idea</code><br/>
        <code>GET  /api/copilot/generate/:ticker — Auto-generate idea for ticker</code><br/>
        <code>POST /api/copilot/feedback        — Submit outcome feedback</code><br/>
        <code>GET  /api/copilot/performance     — View aggregate performance</code>
      </div>

      <h2>Best Practices</h2>
      <ul>
        <li>Use the confidence filter to focus on high-conviction setups</li>
        <li>Always verify AI ideas against your own analysis before trading</li>
        <li>Submit feedback on outcomes to improve the system over time</li>
        <li>Monitor performance metrics weekly to assess signal quality</li>
      </ul>
    </article>
  );
}
