'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Minus, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import StaggerContainer, { StaggerItem } from '@/components/ui/StaggerContainer';
import GlassCard from '@/components/ui/GlassCard';
import GlowButton from '@/components/ui/GlowButton';
import SectionHeading from '@/components/ui/SectionHeading';
import FloatingOrbs from '@/components/ui/FloatingOrbs';

const tiers = [
  {
    key: 'free',
    name: 'Hobbyist',
    price: { monthly: '$0', yearly: '$0' },
    subtitle: 'Perfect for exploring core signal workflows.',
    badge: null,
    featured: false,
    features: [
      'Up to 5 tracked tickers',
      'Basic sentiment visibility',
      'Limited searches per month',
      'Core watchlist & filter controls',
      'Standard community access',
    ],
    cta: { label: 'Get Started Free', href: '#' },
  },
  {
    key: 'pro',
    name: 'Pro Trader',
    price: { monthly: '$19', yearly: '$15' },
    subtitle: 'For active traders who want AI-powered edge.',
    badge: 'Most Popular',
    featured: true,
    features: [
      'Up to 50 tracked tickers',
      'AI Trading Copilot',
      'Whale Tracker + flow alerts',
      'Advanced search + unlimited exports',
      'Portfolio tracking + sentiment alignment',
      'Combo alerts (multi-condition)',
      'Telegram + Discord delivery',
      'Priority email support',
    ],
    cta: { label: 'Start 7-Day Free Trial', href: '#' },
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: { monthly: '$99', yearly: '$79' },
    subtitle: 'For teams, funds, and research operations.',
    badge: 'For Teams',
    featured: false,
    features: [
      'Unlimited tracked tickers',
      'Everything in Pro',
      'REST API + webhook access',
      'Team workflows & shared watchlists',
      'White-label options',
      'Custom onboarding & training',
      'Dedicated account manager',
      'SLA & uptime guarantees',
    ],
    cta: { label: 'Contact Sales', href: 'mailto:sales@traderx.app' },
  },
];

const comparisonRows = [
  ['Tracked Tickers', '5', '50', 'Unlimited'],
  ['AI Copilot', false, true, true],
  ['Whale Tracker', false, true, true],
  ['Combo Alerts', false, true, true],
  ['Advanced Export', false, true, true],
  ['API / Webhooks', false, false, true],
  ['Telegram + Discord', false, true, true],
  ['Priority Support', false, 'Email', 'Dedicated'],
  ['Team Workflows', false, false, true],
  ['Custom Onboarding', false, false, true],
];

const faqItems = [
  { q: 'Is TraderX financial advice?', a: 'No. TraderX provides data-driven insights and alerts for educational and informational use only. Always do your own research and consult a licensed financial advisor before making trading decisions.' },
  { q: 'Do I need API keys to use the extension?', a: 'Core features work without custom keys. Some advanced and server-side capabilities (like Telegram bot delivery) may require configuration via the settings panel.' },
  { q: 'Can I cancel Pro anytime?', a: 'Yes. You can cancel from your billing portal anytime. Your plan remains active through the end of the current billing period with no further charges.' },
  { q: 'Does TraderX support both stocks and crypto?', a: 'Yes. The platform is built to support mixed watchlists across equities, crypto, and other asset types with unified sentiment analysis.' },
  { q: 'What browsers are supported?', a: 'TraderX works on all Chromium-based browsers: Google Chrome, Brave, Arc, Microsoft Edge, and Opera.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use JWT authentication, encrypt data at rest and in transit, and are fully GDPR-compliant. We never sell user data.' },
];

