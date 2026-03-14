'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Chrome, PinIcon, Bell, TrendingUp, Settings, Download,
  Sparkles, ArrowRight, Shield, Zap, Eye, BarChart3, Target
} from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import GlassCard from '@/components/ui/GlassCard';
import GlowButton from '@/components/ui/GlowButton';
import SectionHeading from '@/components/ui/SectionHeading';
import StaggerContainer, { StaggerItem } from '@/components/ui/StaggerContainer';
import FloatingOrbs from '@/components/ui/FloatingOrbs';

const steps = [
  {
    num: '01',
    title: 'Install the Extension',
    description: 'Open the TraderX extension release page on GitHub, download the latest zip, extract it, then load it via chrome://extensions as an unpacked extension. Works on Chrome, Brave, Arc, Edge, and Opera.',
    details: [
      'Download latest release zip from GitHub',
      'Extract zip and use "Load unpacked" in chrome://extensions',
      'Works on all Chromium-based browsers',
      'Lightweight — under 2MB total footprint',
    ],
    icon: <Chrome size={28} />,
    color: '#818CF8',
  },
  {
    num: '02',
    title: 'Pin & Open Your Dashboard',
    description: 'Pin the TraderX icon to your toolbar for one-click access. Open any X.com page and the sidebar activates automatically with real-time data overlays.',
    details: [
      'Pin extension to toolbar for quick access',
      'Sidebar auto-activates on X.com / Twitter',
      'No separate tab or app needed',
      'Data starts flowing immediately',
    ],
    icon: <Eye size={28} />,
    color: '#22D3EE',
  },
  {
    num: '03',
    title: 'Build Your Watchlist & Alerts',
    description: 'Add tickers to your watchlist. Set up combo alerts with multi-condition triggers like "TSLA mentioned + Bullish sentiment + Account > 1M followers." Connect Telegram or Discord for instant delivery.',
    details: [
      'Add any stock or crypto ticker',
      'Multi-condition combo alert builder',
      'Choose delivery: Telegram, Discord, or webhook',
      'Set confidence thresholds to reduce noise',
    ],
    icon: <Bell size={28} />,
    color: '#FBBF24',
  },
  {
    num: '04',
    title: 'Scroll, Analyze, Export',
    description: 'Browse X naturally. Our background engine captures every tweet, runs FinBERT sentiment analysis, tracks whale mentions, and lets you export everything to CSV, JSON, or AI-ready formats with a single click.',
    details: [
      'MutationObserver captures all tweets as you scroll',
      'Real-time sentiment scoring on every tweet',
      'One-click export to CSV, JSON, or AI prompt',
      'Whale tracker highlights smart money moves',
    ],
    icon: <Download size={28} />,
    color: '#4ADE80',
  },
  {
    num: '05',
    title: 'Get AI Copilot Trade Ideas',
    description: 'The AI Copilot synthesizes sentiment, technicals, volume, and influencer credibility to deliver actionable trade setups with entry, stop-loss, and target levels — complete with risk/reward framing.',
    details: [
      'AI-generated trade ideas with confidence scores',
      'Entry, stop-loss, and target levels',
      'Position sizing with Kelly Criterion',
      'Historical win rate tracking',
    ],
    icon: <Sparkles size={28} />,
    color: '#F472B6',
  },
];

const tips = [
  { icon: <Target size={24} />, title: 'Start with 3-5 Tickers', desc: 'Focus your watchlist. Quality over quantity gives better signal-to-noise ratio.' },
  { icon: <Shield size={24} />, title: 'Set Confidence to 65%+', desc: 'Higher confidence thresholds filter out noise and surface only high-conviction setups.' },
  { icon: <BarChart3 size={24} />, title: 'Use Combo Alerts', desc: 'Multi-condition alerts (sentiment + volume + influencer) dramatically reduce false positives.' },
  { icon: <Zap size={24} />, title: 'Export for Deep Analysis', desc: 'Download tweet data as JSON and feed it into your own models or ChatGPT for custom analysis.' },
];

