'use client';
import { motion } from 'framer-motion';
import { Shield, Eye, Database, Lock, Globe, Cookie, UserCheck, RefreshCw, Mail } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeading from '@/components/ui/SectionHeading';

const sections = [
  {
    icon: Eye,
    title: '1. Information We Collect',
    content: 'We collect information you provide directly when creating an account, including email address, username, and encrypted password. We also collect usage data such as feature interactions, tickers watched, and alert configurations.',
  },
  {
    icon: Database,
    title: '2. How We Use Your Information',
    list: [
      'To provide and maintain the TraderX Pro platform',
      'To process subscriptions and payments via Stripe',
      'To deliver alerts via Telegram, Discord, and webhooks',
      'To improve our AI models and signal accuracy',
      'To communicate product updates and security notices',
    ],
  },
  {
    icon: Lock,
    title: '3. Data Storage & Security',
    content: 'Your data is stored in encrypted databases. Passwords are hashed using bcrypt. API keys are generated with cryptographically secure random values. JWT tokens expire after 15 minutes, and refresh tokens after 30 days.',
  },
  {
    icon: Globe,
    title: '4. Third-Party Services',
    content: 'We use the following third-party services:',
    list: [
      'Stripe — Payment processing (PCI-DSS compliant)',
      'Telegram API — Bot and alert delivery',
      'Discord API — Bot and community features',
      'CoinGecko / Yahoo Finance — Market data',
    ],
  },
  {
    icon: RefreshCw,
    title: '5. Data Retention',
    content: 'Account data is retained while your account is active. You may request deletion of your account and associated data at any time by emailing support@traderx.app. Sentiment and market data is retained for analytics purposes in anonymized form.',
  },
  {
    icon: Cookie,
    title: '6. Cookies & Tracking',
    content: 'The Chrome extension does not use tracking cookies. The dashboard website uses essential cookies for authentication only. We do not use third-party analytics or advertising trackers.',
  },
  {
    icon: UserCheck,
    title: '7. Your Rights',
    list: [
      'Access your personal data',
      'Request correction of inaccurate data',
      'Request deletion of your data (right to be forgotten)',
      'Export your data in machine-readable format',
      'Object to processing for marketing purposes',
    ],
  },
  {
    icon: RefreshCw,
    title: '8. Changes to This Policy',
    content: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "last updated" date.',
  },
  {
    icon: Mail,
    title: '9. Contact',
    content: 'For privacy-related inquiries, contact us at privacy@traderx.app.',
    link: { href: 'mailto:privacy@traderx.app', text: 'privacy@traderx.app' },
  },
];

export default function PrivacyClient() {
  return (
    <div style={{ position: 'relative' }}>
      {/* Hero */}
      <section style={{ padding: '100px 24px 20px', textAlign: 'center' }}>
        <SectionHeading
          badge="Legal"
          title="Privacy Policy"
          subtitle="How we collect, use, and protect your data. Last updated: January 2025."
        />
      </section>

      {/* Trust Badge */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 40px' }}>
        <FadeIn>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '14px 24px', borderRadius: 12,
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)',
          }}>
            <Shield size={18} color="#10B981" />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              Your data is <strong style={{ color: '#10B981' }}>encrypted</strong> and we never sell personal information to third parties.
            </span>
          </div>
        </FadeIn>
      </section>

      {/* Sections */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 100px' }}>
        <StaggerContainer>
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <StaggerItem key={i}>
                <div style={{ marginBottom: 20 }}>
                  <GlassCard padding="28px">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        style={{
                          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                          background: 'rgba(16,185,129,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Icon size={18} color="#6EE7B7" />
                      </motion.div>
                      <div style={{ flex: 1 }}>
                        <h2 style={{
                          fontSize: 16, fontWeight: 700, color: '#6EE7B7',
                          marginBottom: 10,
                        }}>
                          {section.title}
                        </h2>
                        {section.content && (
                          <p style={{
                            fontSize: 14, color: 'rgba(255,255,255,0.55)',
                            lineHeight: 1.7, margin: 0,
                          }}>
                            {section.link ? (
                              <>
                                For privacy-related inquiries, contact us at{' '}
                                <a href={section.link.href} style={{ color: '#6EE7B7', textDecoration: 'none' }}>
                                  {section.link.text}
                                </a>.
                              </>
                            ) : (
                              section.content
                            )}
                          </p>
                        )}
                        {section.list && (
                          <ul style={{
                            padding: 0, margin: section.content ? '12px 0 0' : 0,
                            listStyle: 'none',
                          }}>
                            {section.list.map((item, j) => (
                              <motion.li
                                key={j}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: j * 0.05 }}
                                style={{
                                  display: 'flex', alignItems: 'flex-start', gap: 10,
                                  padding: '6px 0', fontSize: 14,
                                  color: 'rgba(255,255,255,0.55)', lineHeight: 1.6,
                                }}
                              >
                                <span style={{
                                  width: 6, height: 6, borderRadius: '50%',
                                  background: '#10B981', flexShrink: 0, marginTop: 7,
                                }} />
                                {item}
                              </motion.li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>
    </div>
  );
}
