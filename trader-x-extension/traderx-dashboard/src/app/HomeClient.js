'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight, Chrome, BrainCircuit, Waves, BarChart3,
  Shield, Bell, Download, Sparkles, Target, Globe, Check,
  LineChart
} from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import StaggerContainer, { StaggerItem } from '@/components/ui/StaggerContainer';
import GlassCard from '@/components/ui/GlassCard';
import GlowButton from '@/components/ui/GlowButton';
import FloatingOrbs from '@/components/ui/FloatingOrbs';
import SectionHeading from '@/components/ui/SectionHeading';

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section ref={ref} className="hero-section">
      <FloatingOrbs />
      <div className="hero-grid" />
      <motion.div className="hero-inner" style={{ y, opacity }}>
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, scale: 0.92, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <Sparkles size={14} />
          <span>TraderX v1.0 - Built for serious X-native traders</span>
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          A calmer, sharper way
          <br />
          to trade on <span className="hero-gradient-text">X</span>.
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.32 }}
        >
          Turn noisy timelines into structured conviction. TraderX combines whale flow,
          sentiment context, and tactical alerts in a clean execution workspace that keeps
          you focused on the next high-quality setup.
        </motion.p>

        <motion.div
          className="hero-ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <GlowButton href="https://github.com/bhrigu-verma/traderx-extension/releases/latest" target="_blank" rel="noreferrer" size="lg" icon={<Chrome size={20} />}>
            Download Extension
          </GlowButton>
          <GlowButton href="/guide" variant="secondary" size="lg">
            See Platform Tour <ArrowRight size={16} />
          </GlowButton>
        </motion.div>

        <motion.p
          className="hero-proof"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.62 }}
        >
          Trusted by <strong>10,000+</strong> traders across crypto and equities
        </motion.p>

        <StaggerContainer className="hero-stats" delay={0.72} staggerDelay={0.1}>
          {[
            { value: '250+', label: 'Accounts Tracked' },
            { value: 'Sub-second', label: 'Signal Parsing' },
            { value: 'Stocks + Crypto', label: 'Asset Coverage' },
            { value: '65%+', label: 'Confidence Threshold' },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </motion.div>

      <style>{`
        .hero-section {
          position: relative;
          padding: 112px 24px 88px;
          text-align: center;
          min-height: 88vh;
          display: flex;
          align-items: center;
          justify-content: center;
          isolation: isolate;
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(circle at center, black 18%, transparent 82%);
        }
        .hero-inner {
          max-width: 920px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.7);
          color: #9cc8ff;
          padding: 9px 20px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 30px;
          border: 1px solid rgba(147, 197, 253, 0.24);
          letter-spacing: 0.02em;
        }
        .hero-title {
          font-size: clamp(38px, 6vw, 74px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.045em;
          margin: 0 0 22px;
          color: #f8fbff;
        }
        .hero-gradient-text {
          background: linear-gradient(130deg, #93c5fd 0%, #2dd4bf 50%, #f8d477 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: clamp(16px, 2vw, 20px);
          color: rgba(232, 241, 255, 0.72);
          line-height: 1.72;
          margin: 0 auto 38px;
          max-width: 690px;
        }
        .hero-ctas {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .hero-proof {
          font-size: 14px;
          color: rgba(232, 241, 255, 0.45);
          margin-bottom: 52px;
        }
        .hero-proof strong { color: rgba(255, 255, 255, 0.88); }
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          max-width: 760px;
          margin: 0 auto;
        }
        .stat-card {
          padding: 19px 12px;
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(18, 28, 46, 0.78), rgba(11, 18, 32, 0.8));
          border: 1px solid rgba(148, 163, 184, 0.24);
          backdrop-filter: blur(10px);
          transition: transform 260ms ease, border-color 260ms ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(103, 232, 249, 0.5);
        }
        .stat-value {
          font-size: 21px;
          font-weight: 800;
          color: #8ce4d3;
          margin-bottom: 6px;
        }
        .stat-label {
          font-size: 11px;
          color: rgba(232, 241, 255, 0.64);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.055em;
        }
        @media (max-width: 640px) {
          .hero-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .hero-section { padding: 74px 16px 58px; min-height: auto; }
        }
      `}</style>
    </section>
  );
}

