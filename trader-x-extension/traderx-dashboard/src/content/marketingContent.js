// trader-x-extension/traderx-dashboard/src/content/marketingContent.js
// Centralized content model for TraderX marketing website

export const siteMeta = {
  brand: "TraderX Pro",
  tagline: "AI-Powered Trading Intelligence Platform",
  heroTitle: "Turn Twitter/X Noise into Actionable Trade Signals",
  heroSubtitle:
    "Get AI trade ideas, whale flow intelligence, real-time sentiment, and institutional-grade analytics in one platform.",
  primaryCta: {
    label: "Download Extension",
    href: "https://github.com/bhrigu-verma/traderx-extension/releases/latest",
  },
  secondaryCta: {
    label: "View Pricing",
    href: "#pricing",
  },
  badgeText: "v1.0 · AI Copilot + Whale Tracker + Premium",
  socialProofLine:
    "Built for modern traders, analysts, and high-conviction signal hunters.",
};

export const topBanner = {
  enabled: true,
  text: "🚀 Launch Offer: Start your 7-day Pro trial today",
  ctaLabel: "Start Trial",
  ctaHref: "#pricing",
};

export const navItems = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Community", href: "#community" },
  { label: "Docs", href: "#docs" },
  { label: "FAQ", href: "#faq" },
];

export const heroStats = [
  { label: "Tiered Influencers Tracked", value: "250+" },
  { label: "Signals Processed", value: "Real-time" },
  { label: "Supported Asset Types", value: "Stocks + Crypto" },
  { label: "AI Confidence Filtering", value: "65%+" },
];

export const valueProps = [
  {
    title: "AI Trade Copilot",
    description:
      "Get high-confidence trade ideas with entry, stop-loss, targets, and reasoning in seconds.",
    icon: "BrainCircuit",
  },
  {
    title: "Whale Flow Intelligence",
    description:
      "Track large wallet movements and exchange flows to identify accumulation/distribution early.",
    icon: "Waves",
  },
  {
    title: "Real-time Sentiment Engine",
    description:
      "Analyze market sentiment from live X/Twitter chatter with influencer weighting and volume spikes.",
    icon: "Activity",
  },
];

export const coreFeatures = [
  {
    id: "ai-copilot",
    title: "AI Trading Copilot",
    headline: "Actionable ideas, not just dashboards.",
    bullets: [
      "Multi-signal scoring: sentiment + technical + volume + influencer context",
      "Confidence thresholding to reduce low-quality setups",
      "Entry, stop-loss, target levels + risk/reward framing",
      "Position sizing logic and historical performance view",
      "Fast UI overlays directly where traders already spend time",
    ],
    cta: { label: "Explore AI Copilot", href: "#pricing" },
  },
  {
    id: "whale-tracker",
    title: "Whale Tracker",
    headline: "Follow smart money behavior in near real-time.",
    bullets: [
      "Large transaction monitoring across major chains",
      "Exchange inflow/outflow classification",
      "Wallet watchlists and signal alerts",
      "Flow sentiment interpretation layer",
      "Combines on-chain behavior with social sentiment context",
    ],
    cta: { label: "See Whale Signals", href: "#community" },
  },
  {
    id: "sentiment",
    title: "Sentiment & Signal Stack",
    headline: "Institutional-grade signal synthesis.",
    bullets: [
      "Tiered influencer weighting system",
      "Volume spike + sentiment combination alerts",
      "Sector-level heat mapping",
      "Advanced ticker search and export workflows",
      "Portfolio sentiment alignment and monitoring",
    ],
    cta: { label: "View Signal Engine", href: "#docs" },
  },
];

export const howItWorksSteps = [
  {
    step: "01",
    title: "Install the extension",
    description:
      "Download the latest release zip from GitHub, then load it as an unpacked extension in Chrome. Open X/Twitter and the signal layer loads automatically.",
  },
  {
    step: "02",
    title: "Track your watchlist",
    description:
      "Add tickers to your watchlist and let the platform continuously analyze chatter + market context.",
  },
  {
    step: "03",
    title: "Receive AI insights",
    description:
      "Get AI Copilot ideas, combo alerts, and whale-flow signals with confidence-driven filtering.",
  },
  {
    step: "04",
    title: "Act with discipline",
    description:
      "Use entries, stops, targets, and position sizing guidance to execute with risk structure.",
  },
];

export const pricingTiers = [
  {
    key: "free",
    name: "Free",
    priceMonthly: "$0",
    subtitle: "Great for exploring core signal workflows.",
    cta: { label: "Get Started", href: "https://github.com/bhrigu-verma/traderx-extension/releases/latest" },
    features: [
      "Up to 5 tracked tickers",
      "Basic sentiment visibility",
      "Limited searches per month",
      "Core watchlist and filter controls",
    ],
    badge: null,
  },
  {
    key: "pro",
    name: "Pro",
    priceMonthly: "$49",
    subtitle: "For active traders who want AI edge.",
    cta: { label: "Start 7-Day Trial", href: "https://traderx.app/checkout/pro" },
    features: [
      "Up to 50 tracked tickers",
      "AI Trading Copilot",
      "Whale Tracker + flow alerts",
      "Advanced search + exports",
      "Portfolio tracking + sentiment alignment",
      "Priority support",
    ],
    badge: "Most Popular",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    priceMonthly: "$199",
    subtitle: "For teams, funds, and research ops.",
    cta: { label: "Contact Sales", href: "mailto:sales@traderx.app" },
    features: [
      "Unlimited/expanded limits",
      "API and webhook access",
      "Team workflows",
      "White-label and advanced support options",
      "Custom onboarding",
    ],
    badge: "For Teams",
  },
];

