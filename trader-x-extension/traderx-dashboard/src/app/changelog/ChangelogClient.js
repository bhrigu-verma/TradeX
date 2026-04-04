'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUp, Bug, Rocket, Filter } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeading from '@/components/ui/SectionHeading';
import FloatingOrbs from '@/components/ui/FloatingOrbs';

const releases = [
  {
    version: 'v1.0.0',
    date: 'March 2026',
    tag: 'Initial Public Release',
    tagColor: '#10B981',
    changes: [
      { type: 'feature', text: 'AI Trading Copilot with multi-factor trade idea generation' },
      { type: 'feature', text: 'Whale Flow Intelligence — real-time large transaction tracking' },
      { type: 'feature', text: 'Premium subscription system with Stripe billing' },
      { type: 'feature', text: 'Discord bot with slash command support' },
      { type: 'feature', text: 'Redis caching layer for improved performance' },
      { type: 'feature', text: 'JWT authentication with refresh token rotation' },
      { type: 'improvement', text: 'Marketing website with docs, pricing, and community pages' },
      { type: 'improvement', text: 'Enhanced backtest scoring with 4h and 24h windows' },
      { type: 'fix', text: 'Fixed backtest route ordering (/leaderboard was unreachable)' },
      { type: 'fix', text: 'Fixed tracked-poller DB column name mismatch' },
    ],
  },
  {
    version: 'v3.5.0',
    date: 'December 2024',
    tag: 'Feature Update',
    tagColor: '#14B8A6',
    changes: [
      { type: 'feature', text: 'Combo alerts — multi-signal combination triggers' },
      { type: 'feature', text: 'Sector heatmap for watchlist-level sentiment view' },
      { type: 'feature', text: 'Advanced search with export capabilities' },
      { type: 'improvement', text: 'Improved tweet processing with engagement weighting' },
      { type: 'improvement', text: 'Better influencer tier classification' },
    ],
  },
  {
    version: 'v3.0.0',
    date: 'November 2024',
    tag: 'Major Release',
    tagColor: '#10B981',
    changes: [
      { type: 'feature', text: 'Telegram bot with 15+ slash commands' },
      { type: 'feature', text: 'Portfolio tracker with real-time P&L' },
      { type: 'feature', text: 'Alert system with Telegram delivery' },
      { type: 'feature', text: 'Backtest accuracy tracking for signal validation' },
      { type: 'improvement', text: 'Redesigned Chrome extension sidebar' },
    ],
  },
  {
    version: 'v2.0.0',
    date: 'October 2024',
    tag: 'Major Release',
    tagColor: '#10B981',
    changes: [
      { type: 'feature', text: 'Backend API server with SQLite database' },
      { type: 'feature', text: 'Sentiment aggregation with influencer weighting' },
      { type: 'feature', text: 'Next.js dashboard with real-time data' },
      { type: 'feature', text: 'Watchlist management and ticker tracking' },
    ],
  },
];

const typeConfig = {
  feature: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'New', icon: Sparkles },
  improvement: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Improved', icon: ArrowUp },
  fix: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Fixed', icon: Bug },
};

const filterOptions = ['all', 'feature', 'improvement', 'fix'];

export default function ChangelogClient() {
  const [filter, setFilter] = useState('all');

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <FloatingOrbs />

      {/* Hero */}
      <section style={{ padding: '100px 24px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <SectionHeading
          badge="What's New"
          title="Changelog"
          subtitle="Track every release, feature, and improvement shipped by the TraderX team."
        />
      </section>

      {/* Filter Bar */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 32px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            width: 'fit-content',
          }}>
            <Filter size={14} style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 8 }} />
            {filterOptions.map(f => (
              <motion.button
                key={f}
                onClick={() => setFilter(f)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  textTransform: 'capitalize',
                  background: filter === f ? 'rgba(16,185,129,0.2)' : 'transparent',
                  color: filter === f ? '#6EE7B7' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                {f === 'all' ? 'All Changes' : typeConfig[f]?.label || f}
              </motion.button>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Timeline */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 20, top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(180deg, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0.05) 100%)',
          }} />

          <StaggerContainer>
            {releases.map((release, ri) => {
              const filteredChanges = filter === 'all'
                ? release.changes
                : release.changes.filter(c => c.type === filter);

              if (filteredChanges.length === 0) return null;

              return (
                <StaggerItem key={release.version}>
                  <div style={{ position: 'relative', paddingLeft: 52, marginBottom: 40 }}>
                    {/* Timeline dot */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 300, delay: ri * 0.1 }}
                      style={{
                        position: 'absolute', left: 12, top: 24, width: 18, height: 18,
                        borderRadius: '50%',
                        background: release.tagColor,
                        boxShadow: `0 0 20px ${release.tagColor}40`,
                        zIndex: 2,
                      }}
                    >
                      <Rocket size={10} style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)', color: 'white',
                      }} />
                    </motion.div>

                    <GlassCard hover padding="28px">
                      {/* Release Header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
                        flexWrap: 'wrap',
                      }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
                          {release.version}
                        </span>
                        <span style={{
                          fontSize: 11, padding: '4px 12px', borderRadius: 8,
                          background: `${release.tagColor}20`, color: release.tagColor,
                          fontWeight: 700, letterSpacing: '0.3px',
                        }}>
                          {release.tag}
                        </span>
                        <span style={{
                          fontSize: 12, color: 'rgba(255,255,255,0.3)',
                          marginLeft: 'auto', fontWeight: 500,
                        }}>
                          {release.date}
                        </span>
                      </div>

                      {/* Changes List */}
                      <AnimatePresence mode="popLayout">
                        {filteredChanges.map((change, ci) => {
                          const config = typeConfig[change.type];
                          const Icon = config.icon;
                          return (
                            <motion.div
                              key={`${release.version}-${ci}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ delay: ci * 0.03 }}
                              style={{
                                display: 'flex', alignItems: 'flex-start', gap: 10,
                                padding: '8px 0', fontSize: 13,
                              }}
                            >
                              <span style={{
                                fontSize: 10, padding: '3px 10px', borderRadius: 6,
                                flexShrink: 0, marginTop: 1,
                                background: config.bg, color: config.color,
                                fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
                              }}>
                                <Icon size={9} />
                                {config.label}
                              </span>
                              <span style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                {change.text}
                              </span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </GlassCard>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
