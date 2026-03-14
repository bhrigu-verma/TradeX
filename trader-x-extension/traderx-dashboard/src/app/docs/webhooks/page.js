export const metadata = {
  title: 'Webhook Events - TraderX Pro Docs',
  description: 'Configure webhook events for Stripe billing, alert delivery, and custom integrations.',
};

export default function WebhooksPage() {
  return (
    <article className="doc-article">
      <h1>Webhook Events</h1>
      <p className="lead">Handle Stripe billing events, alert delivery, and custom integrations via webhooks.</p>

      <h2>Stripe Webhooks</h2>
      <p>The server listens at <code>/webhooks/stripe</code> for Stripe events. Signature verification is enforced using <code>STRIPE_WEBHOOK_SECRET</code>.</p>

      <h3>Handled Events</h3>
      <table>
        <thead><tr><th>Event</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>checkout.session.completed</td><td>Creates or updates subscription, sets tier to pro</td></tr>
          <tr><td>customer.subscription.updated</td><td>Syncs status (active, past_due, cancelled)</td></tr>
          <tr><td>customer.subscription.deleted</td><td>Downgrades user to free tier</td></tr>
          <tr><td>invoice.payment_succeeded</td><td>Updates period_end timestamp</td></tr>
          <tr><td>invoice.payment_failed</td><td>Marks subscription as past_due</td></tr>
          <tr><td>customer.deleted</td><td>Removes Stripe customer association</td></tr>
        </tbody>
      </table>

      <h2>Alert Webhooks (Custom)</h2>
      <p>Enterprise users can configure custom webhook endpoints to receive alert notifications:</p>

      <h3>Payload Format</h3>
      <div className="code-block"><code>{`{
  "event": "alert.triggered",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "ticker": "BTC",
    "alert_type": "sentiment_flip",
    "signal": "bearish_to_bullish",
    "confidence": 78,
    "price": 98500,
    "message": "BTC sentiment flipped bullish with 78% confidence"
  }
}`}</code></div>

      <h3>Retry Policy</h3>
      <ul>
        <li>Webhooks are retried up to 3 times on failure</li>
        <li>Retry intervals: 1 minute, 5 minutes, 30 minutes</li>
        <li>Endpoint must respond with 2xx within 10 seconds</li>
        <li>After 3 failures, the endpoint is disabled and the user is notified</li>
      </ul>

      <h2>Setup</h2>
      <h3>Stripe Webhook Configuration</h3>
      <ol>
        <li>Go to the Stripe Dashboard → Developers → Webhooks</li>
        <li>Add endpoint: <code>https://api.traderx.app/webhooks/stripe</code></li>
        <li>Select events listed above</li>
        <li>Copy the signing secret to <code>STRIPE_WEBHOOK_SECRET</code> env var</li>
      </ol>

      <h3>Custom Webhook Configuration</h3>
      <ol>
        <li>Navigate to Settings → Integrations in the dashboard</li>
        <li>Add your webhook URL</li>
        <li>Select which alert types to receive</li>
        <li>Optionally add a secret header for verification</li>
      </ol>
    </article>
  );
}
