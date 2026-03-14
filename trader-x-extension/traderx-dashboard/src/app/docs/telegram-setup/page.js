export const metadata = {
  title: 'Telegram Bot Setup - TraderX Pro Docs',
  description: 'Set up and configure the TraderX Pro Telegram bot for alerts and commands.',
};

export default function TelegramSetupPage() {
  return (
    <article className="doc-article">
      <h1>Telegram Bot Setup</h1>
      <p className="lead">Configure the TraderX Pro Telegram bot for real-time alerts, portfolio queries, and signal notifications.</p>

      <h2>Prerequisites</h2>
      <ul>
        <li>A Telegram account</li>
        <li>TraderX Pro backend server running</li>
      </ul>

      <h2>Step 1: Create a Bot</h2>
      <ol>
        <li>Open Telegram and search for <strong>@BotFather</strong></li>
        <li>Send <code>/newbot</code> and follow the prompts</li>
        <li>Name your bot (e.g., &quot;TraderX Alerts&quot;)</li>
        <li>Copy the bot token provided by BotFather</li>
      </ol>

      <h2>Step 2: Configure Environment</h2>
      <p>Add the bot token to your server environment:</p>
      <div className="code-block"><code>{`TELEGRAM_BOT_TOKEN=your-bot-token-here
TELEGRAM_CHAT_ID=your-chat-id  # Optional: default alert channel`}</code></div>

      <h2>Step 3: Start the Bot</h2>
      <p>The Telegram bot starts automatically with the server. When you start the TraderX backend, the bot connects to the Telegram API and begins listening for commands.</p>

      <h2>Available Commands</h2>
      <table>
        <thead><tr><th>Command</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>/start</td><td>Register and get your API key</td></tr>
          <tr><td>/help</td><td>Show all available commands</td></tr>
          <tr><td>/watch &lt;ticker&gt;</td><td>Add ticker to watchlist</td></tr>
          <tr><td>/unwatch &lt;ticker&gt;</td><td>Remove ticker from watchlist</td></tr>
          <tr><td>/sentiment &lt;ticker&gt;</td><td>Get current sentiment analysis</td></tr>
          <tr><td>/alerts</td><td>List your active alerts</td></tr>
          <tr><td>/portfolio</td><td>View portfolio positions and P&amp;L</td></tr>
          <tr><td>/price &lt;ticker&gt;</td><td>Get current price data</td></tr>
          <tr><td>/rank</td><td>See top trending tickers</td></tr>
          <tr><td>/heatmap</td><td>Get sector-level sentiment heatmap</td></tr>
          <tr><td>/copilot &lt;ticker&gt;</td><td>Get AI trade idea</td></tr>
          <tr><td>/whale &lt;ticker&gt;</td><td>Check whale activity</td></tr>
          <tr><td>/export &lt;ticker&gt;</td><td>Export sentiment data</td></tr>
          <tr><td>/plan</td><td>Check subscription status</td></tr>
          <tr><td>/settings</td><td>Manage notification preferences</td></tr>
        </tbody>
      </table>

      <h2>Alert Delivery</h2>
      <p>When alerts trigger, the bot sends formatted messages including:</p>
      <ul>
        <li>Ticker symbol and alert type</li>
        <li>Signal details (sentiment score, confidence, price)</li>
        <li>Timestamp and contextual information</li>
        <li>Action buttons for quick responses</li>
      </ul>

      <h2>Troubleshooting</h2>
      <ul>
        <li><strong>Bot not responding</strong> — Verify the bot token is correct and the server is running</li>
        <li><strong>No alerts received</strong> — Ensure you&apos;ve started the bot with <code>/start</code> and have active alerts configured</li>
        <li><strong>Rate limited</strong> — Telegram limits bot messages; the server includes throttling to stay within limits</li>
      </ul>
    </article>
  );
}
