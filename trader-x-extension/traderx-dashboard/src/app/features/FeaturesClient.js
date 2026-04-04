'use client';
import { motion } from 'framer-motion';
import { Check, BrainCircuit, Waves, BarChart3, Shield, Zap, Bell, Download, LineChart, Eye, TrendingUp, Target, Code, Smartphone } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import StaggerContainer, { StaggerItem } from '@/components/ui/StaggerContainer';
import GlassCard from '@/components/ui/GlassCard';
import GlowButton from '@/components/ui/GlowButton';
import SectionHeading from '@/components/ui/SectionHeading';
import FloatingOrbs from '@/components/ui/FloatingOrbs';

const features = [
  {
    icon: <BrainCircuit size={32} />,
    title: 'AI Trading Copilot',
    headline: 'Actionable trade ideas, not just dashboards.',
    description: 'Our FinBERT-powered engine analyzes sentiment, volume, technicals, and influencer credibility simultaneously. It delivers high-confidence trade setups with precise entry, stop-loss, and target levels — complete with risk/reward framing and position sizing guidance.',
    items: [
      'Multi-signal scoring: sentiment + technical + volume + influencer context',
      'Confidence thresholding (65%+ filter) to eliminate noise',
      'Automated position sizing with Kelly Criterion logic',
      'Historical performance tracking with win rate and profit factor',
      'Risk/Reward filtering (minimum 2:1 R:R ratio)',
      'Real-time idea generation as market conditions evolve',
    ],
    color: '#34D399',
    direction: 'left',
  },
  {
    icon: <Waves size={32} />,
    title: 'Whale Flow Intelligence',
    headline: 'Follow smart money in near real-time.',
    description: 'Track $100K+ wallet movements across Bitcoin, Ethereum, Solana, and BSC. Our system classifies exchange inflows vs. outflows, tags known wallets, and overlays on-chain behavior with social sentiment to give you the full picture before everyone else.',
    items: [
      'Monitor $100K+ crypto transactions in near real-time',
      'Exchange inflow/outflow classification (bullish vs bearish signals)',
      'Multi-chain support: Bitcoin, Ethereum, Solana, BSC',
      '100+ known exchange wallets pre-loaded',
      'Custom wallet watchlists for tracking specific whales',
      'Flow sentiment scoring combined with social signals',
    ],
    color: '#2DD4BF',
    direction: 'right',
  },
  {
    icon: <BarChart3 size={32} />,
    title: 'Sentiment & Signal Engine',
    headline: 'Institutional-grade signal synthesis.',
    description: 'Not all tweets are created equal. Our tiered influencer weighting system assigns trust scores, detects volume spikes with Z-score alerting, and applies negation-aware NLP. Time-decay ensures you act on fresh signals, not stale ones.',
    items: [
      'Tiered influencer weighting system (3 tiers by trust score)',
      'Volume spike detection with Z-score alerting',
      'Negation-aware keyword analysis (advanced NLP)',
      'Time-decay weighting for recent vs stale signals',
      'Engagement-weighted scoring (likes, retweets, replies)',
      'Sector-level heat mapping across your entire watchlist',
    ],
    color: '#10B981',
    direction: 'left',
  },
  {
    icon: <Download size={32} />,
    title: 'Infinite Tweet Scraper & Exporter',
    headline: 'Capture every tweet. Export everything.',
    description: 'X.com uses virtual scrolling that destroys DOM nodes as you scroll. Our MutationObserver engine runs in the background, caching every visible tweet into memory. Export hundreds (or thousands) of tweets directly to CSV, JSON, or AI-ready prompt format.',
    items: [
      'Background MutationObserver bypasses X.com DOM destruction',
      'In-memory tweet cache survives infinite scroll sessions',
      'Export to CSV with structured columns (user, text, metrics, date)',
      'Export to JSON for programmatic analysis pipelines',
      'AI-ready prompt formatter for ChatGPT/Claude analysis',
      'Real-time count display and one-click stop button',
    ],
    color: '#22C55E',
    direction: 'right',
  },
  {
    icon: <Bell size={32} />,
    title: 'Combo Alerts & Portfolio Tracking',
    headline: 'Get notified when conditions align perfectly.',
    description: 'Set multi-condition alert triggers that fire only when everything lines up. Track long/short positions with real-time P&L, detect sentiment divergences, and receive notifications across Telegram, Discord, or custom webhooks.',
    items: [
      'Track long/short positions with real-time P&L',
      'Sentiment divergence alerts (price vs. sentiment mismatch)',
      'Influencer burst alerts (multiple high-tier tweets in short window)',
      'Volume + sentiment combination triggers',
      'Sentiment flip detection (bearish to bullish transitions)',
      'Multi-channel delivery: Telegram, Discord, webhooks',
    ],
    color: '#F59E0B',
    direction: 'left',
  },
  {
    icon: <Shield size={32} />,
    title: 'Enterprise Security & API',
    headline: 'Built for teams, funds, and research ops.',
    description: 'JWT-based authentication with refresh token rotation, API key auth for the Chrome extension bridge, tier-based rate limiting, encrypted data at rest, and full GDPR compliance. REST API access enables integration with any algorithmic strategy.',
    items: [
      'JWT-based authentication with refresh token rotation',
      'API key authentication for Chrome extension bridge',
      'Rate limiting per user tier (100-1000 req/min)',
      'Data encryption at rest and in transit',
      'REST API access for algorithmic strategies',
      'Webhook delivery for custom integrations',
    ],
    color: '#059669',
    direction: 'right',
  },
];