function BentoGrid() {
  const features = [
    {
      icon: <BrainCircuit size={28} />,
      title: 'AI Trading Copilot',
      description: 'Generate cleaner trade plans with entries, stops, and confidence windows from sentiment and market structure.',
      tag: 'Core Signal',
      span: 'large',
    },
    {
      icon: <Waves size={28} />,
      title: 'Whale Flow Tracker',
      description: 'Monitor high-value on-chain movement and detect accumulation versus distribution before social narratives catch up.',
      tag: 'On-Chain',
      span: 'medium',
    },
    {
      icon: <Download size={28} />,
      title: 'Infinite Data Export',
      description: 'Capture full feed context while you scroll and export it in clean formats for journals, quant backtests, or model training.',
      tag: 'Workflow',
      span: 'medium',
    },
    {
      icon: <BarChart3 size={28} />,
      title: 'Sector Heatmaps',
      description: 'Read momentum by narrative cluster at a glance and quickly rotate attention to sectors with real movement.',
      tag: 'Context',
      span: 'small',
    },
    {
      icon: <Bell size={28} />,
      title: 'Combo Alerts',
      description: 'Build condition stacks that notify only when conviction is high, reducing alert fatigue and random distractions.',
      tag: 'Precision',
      span: 'small',
    },
    {
      icon: <Shield size={28} />,
      title: 'Enterprise Security',
      description: 'Includes secure auth, role-aware access, and encrypted storage for individual traders and institutional teams.',
      tag: 'Security',
      span: 'small',
    },
  ];

  return (
    <section className="bento-section">
      <SectionHeading
        badge="FEATURES"
        title="A Platform That Feels Deliberate"
        subtitle="Each module was designed to remove noise, improve timing, and support disciplined decision-making."
      />

      <StaggerContainer className="bento-grid" staggerDelay={0.08}>
        {features.map((f, i) => (
          <StaggerItem key={f.title} className={`bento-item bento-${f.span}`}>
            <GlassCard hover glow={i === 0} padding="0">
              <div className="bento-inner">
                <div className="bento-tag">{f.tag}</div>
                <div className="bento-icon">{f.icon}</div>
                <h3 className="bento-title">{f.title}</h3>
                <p className="bento-desc">{f.description}</p>
              </div>
            </GlassCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <style>{`
        .bento-section {
          padding: 100px 24px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .bento-large { grid-column: span 1; grid-row: span 2; }
        .bento-medium { grid-column: span 1; }
        .bento-small { grid-column: span 1; }
        .bento-inner { padding: 32px 28px; height: 100%; }
        .bento-tag {
          display: inline-block;
          background: rgba(15, 23, 42, 0.72);
          color: #b8d7ff;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 20px;
          border: 1px solid rgba(148, 163, 184, 0.35);
        }
        .bento-icon {
          width: 56px; height: 56px;
          background: linear-gradient(145deg, rgba(18, 33, 56, 0.9), rgba(13, 30, 45, 0.9));
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          color: #7de5d4;
          margin-bottom: 20px;
          border: 1px solid rgba(125, 229, 212, 0.24);
        }
        .bento-title {
          font-size: 20px; font-weight: 750; color: #f8fbff;
          margin: 0 0 10px; letter-spacing: -0.01em;
        }
        .bento-desc {
          font-size: 14px; color: rgba(222, 235, 255, 0.72);
          line-height: 1.65; margin: 0;
        }
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr); }
          .bento-large { grid-row: span 1; }
        }
        @media (max-width: 600px) {
          .bento-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Download and install', desc: 'Get the latest extension release from GitHub, then load it in chrome://extensions and pin it to your toolbar.', icon: <Chrome size={24} /> },
    { num: '02', title: 'Use X as usual', desc: 'Continue browsing normally while intelligence layers process context in real time.', icon: <Globe size={24} /> },
    { num: '03', title: 'Define your conditions', desc: 'Set watchlists and stacked alerts that reflect your actual trading framework.', icon: <Bell size={24} /> },
    { num: '04', title: 'Execute with confidence', desc: 'Act only when confluence aligns and track post-trade quality with clean exported data.', icon: <Target size={24} /> },
  ];

  return (
    <section className="hiw-section">
      <SectionHeading
        badge="HOW IT WORKS"
        title="Fast onboarding, durable edge"
        subtitle="A short setup path designed for repeatable, high-quality execution."
      />

      <div className="hiw-timeline">
        {steps.map((step, i) => (
          <FadeIn key={step.num} delay={i * 0.15} direction="up">
            <div className="hiw-step">
              <div className="hiw-line-wrap">
                <div className="hiw-num-circle">{step.icon}</div>
                {i < steps.length - 1 && <div className="hiw-connector" />}
              </div>
              <div className="hiw-content">
                <span className="hiw-step-num">Step {step.num}</span>
                <h3 className="hiw-step-title">{step.title}</h3>
                <p className="hiw-step-desc">{step.desc}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <style>{`
        .hiw-section {
          padding: 100px 24px;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .hiw-timeline { display: flex; flex-direction: column; gap: 0; }
        .hiw-step {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }
        .hiw-line-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        .hiw-num-circle {
          width: 56px; height: 56px;
          background: linear-gradient(145deg, #10243c, #0f1a30);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          color: #8ce4d3;
          border: 1px solid rgba(125, 229, 212, 0.3);
          box-shadow: 0 16px 34px -24px rgba(45, 212, 191, 0.55);
          flex-shrink: 0;
        }
        .hiw-connector {
          width: 2px;
          height: 48px;
          background: linear-gradient(180deg, rgba(125, 229, 212, 0.5), rgba(125, 229, 212, 0.06));
          margin: 8px 0;
        }
        .hiw-content { padding: 8px 0 40px; }
        .hiw-step-num {
          font-size: 11px; font-weight: 700;
          color: #8ce4d3; text-transform: uppercase;
          letter-spacing: 0.1em; margin-bottom: 6px;
          display: block;
        }
        .hiw-step-title {
          font-size: 20px; font-weight: 750; color: #f7fbff;
          margin: 0 0 8px;
        }
        .hiw-step-desc {
          font-size: 15px; color: rgba(222, 235, 255, 0.72);
          line-height: 1.6; margin: 0;
        }
      `}</style>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    { quote: 'TraderX helps me cut through narrative spikes fast. I get context, then act with less hesitation.', name: 'A. Patel', role: 'Independent Trader', avatar: 'AP' },
    { quote: 'We use it as a first-pass filter before deeper desk research. The time savings are immediate.', name: 'M. Chen', role: 'Research Analyst', avatar: 'MC' },
    { quote: 'Signals show up right where I already work. That one change improved my execution consistency.', name: 'J. Romero', role: 'Quant Hobbyist', avatar: 'JR' },
    { quote: 'Combo alerts reduced random pings and improved decision quality. Less noise, better focus.', name: 'S. Williams', role: 'Swing Trader', avatar: 'SW' },
    { quote: 'Export depth is exceptional. It feeds directly into my notebooks and research pipelines.', name: 'K. Nakamura', role: 'Data Scientist', avatar: 'KN' },
    { quote: 'Team rollout was straightforward, and API integration fit our workflow without friction.', name: 'R. Goldman', role: 'Portfolio Manager', avatar: 'RG' },
  ];

  return (
    <section className="testimonials-section">
      <SectionHeading
        badge="TESTIMONIALS"
        title="What traders notice first"
        subtitle="Sharper focus, cleaner timing, and less reactive decision-making."
      />

      <StaggerContainer className="testimonials-grid" staggerDelay={0.08}>
        {testimonials.map((t) => (
          <StaggerItem key={t.name}>
            <GlassCard hover padding="28px 24px">
              <div className="test-stars">★★★★★</div>
              <p className="test-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="test-author">
                <div className="test-avatar">{t.avatar}</div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-role">{t.role}</div>
                </div>
              </div>
            </GlassCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <style>{`
        .testimonials-section {
          padding: 100px 24px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .test-stars {
          font-size: 14px; color: #f7cf76; margin-bottom: 14px;
          letter-spacing: 2px;
        }
        .test-quote {
          font-size: 15px; color: rgba(233, 242, 255, 0.82);
          line-height: 1.65; margin: 0 0 20px;
          font-style: normal;
        }
        .test-author { display: flex; align-items: center; gap: 12px; }
        .test-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(145deg, #153251, #0f2238);
          display: flex; align-items: center; justify-content: center;
          color: #9cc8ff; font-weight: 700; font-size: 13px;
          border: 1px solid rgba(156, 200, 255, 0.3);
        }
        .test-name { font-size: 14px; font-weight: 650; color: #f6fbff; }
        .test-role { font-size: 12px; color: rgba(222, 235, 255, 0.62); }
        @media (max-width: 900px) {
          .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .testimonials-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="final-cta-section">
      <div className="cta-glow" />
      <FadeIn direction="up">
        <div className="cta-inner">
          <motion.h2
            className="cta-heading"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Build your edge.<br />Keep your composure.
          </motion.h2>
          <p className="cta-sub">
            TraderX gives you a premium intelligence layer inside the feed you already use,
            with less noise and better decision timing from day one.
          </p>
          <div className="cta-buttons">
            <GlowButton href="https://github.com/bhrigu-verma/traderx-extension/releases/latest" target="_blank" rel="noreferrer" size="lg" icon={<Chrome size={20} />}>
              Download Extension
            </GlowButton>
            <GlowButton href="/pricing" variant="secondary" size="lg">
              View Plans <ArrowRight size={16} />
            </GlowButton>
          </div>
          <p className="cta-disclaimer">No credit card required - Cancel anytime - Works on Chromium browsers</p>
        </div>
      </FadeIn>

      <style>{`
        .final-cta-section {
          padding: 120px 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-glow {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(45, 212, 191, 0.14) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-inner {
          position: relative; z-index: 1;
          max-width: 640px; margin: 0 auto;
        }
        .cta-heading {
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 800; color: #f8fbff;
          margin: 0 0 18px; letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .cta-sub {
          font-size: 18px; color: rgba(222, 235, 255, 0.78);
          margin: 0 0 36px; line-height: 1.6;
        }
        .cta-buttons {
          display: flex; justify-content: center;
          gap: 16px; flex-wrap: wrap; margin-bottom: 24px;
        }
        .cta-disclaimer {
          font-size: 13px; color: rgba(222, 235, 255, 0.58);
        }
      `}</style>
    </section>
  );
}

function TrustStrip() {
  const points = [
    { label: 'Real-time sentiment scoring', icon: <LineChart size={16} /> },
    { label: 'Cross-market watchlists', icon: <Target size={16} /> },
    { label: 'Actionable signal confidence', icon: <Check size={16} /> },
  ];

  return (
    <section className="trust-strip">
      <StaggerContainer className="trust-inner" staggerDelay={0.08}>
        {points.map((point) => (
          <StaggerItem key={point.label}>
            <div className="trust-pill">
              {point.icon}
              <span>{point.label}</span>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <style>{`
        .trust-strip {
          padding: 0 24px 28px;
          max-width: 1120px;
          margin: 0 auto;
        }
        .trust-inner {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .trust-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(148, 163, 184, 0.28);
          border-radius: 999px;
          color: rgba(232, 241, 255, 0.9);
          font-size: 13px;
          font-weight: 600;
        }
      `}</style>
    </section>
  );
}

export default function HomeClient() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <BentoGrid />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
