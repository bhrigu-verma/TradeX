'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, AlertTriangle, User, CreditCard, ShieldCheck, Scale, Server, XCircle, RefreshCw, Bell, Mail, ChevronDown } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';

const sections = [
  {
    icon: CheckCircle,
    title: '1. Acceptance of Terms',
    content: 'By accessing or using TraderX Pro, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.',
  },
  {
    icon: FileText,
    title: '2. Description of Service',
    content: 'TraderX Pro provides AI-powered trading intelligence tools including sentiment analysis, whale tracking, trade idea generation, and alert delivery. The service is available via Chrome extension, web dashboard, API, and messaging bots.',
  },
  {
    icon: AlertTriangle,
    title: '3. Not Financial Advice',
    content: 'IMPORTANT: TraderX Pro is for informational and educational purposes only. It does not constitute financial advice, investment recommendations, or trading signals. You are solely responsible for your trading decisions. Past performance of AI-generated ideas does not guarantee future results.',
    highlight: true,
  },
  {
    icon: User,
    title: '4. Account Responsibilities',
    list: [
      'You must be at least 18 years old to use the service',
      'You are responsible for maintaining the security of your account credentials',
      'You must not share your API keys or access tokens with unauthorized parties',
      'You must not use the service for any illegal activities',
    ],
  },
  {
    icon: CreditCard,
    title: '5. Subscription & Billing',
    list: [
      'Free tier is available with limited features',
      'Pro and Enterprise subscriptions are billed monthly or annually via Stripe',
      'You may cancel your subscription at any time; access continues through the current billing period',
      'Refunds are handled on a case-by-case basis within 14 days of purchase',
      'We reserve the right to change pricing with 30 days notice',
    ],
  },
  {
    icon: ShieldCheck,
    title: '6. Acceptable Use',
    content: 'You agree not to:',
    list: [
      'Reverse engineer, decompile, or attempt to extract source code',
      'Use automated tools to scrape or harvest data beyond API limits',
      'Redistribute or resell TraderX data or signals without authorization',
      'Interfere with or disrupt the service or servers',
      'Impersonate other users or entities',
    ],
  },
  {
    icon: Scale,
    title: '7. Intellectual Property',
    content: 'All content, code, algorithms, and branding of TraderX Pro are owned by TraderX. You are granted a limited, non-exclusive license to use the service for personal or business purposes according to your subscription tier.',
  },
  {
    icon: AlertTriangle,
    title: '8. Limitation of Liability',
    content: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRADERX PRO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR TRADING LOSSES.',
    highlight: true,
  },
  {
    icon: Server,
    title: '9. Service Availability',
    content: 'We strive for high availability but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance. We are not liable for losses resulting from service outages.',
  },
  {
    icon: XCircle,
    title: '10. Termination',
    content: 'We may suspend or terminate your account if you violate these terms. Upon termination, your right to use the service ceases immediately, though you may request export of your data.',
  },
  {
    icon: RefreshCw,
    title: '11. Changes to Terms',
    content: 'We reserve the right to modify these terms at any time. Material changes will be communicated via email or in-app notification at least 14 days before taking effect.',
  },
  {
    icon: Mail,
    title: '12. Contact',
    content: 'For questions about these terms, contact legal@traderx.app.',
    link: { href: 'mailto:legal@traderx.app', text: 'legal@traderx.app' },
  },
];

export default function TermsClient() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div style={{ position: 'relative' }}>
      {/* Hero */}
      <section style={{ padding: '100px 24px 20px', textAlign: 'center' }}>
        <SectionHeading
          badge="Legal"
          title="Terms of Service"
          subtitle="Usage terms, disclaimers, and legal agreements. Last updated: January 2025."
        />
      </section>

      {/* Table of Contents */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 40px' }}>
        <FadeIn>
          <GlassCard padding="24px">
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Table of Contents
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
              {sections.map((s, i) => (
                <motion.a
                  key={i}
                  href={`#section-${i}`}
                  whileHover={{ x: 4 }}
                  style={{
                    fontSize: 13, color: 'rgba(255,255,255,0.5)',
                    textDecoration: 'none', padding: '4px 0',
                    transition: 'color 0.15s', cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#6EE7B7'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}
                >
                  {s.title}
                </motion.a>
              ))}
            </div>
          </GlassCard>
        </FadeIn>
      </section>

      {/* Accordion Sections */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 100px' }}>
        {sections.map((section, i) => {
          const Icon = section.icon;
          const isOpen = openIndex === i;
          return (
            <FadeIn key={i} delay={i * 0.03}>
              <div id={`section-${i}`} style={{ marginBottom: 12, scrollMarginTop: 100 }}>
                <motion.div
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  whileHover={{ scale: 1.005 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '18px 20px', borderRadius: isOpen ? '14px 14px 0 0' : 14,
                    background: section.highlight
                      ? 'rgba(245,158,11,0.06)'
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${section.highlight ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.06)'}`,
                    borderBottom: isOpen ? 'none' : undefined,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: section.highlight ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color={section.highlight ? '#F59E0B' : '#6EE7B7'} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'white', flex: 1 }}>
                    {section.title}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} color="rgba(255,255,255,0.3)" />
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        padding: '20px 20px 20px 70px',
                        background: section.highlight
                          ? 'rgba(245,158,11,0.03)'
                          : 'rgba(255,255,255,0.015)',
                        border: `1px solid ${section.highlight ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.06)'}`,
                        borderTop: 'none',
                        borderRadius: '0 0 14px 14px',
                      }}>
                        {section.content && (
                          <p style={{
                            fontSize: 14, color: 'rgba(255,255,255,0.55)',
                            lineHeight: 1.7, margin: 0,
                          }}>
                            {section.link ? (
                              <>
                                For questions about these terms, contact{' '}
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
                          <ul style={{ padding: 0, margin: section.content ? '12px 0 0' : 0, listStyle: 'none' }}>
                            {section.list.map((item, j) => (
                              <motion.li
                                key={j}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: j * 0.05 }}
                                style={{
                                  display: 'flex', alignItems: 'flex-start', gap: 10,
                                  padding: '5px 0', fontSize: 14,
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          );
        })}
      </section>
    </div>
  );
}