export default function PricingClient() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="pricing-page">
      <FloatingOrbs />

      {/* Hero */}
      <section className="pricing-hero">
        <FadeIn direction="up">
          <SectionHeading
            badge="PRICING"
            title="Invest in Your Edge"
            subtitle="Start free. Upgrade when you need AI Copilot, Whale Tracker, and premium analytics."
          />
        </FadeIn>

        {/* Billing Toggle */}
        <FadeIn direction="up" delay={0.2}>
          <div className="billing-toggle">
            <span className={!yearly ? 'toggle-active' : 'toggle-inactive'}>Monthly</span>
            <motion.button
              className="toggle-switch"
              onClick={() => setYearly(!yearly)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="toggle-thumb"
                animate={{ x: yearly ? 22 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
            <span className={yearly ? 'toggle-active' : 'toggle-inactive'}>
              Yearly <span className="save-tag">Save 20%</span>
            </span>
          </div>
        </FadeIn>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-cards-section">
        <StaggerContainer className="pricing-grid" staggerDelay={0.1}>
          {tiers.map((tier) => (
            <StaggerItem key={tier.key}>
              <GlassCard
                hover
                glow={tier.featured}
                glowColor="rgba(99, 102, 241, 0.2)"
                padding="0"
                className={tier.featured ? 'featured-card' : ''}
              >
                <div className="pricing-card-inner">
                  {tier.badge && (
                    <div className="pricing-badge-wrap">
                      <span className="pricing-badge">
                        <Sparkles size={12} /> {tier.badge}
                      </span>
                    </div>
                  )}

                  <h3 className="tier-name">{tier.name}</h3>

                  <div className="tier-price">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={yearly ? 'yearly' : 'monthly'}
                        className="price-amount"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {yearly ? tier.price.yearly : tier.price.monthly}
                      </motion.span>
                    </AnimatePresence>
                    {tier.key !== 'free' && <span className="price-period">/mo</span>}
                  </div>

                  <p className="tier-subtitle">{tier.subtitle}</p>

                  <GlowButton
                    href={tier.cta.href}
                    variant={tier.featured ? 'primary' : 'secondary'}
                    size="md"
                    className="tier-cta-btn"
                  >
                    {tier.cta.label} {tier.featured && <ArrowRight size={16} />}
                  </GlowButton>

                  <ul className="tier-features">
                    {tier.features.map((f, i) => (
                      <li key={i} className="tier-feature">
                        <Check size={15} className="tier-check" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Comparison Table */}
      <section className="comparison-section">
        <FadeIn direction="up">
          <SectionHeading
            badge="COMPARE"
            title="Feature Comparison"
            subtitle="See exactly what you get at every tier."
          />

          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Hobbyist</th>
                  <th className="th-featured">Pro Trader</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i}>
                    <td className="feature-name-cell">{row[0]}</td>
                    {[1, 2, 3].map((col) => (
                      <td key={col} className={col === 2 ? 'td-featured' : ''}>
                        {row[col] === true ? <Check size={16} className="comp-check" /> :
                         row[col] === false ? <Minus size={16} className="comp-dash" /> :
                         <span>{row[col]}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <FadeIn direction="up">
          <SectionHeading
            badge="FAQ"
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about TraderX Pro."
          />
        </FadeIn>

        <div className="faq-list">
          {faqItems.map((item, i) => (
            <FadeIn key={i} direction="up" delay={i * 0.05}>
              <div className={`faq-item ${openFaq === i ? 'faq-open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <style>{`
        .pricing-page { position: relative; z-index: 1; }
        .pricing-hero { padding: 80px 24px 20px; text-align: center; }
        .billing-toggle {
          display: flex; justify-content: center; align-items: center;
          gap: 14px; margin-top: -20px; margin-bottom: 20px;
          font-size: 14px; font-weight: 500;
        }
        .toggle-active { color: white; font-weight: 700; }
        .toggle-inactive { color: rgba(255,255,255,0.4); }
        .toggle-switch {
          width: 48px; height: 26px;
          background: rgba(255,255,255,0.1);
          border-radius: 13px; border: none;
          cursor: pointer; position: relative; padding: 3px;
        }
        .toggle-thumb {
          width: 20px; height: 20px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          border-radius: 50%;
        }
        .save-tag {
          background: rgba(34,197,94,0.15);
          color: #4ADE80; padding: 3px 10px;
          border-radius: 8px; font-size: 11px;
          font-weight: 700; margin-left: 6px;
        }
        .pricing-cards-section {
          padding: 40px 24px 80px;
          max-width: 1100px; margin: 0 auto;
        }
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: stretch;
        }
        .pricing-card-inner { padding: 36px 28px; height: 100%; display: flex; flex-direction: column; }
        .featured-card { border-color: rgba(99,102,241,0.4) !important; }
        .pricing-badge-wrap { margin-bottom: 16px; }
        .pricing-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white; padding: 5px 14px; border-radius: 8px;
          font-size: 12px; font-weight: 700;
        }
        .tier-name { font-size: 22px; font-weight: 700; color: white; margin: 0 0 12px; }
        .tier-price { margin-bottom: 8px; display: flex; align-items: baseline; gap: 4px; }
        .price-amount { font-size: 48px; font-weight: 900; color: white; }
        .price-period { font-size: 16px; color: rgba(255,255,255,0.4); }
        .tier-subtitle { font-size: 14px; color: rgba(255,255,255,0.45); margin: 0 0 24px; line-height: 1.5; }
        .tier-cta-btn { width: 100%; justify-content: center; margin-bottom: 28px; }
        .tier-features { list-style: none; padding: 0; margin: 0; flex: 1; }
        .tier-feature {
          display: flex; align-items: center; gap: 10px;
          font-size: 13.5px; color: rgba(255,255,255,0.6);
          padding: 8px 0;
        }
        .tier-check { color: #4ADE80; flex-shrink: 0; }

        .comparison-section {
          padding: 80px 24px;
          max-width: 900px; margin: 0 auto;
        }
        .comparison-table-wrap { overflow-x: auto; }
        .comparison-table { width: 100%; border-collapse: collapse; }
        .comparison-table th {
          text-align: left; padding: 14px 16px;
          font-size: 13px; font-weight: 700;
          color: rgba(255,255,255,0.5);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .th-featured { color: #A5B4FC; }
        .comparison-table td {
          padding: 14px 16px; font-size: 14px;
          color: rgba(255,255,255,0.6);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .td-featured { background: rgba(99,102,241,0.04); }
        .feature-name-cell { font-weight: 500; color: rgba(255,255,255,0.75); }
        .comp-check { color: #4ADE80; }
        .comp-dash { color: rgba(255,255,255,0.15); }

        .faq-section {
          padding: 80px 24px;
          max-width: 720px; margin: 0 auto;
        }
        .faq-list { display: flex; flex-direction: column; gap: 10px; }
        .faq-item {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; overflow: hidden;
          transition: border-color 0.2s;
        }
        .faq-open { border-color: rgba(99,102,241,0.3); }
        .faq-question {
          width: 100%; display: flex; align-items: center;
          justify-content: space-between;
          padding: 18px 22px; background: none; border: none;
          cursor: pointer; color: white; font-size: 15px;
          font-weight: 600; text-align: left;
        }
        .faq-answer {
          overflow: hidden;
        }
        .faq-answer p {
          padding: 0 22px 18px; font-size: 14px;
          color: rgba(255,255,255,0.5); line-height: 1.7;
          margin: 0;
        }
        @media (max-width: 768px) {
          .pricing-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}