export const comparisonTable = {
  columns: ["Feature", "Free", "Pro", "Enterprise"],
  rows: [
    ["Tracked Tickers", "5", "50", "Custom / High Limits"],
    ["AI Copilot", "—", "✓", "✓"],
    ["Whale Tracker", "—", "✓", "✓"],
    ["Advanced Export", "—", "✓", "✓"],
    ["API/Webhooks", "—", "—", "✓"],
    ["Priority Support", "—", "Email Priority", "Dedicated"],
  ],
};

export const testimonials = [
  {
    quote:
      "TraderX helps me cut through hype fast. The AI ideas and whale flow context are insanely useful.",
    name: "A. Patel",
    role: "Independent Trader",
  },
  {
    quote:
      "Our team uses it as a signal triage layer before deeper research. Saves us hours every day.",
    name: "M. Chen",
    role: "Research Analyst",
  },
  {
    quote:
      "The extension-native workflow is the killer feature. Signals appear where attention already is.",
    name: "J. Romero",
    role: "Quant Hobbyist",
  },
];

export const faqItems = [
  {
    q: "Is TraderX financial advice?",
    a: "No. TraderX provides data-driven insights and alerts for educational and informational use only.",
  },
  {
    q: "Do I need API keys to use the extension?",
    a: "Core features work without custom keys. Some advanced and server-side capabilities may require configuration.",
  },
  {
    q: "Can I cancel Pro anytime?",
    a: "Yes. You can cancel from your billing portal and your plan remains active through the current billing period.",
  },
  {
    q: "Does TraderX support both stocks and crypto?",
    a: "Yes. The platform is built to support mixed watchlists and cross-asset sentiment workflows.",
  },
  {
    q: "Where can I request features or report bugs?",
    a: "Use GitHub issues, Discord support channels, or email support@traderx.app.",
  },
];

export const docsSections = [
  {
    title: "Product Documentation",
    links: [
      { label: "Platform Overview", href: "/docs/overview" },
      { label: "AI Copilot Guide", href: "/docs/ai-copilot" },
      { label: "Whale Tracker Guide", href: "/docs/whale-tracker" },
      { label: "Premium Plans & Billing", href: "/docs/pricing-billing" },
    ],
  },
  {
    title: "Developer Documentation",
    links: [
      { label: "API Reference", href: "/docs/api" },
      { label: "Webhook Events", href: "/docs/webhooks" },
      { label: "Environment Setup", href: "/docs/environment" },
      { label: "Deployment Guide", href: "/docs/deployment" },
    ],
  },
];

export const communityLinks = {
  telegram: {
    label: "Join Telegram",
    href: "https://t.me/REPLACE_WITH_TRADERX_CHANNEL",
    description: "Announcements, updates, and high-signal drops.",
  },
  discord: {
    label: "Join Discord",
    href: "https://discord.gg/REPLACE_WITH_INVITE",
    description: "Live discussion, support, bots, and community alpha.",
  },
  x: {
    label: "Follow on X",
    href: "https://x.com/REPLACE_WITH_HANDLE",
    description: "Launch updates, feature demos, and public signal previews.",
  },
};

