export const metadata = {
  title: 'API Reference - TraderX Pro Docs',
  description: 'Complete REST API reference for TraderX Pro: authentication, endpoints, rate limits, and response formats.',
};

export default function ApiReferencePage() {
  return (
    <article className="doc-article">
      <h1>API Reference</h1>
      <p className="lead">Complete REST API documentation for the TraderX Pro backend server.</p>

      <h2>Base URL</h2>
      <div className="code-block"><code>https://api.traderx.app/api</code></div>

      <h2>Authentication</h2>
      <p>TraderX supports two authentication methods:</p>

      <h3>1. API Key (for Chrome extension)</h3>
      <div className="code-block"><code>X-API-Key: your-api-key-here</code></div>

      <h3>2. JWT Bearer Token (for dashboard/apps)</h3>
      <div className="code-block"><code>Authorization: Bearer eyJhbGciOiJIUzI1NiI...</code></div>

      <h2>Auth Endpoints</h2>
      <table>
        <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>POST</td><td>/auth/register</td><td>Create account (email, password, username)</td></tr>
          <tr><td>POST</td><td>/auth/login</td><td>Login, returns access + refresh tokens</td></tr>
          <tr><td>POST</td><td>/auth/refresh</td><td>Rotate refresh token</td></tr>
          <tr><td>POST</td><td>/auth/logout</td><td>Invalidate refresh token</td></tr>
          <tr><td>GET</td><td>/auth/me</td><td>Get current user profile</td></tr>
        </tbody>
      </table>

      <h2>Sentiment Endpoints</h2>
      <table>
        <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>GET</td><td>/sentiment/aggregate/:ticker</td><td>Aggregated sentiment for a ticker</td></tr>
          <tr><td>GET</td><td>/sentiment/history/:ticker</td><td>Sentiment history over time</td></tr>
          <tr><td>POST</td><td>/sentiment/submit</td><td>Submit sentiment observation</td></tr>
        </tbody>
      </table>

      <h2>Portfolio Endpoints</h2>
      <table>
        <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>GET</td><td>/portfolio/positions</td><td>List all positions</td></tr>
          <tr><td>POST</td><td>/portfolio/positions</td><td>Open a new position</td></tr>
          <tr><td>GET</td><td>/portfolio/summary</td><td>Portfolio summary with P&L</td></tr>
        </tbody>
      </table>

      <h2>Alert Endpoints</h2>
      <table>
        <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>GET</td><td>/alerts</td><td>List all alerts</td></tr>
          <tr><td>POST</td><td>/alerts</td><td>Create a new alert</td></tr>
          <tr><td>PATCH</td><td>/alerts/:id/toggle</td><td>Enable/disable alert</td></tr>
          <tr><td>DELETE</td><td>/alerts/:id</td><td>Delete an alert</td></tr>
        </tbody>
      </table>

      <h2>Whale Endpoints</h2>
      <table>
        <thead><tr><th>Method</th><th>Endpoint</th></tr></thead>
        <tbody>
          <tr><td>GET</td><td>/whale/transactions</td></tr>
          <tr><td>GET</td><td>/whale/flow/:ticker</td></tr>
          <tr><td>POST</td><td>/whale/transactions</td></tr>
          <tr><td>GET</td><td>/whale/summary</td></tr>
        </tbody>
      </table>

      <h2>Copilot Endpoints</h2>
      <table>
        <thead><tr><th>Method</th><th>Endpoint</th></tr></thead>
        <tbody>
          <tr><td>GET</td><td>/copilot/ideas</td></tr>
          <tr><td>POST</td><td>/copilot/ideas</td></tr>
          <tr><td>GET</td><td>/copilot/generate/:ticker</td></tr>
          <tr><td>POST</td><td>/copilot/feedback</td></tr>
          <tr><td>GET</td><td>/copilot/performance</td></tr>
        </tbody>
      </table>

      <h2>Rate Limits</h2>
      <table>
        <thead><tr><th>Tier</th><th>Limit</th></tr></thead>
        <tbody>
          <tr><td>Free</td><td>100 requests/minute</td></tr>
          <tr><td>Pro</td><td>500 requests/minute</td></tr>
          <tr><td>Enterprise</td><td>1000 requests/minute</td></tr>
        </tbody>
      </table>

      <h2>Error Responses</h2>
      <p>All errors follow a consistent format:</p>
      <div className="code-block">
        <code>{`{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "status": 400
}`}</code>
      </div>
    </article>
  );
}
