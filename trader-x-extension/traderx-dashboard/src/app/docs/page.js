import Link from 'next/link';

export const metadata = {
  title: 'Documentation - TraderX Pro',
  description: 'Complete documentation for TraderX Pro: guides, API reference, integrations, and deployment.',
};

const sections = [
  {
    title: 'Product Documentation',
    links: [
      { label: 'Platform Overview', href: '/docs/overview', desc: 'Architecture, features, and getting started.' },
      { label: 'AI Copilot Guide', href: '/docs/ai-copilot', desc: 'Trade idea generation, confidence scoring, and performance tracking.' },
      { label: 'Whale Tracker Guide', href: '/docs/whale-tracker', desc: 'On-chain flow monitoring, exchange classification, and wallet watchlists.' },
      { label: 'Premium Plans & Billing', href: '/docs/pricing-billing', desc: 'Subscription tiers, Stripe integration, and license keys.' },
    ],
  },
  {
    title: 'Developer Documentation',
    links: [
      { label: 'API Reference', href: '/docs/api', desc: 'REST endpoints, authentication, rate limits, and response formats.' },
      { label: 'Webhook Events', href: '/docs/webhooks', desc: 'Stripe events, alert delivery, and custom webhook setup.' },
      { label: 'Environment Setup', href: '/docs/environment', desc: 'Local development, environment variables, and database setup.' },
      { label: 'Deployment Guide', href: '/docs/deployment', desc: 'Production deployment, Docker, monitoring, and scaling.' },
    ],
  },
  {
    title: 'Integration Guides',
    links: [
      { label: 'Telegram Bot Setup', href: '/docs/telegram-setup', desc: 'Bot registration, commands, and alert delivery.' },
      { label: 'Discord Bot Setup', href: '/docs/discord-bot-setup', desc: 'Slash commands, permissions, and channel configuration.' },
    ],
  },
];

export default function DocsIndex() {
  return (
    <div className="docs-index">
      <h1 className="docs-index-title">TraderX Pro Documentation</h1>
      <p className="docs-index-subtitle">
        Everything you need to set up, configure, and extend TraderX Pro.
      </p>

      {sections.map(section => (
        <section key={section.title} className="docs-section">
          <h2 className="docs-section-title">
            {section.title}
          </h2>
          <div className="docs-links-grid">
            {section.links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="docs-link-card"
              >
                <div className="docs-link-title">{link.label}</div>
                <div className="docs-link-desc">{link.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