export const discordBotDocs = {
  title: "Discord Bot Setup (Detailed)",
  intro:
    "Use this section to publish a complete Discord bot setup guide aligned with your Telegram workflow.",
  prerequisites: [
    "A Discord account with admin permissions in your server",
    "Node.js 18+ on your bot/server machine",
    "A running TraderX backend (or planned backend endpoint)",
    "Environment variable support (.env or secret manager)",
  ],
  steps: [
    {
      title: "1) Create a Discord Application",
      points: [
        "Open Discord Developer Portal: https://discord.com/developers/applications",
        "Click 'New Application', name it (e.g., TraderX Bot), and create.",
        "Go to 'Bot' tab and click 'Add Bot'.",
      ],
    },
    {
      title: "2) Configure Bot Permissions & Intents",
      points: [
        "Enable privileged intents required by your command flow:",
        "- MESSAGE CONTENT INTENT (if parsing message text)",
        "- SERVER MEMBERS INTENT (if user-gating by role)",
        "Recommended minimum permissions:",
        "- View Channels",
        "- Send Messages",
        "- Embed Links",
        "- Attach Files (optional)",
        "- Read Message History",
        "- Use Application Commands",
      ],
    },
    {
      title: "3) Generate Bot Token Securely",
      points: [
        "In Bot tab, click 'Reset Token' and copy token once.",
        "Store it in secret manager or .env as DISCORD_BOT_TOKEN.",
        "Never commit tokens to source control.",
      ],
    },
    {
      title: "4) Invite Bot to Server",
      points: [
        "Go to OAuth2 → URL Generator.",
        "Scopes: bot + applications.commands",
        "Permissions: select those from step 2.",
        "Generate URL, open it, and invite bot to target server.",
      ],
    },
    {
      title: "5) Wire Environment Variables",
      points: [
        "Set DISCORD_BOT_TOKEN in backend runtime.",
        "Set optional variables for channels and role gating:",
        "- DISCORD_GUILD_ID",
        "- DISCORD_ALERT_CHANNEL_ID",
        "- DISCORD_SUPPORT_CHANNEL_ID",
        "- DISCORD_ADMIN_ROLE_ID",
      ],
    },
    {
      title: "6) Implement Core Slash Commands",
      points: [
        "Recommended commands for parity with Telegram:",
        "/start – register or link user profile",
        "/watch <ticker> – add ticker to watchlist",
        "/unwatch <ticker> – remove ticker",
        "/sentiment <ticker> – fetch current sentiment snapshot",
        "/alerts – list active alerts",
        "/portfolio – show position summary",
        "/help – show command list and quick links",
      ],
    },
    {
      title: "7) Add Alert Delivery Logic",
      points: [
        "Route trader alerts to direct messages and/or configured channel.",
        "Use embeds for readability (ticker, signal type, confidence, timestamp).",
        "Add throttling/cooldown to avoid channel spam.",
      ],
    },
    {
      title: "8) Add Role-Based Access (Optional)",
      points: [
        "Map Pro/Enterprise users to Discord roles.",
        "Restrict premium commands to specific roles.",
        "Sync subscription status periodically from backend.",
      ],
    },
    {
      title: "9) Production Hardening",
      points: [
        "Add retry logic, rate-limit handling, and structured logging.",
        "Monitor bot uptime and command error rates.",
        "Set up alerting for token invalidation and gateway disconnects.",
      ],
    },
  ],
  sampleEnv: [
    "DISCORD_BOT_TOKEN=replace_me",
    "DISCORD_GUILD_ID=replace_me",
    "DISCORD_ALERT_CHANNEL_ID=replace_me",
    "DISCORD_SUPPORT_CHANNEL_ID=replace_me",
    "DISCORD_ADMIN_ROLE_ID=replace_me",
  ],
  securityChecklist: [
    "Do not store bot token in frontend code",
    "Restrict invite permissions to minimum needed",
    "Rotate token immediately if leaked",
    "Audit command permissions quarterly",
    "Log moderation-impacting commands",
  ],
};

export const telegramDiscordSection = {
  title: "Connect with the TraderX Community",
  subtitle:
    "Stay updated, ask questions, and get fast support through Telegram and Discord.",
  cards: [
    {
      platform: "Telegram",
      description:
        "Announcements, patch notes, and product updates. Great for one-way signal drops.",
      buttonLabel: "Open Telegram",
      href: "https://t.me/REPLACE_WITH_TRADERX_CHANNEL",
    },
    {
      platform: "Discord",
      description:
        "Interactive community, support channels, feature requests, and bot-enabled workflows.",
      buttonLabel: "Open Discord",
      href: "https://discord.gg/REPLACE_WITH_INVITE",
    },
  ],
};

export const seoContent = {
  h1Variants: [
    "Best AI Trading Extension for Twitter/X",
    "Twitter Sentiment Analyzer for Stocks and Crypto",
    "AI Copilot for Traders",
  ],
  keywordClusters: [
    "twitter trading extension",
    "ai trading signals",
    "crypto whale tracker",
    "stock sentiment analysis tool",
    "trading discord bot",
    "telegram trading alerts",
    "retail trader intelligence platform",
  ],
  metaDescription:
    "TraderX Pro is an AI-powered trading intelligence extension for Twitter/X with sentiment analysis, whale tracking, and actionable trade ideas.",
};

export const footer = {
  columns: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Docs", href: "#docs" },
        { label: "Changelog", href: "/changelog" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Telegram", href: "https://t.me/REPLACE_WITH_TRADERX_CHANNEL" },
        { label: "Discord", href: "https://discord.gg/REPLACE_WITH_INVITE" },
        { label: "X / Twitter", href: "https://x.com/REPLACE_WITH_HANDLE" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Support", href: "mailto:support@traderx.app" },
        { label: "Contact Sales", href: "mailto:sales@traderx.app" },
      ],
    },
  ],
  disclaimer:
    "TraderX is for informational and educational purposes only. It does not provide investment advice.",
  copyright: `© ${new Date().getFullYear()} TraderX Pro. All rights reserved.`,
};

const marketingContent = {
  siteMeta,
  topBanner,
  navItems,
  heroStats,
  valueProps,
  coreFeatures,
  howItWorksSteps,
  pricingTiers,
  comparisonTable,
  testimonials,
  faqItems,
  docsSections,
  communityLinks,
  telegramDiscordSection,
  discordBotDocs,
  seoContent,
  footer,
};

export default marketingContent;