export default function GuideClient() {
  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center'],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="guide-page">
      <FloatingOrbs />

      {/* Hero */}
      <section className="guide-hero">
        <FadeIn direction="up">
          <SectionHeading
            badge="GETTING STARTED"
            title="From Install to First Alpha in 60 Seconds"
            subtitle="Follow these five steps to transform your X feed into a professional-grade trading intelligence terminal."
          />
        </FadeIn>
      </section>

      {/* Animated Timeline */}
      <section className="timeline-section" ref={timelineRef}>
        <div className="timeline-track">
          {/* Animated progress line */}
          <div className="timeline-line-bg" />
          <motion.div className="timeline-line-fill" style={{ height: lineHeight }} />

          {steps.map((step, i) => (
            <FadeIn key={step.num} direction={i % 2 === 0 ? 'left' : 'right'} delay={0.1}>
              <div className={`timeline-item ${i % 2 === 1 ? 'timeline-right' : 'timeline-left'}`}>
                {/* Node on the line */}
                <motion.div
                  className="timeline-node"
                  style={{ background: step.color, boxShadow: `0 0 20px ${step.color}40` }}
                  whileInView={{ scale: [0.5, 1.2, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {step.icon}
                </motion.div>

                {/* Content Card */}
                <GlassCard hover padding="28px 24px" className="timeline-card">
                  <span className="step-label" style={{ color: step.color }}>Step {step.num}</span>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.description}</p>
                  <ul className="step-details">
                    {step.details.map((d, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + j * 0.06 }}
                      >
                        <span className="detail-dot" style={{ background: step.color }} />
                        {d}
                      </motion.li>
                    ))}
                  </ul>
                </GlassCard>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Pro Tips */}
      <section className="tips-section">
        <FadeIn direction="up">
          <SectionHeading
            badge="PRO TIPS"
            title="Maximize Your Trading Edge"
            subtitle="Expert tips from our most successful users."
          />
        </FadeIn>

        <StaggerContainer className="tips-grid" staggerDelay={0.1}>
          {tips.map((tip) => (
            <StaggerItem key={tip.title}>
              <GlassCard hover padding="28px 24px">
                <div className="tip-icon">{tip.icon}</div>
                <h4 className="tip-title">{tip.title}</h4>
                <p className="tip-desc">{tip.desc}</p>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA */}
      <section className="guide-cta">
        <FadeIn direction="up">
          <div className="guide-cta-inner">
            <h2 className="guide-cta-title">Ready to Start?</h2>
            <p className="guide-cta-sub">Install TraderX Pro now and start receiving AI-powered trading intelligence in under a minute.</p>
            <div className="guide-cta-buttons">
              <GlowButton href="https://github.com/bhrigu-verma/traderx-extension/releases/latest" target="_blank" rel="noreferrer" size="lg" icon={<Chrome size={20} />}>
                Download Latest Release
              </GlowButton>
              <GlowButton href="/features" variant="secondary" size="lg">
                Explore Features <ArrowRight size={16} />
              </GlowButton>
            </div>
          </div>
        </FadeIn>
      </section>

      <style>{`
        .guide-page { position: relative; z-index: 1; }
        .guide-hero { padding: 80px 24px 40px; text-align: center; }

        .timeline-section {
          padding: 40px 24px 80px;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
        }
        .timeline-track { position: relative; padding-left: 60px; }
        .timeline-line-bg {
          position: absolute;
          left: 28px; top: 0; bottom: 0;
          width: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
        }
        .timeline-line-fill {
          position: absolute;
          left: 28px; top: 0;
          width: 3px;
          background: linear-gradient(180deg, #6366F1, #8B5CF6, #4ADE80);
          border-radius: 2px;
          z-index: 1;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 48px;
          display: flex;
          align-items: flex-start;
          gap: 24px;
        }
        .timeline-node {
          position: absolute;
          left: -46px;
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: white; z-index: 2;
          flex-shrink: 0;
        }
        .timeline-card { flex: 1; }
        .step-label {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px; display: block;
        }
        .step-title {
          font-size: 22px; font-weight: 700; color: white;
          margin: 0 0 10px;
        }
        .step-desc {
          font-size: 14.5px; color: rgba(255,255,255,0.5);
          line-height: 1.7; margin: 0 0 18px;
        }
        .step-details { list-style: none; padding: 0; margin: 0; }
        .step-details li {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: rgba(255,255,255,0.6);
          padding: 5px 0;
        }
        .detail-dot {
          width: 6px; height: 6px; border-radius: 50%;
          flex-shrink: 0;
        }

        .tips-section {
          padding: 80px 24px;
          max-width: 1000px; margin: 0 auto;
        }
        .tips-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .tip-icon {
          width: 48px; height: 48px;
          background: rgba(99,102,241,0.12);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: #A5B4FC; margin-bottom: 16px;
        }
        .tip-title { font-size: 16px; font-weight: 700; color: white; margin: 0 0 8px; }
        .tip-desc { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; margin: 0; }

        .guide-cta {
          padding: 100px 24px;
          text-align: center;
          position: relative;
        }
        .guide-cta-inner { max-width: 600px; margin: 0 auto; }
        .guide-cta-title {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 900; color: white;
          margin: 0 0 14px; letter-spacing: -0.03em;
        }
        .guide-cta-sub {
          font-size: 17px; color: rgba(255,255,255,0.5);
          margin: 0 0 32px; line-height: 1.6;
        }
        .guide-cta-buttons {
          display: flex; justify-content: center;
          gap: 16px; flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .tips-grid { grid-template-columns: repeat(2, 1fr); }
          .timeline-track { padding-left: 50px; }
          .timeline-node { left: -38px; width: 40px; height: 40px; }
        }
        @media (max-width: 480px) {
          .tips-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
