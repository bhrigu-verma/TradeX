export const metadata = {
  title: 'Pricing & Billing - TraderX Pro Docs',
  description: 'Understand TraderX Pro subscription tiers, Stripe billing, license keys, and feature limits.',
};

export default function PricingBillingPage() {
  return (
    <article className="doc-article">
      <h1>Pricing &amp; Billing</h1>
      <p className="lead">Everything about subscription tiers, Stripe integration, license key activation, and feature limits.</p>

      <h2>Subscription Tiers</h2>
      <table>
        <thead><tr><th>Feature</th><th>Free</th><th>Pro ($49/mo)</th><th>Enterprise ($199/mo)</th></tr></thead>
        <tbody>
          <tr><td>Tracked Tickers</td><td>5</td><td>50</td><td>Custom</td></tr>
          <tr><td>AI Copilot</td><td>—</td><td>✓</td><td>✓</td></tr>
          <tr><td>Whale Tracker</td><td>—</td><td>✓</td><td>✓</td></tr>
          <tr><td>Advanced Export</td><td>—</td><td>✓</td><td>✓</td></tr>
          <tr><td>API / Webhooks</td><td>—</td><td>—</td><td>✓</td></tr>
          <tr><td>Rate Limit</td><td>100/min</td><td>500/min</td><td>1000/min</td></tr>
          <tr><td>Support</td><td>Community</td><td>Email Priority</td><td>Dedicated</td></tr>
        </tbody>
      </table>

      <h2>Stripe Checkout</h2>
      <p>Subscriptions are managed through Stripe. When a user subscribes:</p>
      <ol>
        <li>A Stripe Checkout session is created via <code>POST /api/subscription/create-checkout</code></li>
        <li>User completes payment on Stripe&apos;s hosted checkout page</li>
        <li>Stripe sends a <code>checkout.session.completed</code> webhook to our server</li>
        <li>The server updates the user&apos;s subscription record and tier</li>
        <li>Pro features are immediately unlocked</li>
      </ol>

      <h2>Trial Period</h2>
      <p>New Pro subscribers receive a <strong>7-day free trial</strong>. During the trial:</p>
      <ul>
        <li>Full Pro features are available</li>
        <li>No charge until the trial period ends</li>
        <li>Cancel anytime before trial ends to avoid charges</li>
        <li>Trial status is tracked via <code>trial_end</code> in the subscription record</li>
      </ul>

      <h2>License Key Activation</h2>
      <p>Enterprise customers can activate via license key instead of Stripe:</p>
      <ul>
        <li>Format: <code>TRADERX-PRO-XXXX-XXXX</code></li>
        <li>Activate via <code>POST /api/subscription/activate</code></li>
        <li>Keys are single-use and tied to a user account</li>
        <li>Enterprise keys grant 365-day access by default</li>
      </ul>

      <h2>Billing Management</h2>
      <p>Users can manage their subscription through the Stripe billing portal:</p>
      <ul>
        <li><strong>Update payment method</strong> — Change credit card or payment details</li>
        <li><strong>Cancel subscription</strong> — Cancels at end of current billing period</li>
        <li><strong>Reactivate</strong> — Resume a cancelled subscription before period ends</li>
        <li><strong>View invoices</strong> — Access payment history and receipts</li>
      </ul>

      <h2>Webhook Events</h2>
      <p>The server listens for these Stripe webhook events:</p>
      <table>
        <thead><tr><th>Event</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>checkout.session.completed</td><td>Create/update subscription record</td></tr>
          <tr><td>customer.subscription.updated</td><td>Sync status changes</td></tr>
          <tr><td>customer.subscription.deleted</td><td>Downgrade to free tier</td></tr>
          <tr><td>invoice.payment_succeeded</td><td>Extend subscription period</td></tr>
          <tr><td>invoice.payment_failed</td><td>Flag payment issue</td></tr>
        </tbody>
      </table>
    </article>
  );
}