export default function FeaturesClient() {
  return (
    <div className="features-page">
      <FloatingOrbs />

      {/* Hero */}
      <section className="features-hero">
        <FadeIn direction="up">
          <SectionHeading
            badge="FEATURES"
            title="Every Feature, Explained"
            subtitle="Six powerful capabilities working together to give you the most comprehensive trading intelligence layer available."
          />
        </FadeIn>
      </section>

      {/* Feature Sections */}
      {features.map((f, i) => (
        <section key={f.title} className="feature-block">
          <div className={`feature-block-inner ${i % 2 === 1 ? 'feature-reverse' : ''}`}>
            {/* Text Side */}
            <FadeIn direction={f.direction} className="feature-text-side">
              <div className="feature-icon-wrap" style={{ background: `${f.color}15`, color: f.color }}>
                {f.icon}
              </div>
              <h2 className="feature-title">{f.title}</h2>
              <h3 className="feature-headline">{f.headline}</h3>
              <p className="feature-description">{f.description}</p>
              <GlowButton href="/pricing" variant="ghost" size="sm">
                Get Started →
              </GlowButton>
            </FadeIn>

            {/* Checklist Side */}
            <FadeIn direction={f.direction === 'left' ? 'right' : 'left'} delay={0.15} className="feature-list-side">
              <GlassCard hover={false} padding="32px">
                <ul className="feature-checklist">
                  {f.items.map((item, j) => (
                    <motion.li
                      key={j}
                      className="feature-check-item"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.06 }}
                    >
                      <span className="check-icon" style={{ color: f.color }}><Check size={16} /></span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </GlassCard>
            </FadeIn>
          </div>
        </section>
      ))}

      <style>{`
        .features-page { position: relative; z-index: 1; }
        .features-hero {
          padding: 80px 24px 40px;
          text-align: center;
        }
        .feature-block {
          padding: 60px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .feature-block-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .feature-reverse { direction: rtl; }
        .feature-reverse > * { direction: ltr; }
        .feature-text-side { }
        .feature-icon-wrap {
          width: 64px; height: 64px;
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
        }
        .feature-title {
          font-size: 14px; font-weight: 700;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 8px;
        }
        .feature-headline {
          font-size: 30px; font-weight: 800; color: white;
          margin: 0 0 16px; letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .feature-description {
          font-size: 15px; color: rgba(255,255,255,0.5);
          line-height: 1.7; margin: 0 0 28px;
        }
        .feature-list-side { }
        .feature-checklist {
          list-style: none; padding: 0; margin: 0;
        }
        .feature-check-item {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 14px; color: rgba(255,255,255,0.65);
          padding: 10px 0;
          line-height: 1.5;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .feature-check-item:last-child { border-bottom: none; }
        .check-icon { flex-shrink: 0; margin-top: 2px; }
        @media (max-width: 860px) {
          .feature-block-inner {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .feature-reverse { direction: ltr; }
        }
      `}</style>
    </div>
  );
}
