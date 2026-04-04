'use client';

import Link from 'next/link';

import { useEffect } from 'react';

const BADGE_PHRASES = [
  'Initializing FinBERT Engine...',
  'Connecting to X.com DOM...',
  'Loading 988 Institutional Accounts...',
  'System Ready. Awaiting Signals.',
];

export default function HomeClient() {
  useEffect(() => {
    const root = document.documentElement;

    const onMouseMove = (e) => {
      root.style.setProperty('--mouse-x', `${e.clientX}px`);
      root.style.setProperty('--mouse-y', `${e.clientY}px`);

      const cards = document.querySelectorAll('.tx-spotlight-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--card-mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--card-mouse-y', `${e.clientY - rect.top}px`);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('active');

          if (entry.target.classList.contains('tx-step-item')) {
            const icon = entry.target.querySelector('.tx-step-icon');
            const iconSvg = entry.target.querySelector('.tx-step-svg');
            if (icon) {
              icon.classList.add('is-active');
            }
            if (iconSvg) {
              iconSvg.classList.add('is-active');
            }
          }
        });
      },
      { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    const revealNodes = document.querySelectorAll('.tx-reveal');
    revealNodes.forEach((node) => observer.observe(node));

    const onScroll = () => {
      const timeline = document.querySelector('.tx-timeline-container');
      if (!timeline) {
        return;
      }

      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      let progress = 0;
      if (rect.top < vh / 2) {
        progress = Math.min(100, Math.max(0, ((vh / 2 - rect.top) / rect.height) * 100));
      }
      root.style.setProperty('--scroll-progress', `${progress}%`);
    };

    let phraseIndex = 0;
    const badge = document.getElementById('tx-typing-badge');
    const badgeInterval = window.setInterval(() => {
      if (!badge) {
        return;
      }

      phraseIndex = (phraseIndex + 1) % BADGE_PHRASES.length;
      badge.style.opacity = '0';
      window.setTimeout(() => {
        badge.textContent = BADGE_PHRASES[phraseIndex];
        badge.style.opacity = '1';
      }, 400);
    }, 4000);

    class TextScramble {
      constructor(el) {
        this.el = el;
        this.chars = '01#X$!<>-_\\/[]{}=+*^?';
        this.update = this.update.bind(this);
      }

      setText(newText) {
        const oldText = this.el.textContent || '';
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => {
          this.resolve = resolve;
        });

        this.queue = [];
        for (let i = 0; i < length; i += 1) {
          const from = oldText[i] || '';
          const to = newText[i] || '';
          const start = Math.floor(Math.random() * 40);
          const end = start + Math.floor(Math.random() * 40);
          this.queue.push({ from, to, start, end, char: '' });
        }

        window.cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
      }

      update() {
        let output = '';
        let complete = 0;

        for (let i = 0; i < this.queue.length; i += 1) {
          let { from, to, start, end, char } = this.queue[i];
          if (this.frame >= end) {
            complete += 1;
            output += to;
          } else if (this.frame >= start) {
            if (!char || Math.random() < 0.28) {
              char = this.chars[Math.floor(Math.random() * this.chars.length)];
              this.queue[i].char = char;
            }
            output += `<span class="tx-scramble-char">${char}</span>`;
          } else {
            output += from;
          }
        }

        this.el.innerHTML = output;

        if (complete === this.queue.length) {
          this.resolve();
        } else {
          this.frameRequest = window.requestAnimationFrame(this.update);
          this.frame += 1;
        }
      }
    }

    const scrambleTarget = document.getElementById('tx-scramble-target');
    let scrambleRaf = null;
    const scrambleDelay = window.setTimeout(() => {
      if (!scrambleTarget) {
        return;
      }
      const scramble = new TextScramble(scrambleTarget);
      scramble.setText(
        'Turn noisy timelines into structured conviction. TraderX combines whale flow, sentiment context, and tactical alerts in a clean execution workspace.'
      );
      scrambleRaf = scramble.frameRequest;
    }, 280);

    const canvas = document.getElementById('tx-particle-canvas');
    let rafId = 0;
    let particles = [];

    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        let width = 0;
        let height = 0;
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isCompact = window.innerWidth < 980;

        const mouse = { x: -1000, y: -1000, radius: isCompact ? 140 : 240 };

        const onCanvasMouseMove = (e) => {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        };

        const onCanvasMouseLeave = () => {
          mouse.x = -1000;
          mouse.y = -1000;
        };

        const resize = () => {
          width = canvas.clientWidth;
          height = canvas.clientHeight;
          canvas.width = width;
          canvas.height = height;
        };

        class Particle {
          constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = Math.random() * 24 + 1;
            this.size = Math.random() * 1.4 + 0.5;
            this.isSignal = Math.random() > 0.92;
          }

          update() {
            this.baseX += (Math.random() - 0.5) * 0.45;
            this.baseY -= Math.random() * 0.5;

            if (this.baseY < 0) this.baseY = height;
            if (this.baseX < 0) this.baseX = width;
            if (this.baseX > width) this.baseX = 0;

            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            if (force < 0) force = 0;

            const dirX = (dx / distance) * force * this.density;
            const dirY = (dy / distance) * force * this.density;

            if (distance < mouse.radius) {
              if (this.isSignal) {
                this.x += dirX * 0.5;
                this.y += dirY * 0.5;
              } else {
                this.x -= dirX * 0.7;
                this.y -= dirY * 0.7;
              }
            } else {
              this.x += (this.baseX - this.x) / 16;
              this.y += (this.baseY - this.y) / 16;
            }
          }

          draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.isSignal ? this.size * 1.6 : this.size, 0, Math.PI * 2);
            if (this.isSignal) {
              ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
              ctx.shadowBlur = 8;
              ctx.shadowColor = '#10B981';
            } else {
              ctx.fillStyle = 'rgba(255,255,255,0.12)';
              ctx.shadowBlur = 0;
            }
            ctx.fill();
          }
        }

        const makeParticles = () => {
          const density = isCompact ? 15000 : 9000;
          const particleCount = Math.max(36, Math.floor((window.innerWidth * window.innerHeight) / density));
          particles = Array.from({ length: particleCount }, () => new Particle());
        };

        const drawConnections = () => {
          if (isCompact) {
            return;
          }

          const signals = particles.filter((p) => p.isSignal);
          ctx.shadowBlur = 0;

          for (let i = 0; i < signals.length; i += 1) {
            for (let j = i + 1; j < signals.length; j += 1) {
              const dx = signals[i].x - signals[j].x;
              const dy = signals[i].y - signals[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 180) {
                const opacity = 0.3 - (dist / 180) * 0.3;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.moveTo(signals[i].x, signals[i].y);
                ctx.lineTo(signals[j].x, signals[j].y);
                ctx.stroke();
              }
            }
          }
        };

        const animate = () => {
          ctx.clearRect(0, 0, width, height);
          particles.forEach((p) => {
            p.update();
            p.draw();
          });
          drawConnections();
          rafId = window.requestAnimationFrame(animate);
        };

        resize();
        makeParticles();

        window.addEventListener('mousemove', onCanvasMouseMove);
        window.addEventListener('mouseleave', onCanvasMouseLeave);
        window.addEventListener('resize', () => {
          resize();
          makeParticles();
        });

        if (!prefersReduced) {
          animate();
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      window.clearInterval(badgeInterval);
      window.clearTimeout(scrambleDelay);
      if (scrambleRaf) {
        window.cancelAnimationFrame(scrambleRaf);
      }
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div className="tx-landing">
      <div id="tx-spotlight" />

      <div className="tx-ticker-wrap">
        <div className="tx-ticker-track">
          <span className="tx-ticker-item"><span className="tx-dot tx-green" />$BTC: BULLISH (0.89)</span>
          <span className="tx-ticker-item"><span className="tx-dot tx-amber" />$TSLA: VOLATILE</span>
          <span className="tx-ticker-item tx-green-text">+2,401 signals parsed</span>
          <span className="tx-ticker-item">Whale alert: 1.2K ETH moved</span>
          <span className="tx-ticker-item"><span className="tx-dot tx-green" />$SOL: BULLISH (0.92)</span>
          <span className="tx-ticker-item">Tier 1 influencer: neutral</span>
          <span className="tx-ticker-item"><span className="tx-dot tx-green" />$NVDA: VERY BULLISH</span>
          <span className="tx-ticker-item"><span className="tx-dot tx-green" />$BTC: BULLISH (0.89)</span>
          <span className="tx-ticker-item"><span className="tx-dot tx-amber" />$TSLA: VOLATILE</span>
          <span className="tx-ticker-item tx-green-text">+2,401 signals parsed</span>
          <span className="tx-ticker-item">Whale alert: 1.2K ETH moved</span>
        </div>
      </div>

      <header className="tx-header" id="main-header">
        <div className="tx-container tx-header-inner">
          <div className="tx-brand">
            <div className="tx-logo-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#10B981" />
              </svg>
            </div>
            <span className="tx-brand-name">
              TraderX
              <span className="tx-brand-pill">Pro</span>
            </span>
          </div>

          <nav className="tx-nav">
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/community">Community</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/launch">Launch</Link>
          </nav>

          <div className="tx-header-right">
            <div className="tx-system-status">
              <span className="tx-dot tx-green tx-pulse" />
              Systems online
            </div>
            <Link href="/launch" className="tx-btn tx-btn-sm tx-btn-outline">Download</Link>
          </div>
        </div>
      </header>

      <section className="tx-hero" id="hero">
        <canvas id="tx-particle-canvas" className="tx-canvas" />
        <div className="tx-perspective-floor" />

        <div className="tx-container tx-hero-grid">
          <div className="tx-hero-left">
            <div className="tx-status-chip tx-reveal">
              <span className="tx-dot tx-green" />
              <span id="tx-typing-badge">Initializing FinBERT Engine...</span>
            </div>

            <h1 className="tx-hero-title tx-reveal delay-100">
              A calmer, sharper way
              <br />
              to trade on <span className="tx-sweep-text">X</span>.
            </h1>

            <p id="tx-scramble-target" className="tx-hero-subtitle tx-reveal delay-200">
              Turn noisy timelines into structured conviction.
            </p>

            <div className="tx-hero-cta tx-reveal delay-300">
              <a href="https://github.com/bhrigu-verma/traderx-extension/releases/tag/v1.0.0" target="_blank" rel="noopener noreferrer" className="tx-btn tx-btn-primary">
                <span>Start Tracking</span>
              </a>
              <div className="tx-hero-meta">988+ curated institutional accounts</div>
            </div>
          </div>

          <div className="tx-hero-right tx-reveal delay-300">
            <div className="tx-radar tx-radar-main" />
            <div className="tx-radar tx-radar-dashed" />
            <div className="tx-radar tx-radar-inner" />

            <svg className="tx-engine-lines" viewBox="0 0 550 550" aria-hidden="true">
              <path d="M 480 150 Q 380 200 275 275" className="tx-flow-in" />
              <path d="M 500 400 Q 380 350 275 275" className="tx-flow-in" />
              <path d="M 400 500 Q 350 400 275 275" className="tx-flow-in" />
              <path d="M 275 275 Q 150 180 80 120" className="tx-flow-out" />
              <path d="M 275 275 Q 150 350 60 420" className="tx-flow-out" />
              <path d="M 275 275 Q 100 275 40 275" className="tx-flow-out" />
            </svg>

            <div className="tx-engine-core">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                <line x1="12" y1="22" x2="12" y2="15.5" />
                <polyline points="22 8.5 12 15.5 2 8.5" />
                <polyline points="2 15.5 12 8.5 22 15.5" />
                <line x1="12" y1="2" x2="12" y2="8.5" />
              </svg>
              <div className="tx-engine-title">FinBERT</div>
              <div className="tx-engine-sub">Processing</div>
            </div>

            <article className="tx-panel tx-panel-noise tx-float-1">
              <div className="tx-panel-top">
                <span>@DegenApe99</span>
                <span className="tx-badge-red">Engagement bait</span>
              </div>
              <p>RT if you think $PEPE is going to move by tomorrow.</p>
            </article>

            <article className="tx-panel tx-panel-noise tx-float-3">
              <div className="tx-panel-top">
                <span>@CryptoGuru</span>
                <span className="tx-badge-red">Spam</span>
              </div>
              <p>Link in bio for VIP signals. Guaranteed returns.</p>
            </article>

            <article className="tx-panel tx-panel-signal tx-float-2">
              <div className="tx-panel-top">
                <span className="tx-badge-green">Structured signal</span>
                <span>Just now</span>
              </div>
              <h3>$BTC momentum</h3>
              <p>Tier-1 institutional accumulation detected across major wallets.</p>
            </article>

            <article className="tx-panel tx-panel-alert tx-float-1">
              <div className="tx-panel-top">
                <span className="tx-badge-amber">Volatility alert</span>
              </div>
              <h3>$TSLA earnings context</h3>
              <p>Sentiment divergence high. Standard deviation greater than threshold.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="features" className="tx-section tx-section-dark">
        <div className="tx-container tx-section-head tx-reveal">
          <span className="tx-section-pill">Features</span>
          <h2>A platform that feels deliberate</h2>
          <p>Each module removes noise, improves timing, and supports disciplined execution.</p>
        </div>

        <div className="tx-container tx-card-grid">
          {[
            ['Core signal', 'AI Trading Copilot', 'Generate cleaner plans with entries, stops, and confidence windows from sentiment and structure.'],
            ['On-chain', 'Whale Flow Tracker', 'Detect accumulation versus distribution before social narratives catch up.'],
            ['Workflow', 'Infinite Data Export', 'Capture full context while you scroll and export for journals or quant analysis.'],
            ['Context', 'Sector Heatmaps', 'Read momentum by narrative cluster and rotate attention to active sectors.'],
            ['Precision', 'Combo Alerts', 'Stack conditions so alerts trigger only when conviction is high.'],
            ['Trust', 'Verified Institutional Tier', 'Filter to curated macro, institutional, and tier-1 accounts.'],
          ].map((item, idx) => (
            <article key={item[1]} className={`tx-spotlight-card tx-reveal delay-${(idx % 3) * 100}`}>
              <span className="tx-card-tag">{item[0]}</span>
              <h3>{item[1]}</h3>
              <p>{item[2]}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="tx-section tx-section-soft">
        <div className="tx-container tx-section-head tx-reveal">
          <span className="tx-section-pill">How it works</span>
          <h2 className="tx-workflow-title">
            <span className="tx-workflow-highlight">Fast onboarding</span>, durable execution edge
          </h2>
          <p>A short setup path designed for repeatable, high-quality execution inside your browser.</p>
        </div>

        <div className="tx-container tx-timeline-container">
          <div className="tx-timeline-line">
            <div className="tx-timeline-fill" />
          </div>

          {[
            ['Step 01', 'Download and install', 'Install the extension, pin it, and initialize your workspace.'],
            ['Step 02', 'Use X as usual', 'Continue browsing while TraderX layers intelligence in real time.'],
            ['Step 03', 'Define your conditions', 'Set watchlists and combo alerts aligned with your framework.'],
            ['Step 04', 'Execute with confidence', 'Act only when confluence aligns and export clean post-trade data.'],
          ].map((step, idx) => (
            <div key={step[0]} className={`tx-step-item tx-reveal delay-${(idx % 3) * 100}`}>
              <div className="tx-step-icon"><span className="tx-step-svg" /></div>
              <div className="tx-step-content">
                <span className="tx-step-kicker">{step[0]}</span>
                <h3>{step[1]}</h3>
                <p>{step[2]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="testimonials" className="tx-section tx-section-dark">
        <div className="tx-container tx-section-head tx-reveal">
          <span className="tx-section-pill">Testimonials</span>
          <h2>What traders notice first</h2>
          <p>Sharper focus, cleaner timing, and less reactive decision-making.</p>
        </div>

        <div className="tx-container tx-card-grid tx-testimonial-grid">
          {[
            ['A. Patel', 'Independent Trader', 'TraderX cuts through narrative spikes fast and keeps my execution calm.'],
            ['M. Chen', 'Research Analyst', 'We use it as first-pass filtering before deep desk analysis.'],
            ['J. Romero', 'Quant Hobbyist', 'Signals appear where I already work, with no extra workflow friction.'],
            ['S. Williams', 'Swing Trader', 'Combo alerts reduced random pings and improved decision quality.'],
            ['K. Nakamura', 'Data Scientist', 'Export depth integrates cleanly with my notebooks and pipelines.'],
            ['R. Goldman', 'Portfolio Manager', 'Institutional filters fit our team workflow immediately.'],
          ].map((item, idx) => (
            <article key={item[0]} className={`tx-spotlight-card tx-reveal delay-${(idx % 3) * 100}`}>
              <div className="tx-stars">*****</div>
              <p className="tx-quote">{item[2]}</p>
              <div className="tx-profile">
                <div className="tx-avatar">{item[0].split(' ').map((s) => s[0]).join('')}</div>
                <div>
                  <div className="tx-name">{item[0]}</div>
                  <div className="tx-role">{item[1]}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tx-section tx-section-cta">
        <div className="tx-cta-glow" />
        <div className="tx-container tx-cta tx-reveal">
          <h2>Build your edge. Keep your composure.</h2>
          <p>
            TraderX gives you a premium intelligence layer inside the feed you already use,
            with less noise and better decision timing from day one.
          </p>
          <div className="tx-hero-cta">
            <a href="#" className="tx-btn tx-btn-primary">Download Extension</a>
            <a href="#" className="tx-btn tx-btn-outline">View Plans</a>
          </div>
          <div className="tx-small-note">No credit card required. Cancel anytime. Works on Chromium browsers.</div>
        </div>

        <footer className="tx-container tx-footer tx-reveal delay-100">
          <div className="tx-footer-grid">
            <div>
              <div className="tx-brand">
                <div className="tx-logo-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#10B981" />
                  </svg>
                </div>
                <span className="tx-brand-name">TraderX Pro</span>
              </div>
              <p className="tx-footer-copy">
                AI-powered trading intelligence that turns X noise into actionable signals.
              </p>
            </div>

            <div>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#">Pricing</a>
              <a href="#workflow">How it works</a>
            </div>

            <div>
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">API reference</a>
              <a href="#">Community</a>
            </div>

            <div>
              <h4>Company</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact</a>
            </div>
          </div>

          <div className="tx-footer-bottom">
            <span>Copyright 2026 TraderX Pro. All rights reserved.</span>
            <span className="tx-credit-line">
              Built by Bhrigu Verma ·{' '}
              <a href="https://www.linkedin.com/in/bhrigu-verma-89090a273/" target="_blank" rel="noopener noreferrer">LinkedIn</a>{' '}
              ·{' '}
              <a href="https://github.com/bhrigu-verma" target="_blank" rel="noopener noreferrer">GitHub</a>
            </span>
          </div>
        </footer>
      </section>

      <style jsx global>{`
        .tx-landing {
          --obsidian: #050505;
          --graphite: #121212;
          --emerald: #10b981;
          --emerald-bright: #00e676;
          --amber: #f59e0b;
          --red-neon: #ef4444;
          --text-main: #f9fafb;
          --text-muted: #9ca3af;
          --border-dim: rgba(255, 255, 255, 0.05);
          --scroll-progress: 0%;
          position: relative;
          background: var(--obsidian);
          color: var(--text-main);
          font-family: var(--font-sans), Inter, system-ui, sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .tx-landing * {
          box-sizing: border-box;
        }

        .tx-container {
          width: min(1200px, calc(100% - 48px));
          margin: 0 auto;
        }

        #tx-spotlight {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 15;
          background: radial-gradient(
            circle 560px at var(--mouse-x, 50vw) var(--mouse-y, 50vh),
            rgba(16, 185, 129, 0.03),
            transparent 80%
          );
        }

        .tx-ticker-wrap {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 35;
          overflow: hidden;
          background: #0a0a0a;
          border-bottom: 1px solid var(--border-dim);
          white-space: nowrap;
          padding: 7px 0;
        }

        .tx-ticker-track {
          display: inline-flex;
          min-width: 200%;
          animation: txTicker 42s linear infinite;
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--text-muted);
        }

        .tx-ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 22px;
        }

        .tx-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          display: inline-flex;
        }

        .tx-green {
          background: var(--emerald);
        }

        .tx-amber {
          background: var(--amber);
        }

        .tx-green-text {
          color: var(--emerald);
        }

        .tx-pulse {
          box-shadow: 0 0 0 rgba(16, 185, 129, 0.7);
          animation: txPulse 2s infinite;
        }

        .tx-header {
          position: fixed;
          top: 34px;
          left: 0;
          right: 0;
          z-index: 45;
          background: rgba(5, 5, 5, 0.68);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-dim);
          padding: 14px 0;
        }

        .tx-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .tx-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tx-logo-wrap {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid #1f2937;
          background: var(--graphite);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 18px rgba(16, 185, 129, 0.2);
        }

        .tx-brand-name {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          letter-spacing: -0.02em;
          font-size: 20px;
        }

        .tx-brand-pill {
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--emerald);
          border: 1px solid rgba(16, 185, 129, 0.35);
          border-radius: 6px;
          padding: 2px 6px;
          background: rgba(16, 185, 129, 0.1);
        }

        .tx-nav {
          display: inline-flex;
          gap: 28px;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
        }

        .tx-nav a:hover {
          color: #ffffff;
        }

        .tx-header-right {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .tx-system-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .tx-btn {
          border-radius: 10px;
          border: 1px solid transparent;
          color: #ffffff;
          text-decoration: none;
          transition: 220ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .tx-btn-sm {
          font-size: 13px;
          padding: 8px 14px;
        }

        .tx-btn-primary {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(0, 230, 118, 0.9));
          color: #04120d;
          font-size: 14px;
          padding: 13px 24px;
          box-shadow: 0 12px 30px rgba(16, 185, 129, 0.26);
        }

        .tx-btn-primary:hover {
          transform: translateY(-1px);
        }

        .tx-btn-outline {
          border-color: #2a2a2a;
          background: #0b0b0b;
          color: #f5f5f5;
          font-size: 14px;
          padding: 13px 24px;
        }

        .tx-btn-outline:hover {
          border-color: #4b5563;
          background: #151515;
        }

        .tx-hero {
          position: relative;
          min-height: 100vh;
          padding: 118px 0 50px;
          overflow: hidden;
        }

        .tx-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .tx-perspective-floor {
          position: absolute;
          bottom: -20%;
          left: -50%;
          width: 200%;
          height: 100%;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 50px 50px;
          transform: perspective(600px) rotateX(75deg);
          mask-image: linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
          z-index: 1;
          pointer-events: none;
        }

        .tx-hero-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
          align-items: center;
        }

        .tx-hero-left {
          text-align: left;
        }

        .tx-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #2b2b2b;
          background: rgba(18, 18, 18, 0.8);
          border-radius: 999px;
          font-size: 12px;
          color: var(--text-muted);
          padding: 8px 14px;
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
          margin-bottom: 26px;
        }

        .tx-hero-title {
          font-size: clamp(44px, 6.6vw, 74px);
          line-height: 1.02;
          letter-spacing: -0.04em;
          margin: 0 0 18px;
          font-weight: 800;
        }

        .tx-sweep-text {
          background: linear-gradient(to right, #10b981 20%, #00e676 40%, #ffffff 50%, #00e676 60%, #10b981 80%);
          background-size: 200% auto;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          animation: txShine 3s linear infinite;
        }

        .tx-hero-subtitle {
          color: var(--text-muted);
          font-size: 18px;
          line-height: 1.8;
          max-width: 620px;
          margin-bottom: 24px;
          min-height: 68px;
        }

        .tx-scramble-char {
          color: var(--emerald);
          opacity: 0.85;
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
        }

        .tx-hero-cta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .tx-hero-meta {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
        }

        .tx-hero-right {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          max-width: 560px;
          margin-left: auto;
        }

        .tx-radar {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .tx-radar-main {
          inset: 18px;
          background: conic-gradient(from 0deg, transparent 72%, rgba(16, 185, 129, 0.05) 90%, rgba(16, 185, 129, 0.3) 100%);
          animation: txRadarSpin 4s linear infinite;
        }

        .tx-radar-dashed {
          inset: 68px;
          border: 1px dashed rgba(255, 255, 255, 0.16);
          animation: txSpinSlow 8s linear infinite;
        }

        .tx-radar-inner {
          inset: 126px;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .tx-engine-lines {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 8;
          fill: none;
        }

        .tx-flow-in {
          stroke: rgba(255, 255, 255, 0.16);
          stroke-width: 2;
          stroke-dasharray: 6 6;
          animation: txFlowIn 20s linear infinite;
        }

        .tx-flow-out {
          stroke: rgba(16, 185, 129, 0.52);
          stroke-width: 2;
          stroke-dasharray: 8 8;
          animation: txFlowOut 15s linear infinite;
        }

        .tx-engine-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 18;
          width: 132px;
          height: 132px;
          border-radius: 18px;
          border: 1px solid rgba(16, 185, 129, 0.6);
          background: linear-gradient(135deg, rgba(20, 20, 20, 0.86), rgba(8, 8, 8, 0.9));
          backdrop-filter: blur(16px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow:
            0 0 32px rgba(16, 185, 129, 0.2),
            inset 0 0 18px rgba(16, 185, 129, 0.08);
          animation: txCorePulse 3s ease-in-out infinite;
        }

        .tx-engine-title {
          font-size: 11px;
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 0.11em;
          color: var(--emerald);
          font-weight: 700;
        }

        .tx-engine-sub {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
        }

        .tx-panel {
          position: absolute;
          z-index: 16;
          border-radius: 12px;
          padding: 12px;
          background: linear-gradient(135deg, rgba(20, 20, 20, 0.8), rgba(10, 10, 10, 0.9));
          border: 1px solid rgba(255, 255, 255, 0.09);
          backdrop-filter: blur(14px);
          box-shadow: 0 20px 40px -14px rgba(0, 0, 0, 0.45);
        }

        .tx-panel-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 10px;
          color: var(--text-muted);
          margin-bottom: 6px;
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
        }

        .tx-panel h3 {
          font-size: 15px;
          margin: 0 0 4px;
        }

        .tx-panel p {
          margin: 0;
          font-size: 12px;
          line-height: 1.5;
          color: #d4d4d8;
        }

        .tx-panel-noise {
          width: 220px;
          opacity: 0.62;
        }

        .tx-panel-signal {
          width: 254px;
          border-color: rgba(16, 185, 129, 0.42);
          box-shadow: 0 0 28px rgba(16, 185, 129, 0.14);
        }

        .tx-panel-alert {
          width: 236px;
          border-color: rgba(245, 158, 11, 0.38);
          box-shadow: 0 0 28px rgba(245, 158, 11, 0.11);
        }

        .tx-panel-noise:nth-of-type(1) {
          right: 8%;
          top: 14%;
          transform: rotate(8deg);
        }

        .tx-panel-noise:nth-of-type(2) {
          right: 2%;
          bottom: 22%;
          transform: rotate(-5deg);
        }

        .tx-panel-signal {
          left: 3%;
          top: 10%;
        }

        .tx-panel-alert {
          left: -6%;
          bottom: 24%;
        }

        .tx-badge-red,
        .tx-badge-green,
        .tx-badge-amber {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-radius: 4px;
          padding: 2px 5px;
        }

        .tx-badge-red {
          color: var(--red-neon);
          border: 1px solid rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.1);
        }

        .tx-badge-green {
          color: #042617;
          border: 1px solid rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.95);
        }

        .tx-badge-amber {
          color: #2d1602;
          border: 1px solid rgba(245, 158, 11, 0.42);
          background: rgba(245, 158, 11, 0.92);
        }

        .tx-float-1 {
          animation: txFloat 6s ease-in-out infinite;
        }

        .tx-float-2 {
          animation: txFloat 8s ease-in-out infinite 1s;
        }

        .tx-float-3 {
          animation: txFloat 7s ease-in-out infinite 2s;
        }

        .tx-section {
          position: relative;
          z-index: 20;
          border-top: 1px solid var(--border-dim);
          padding: 120px 0;
        }

        .tx-section-dark {
          background: #050505;
        }

        .tx-section-soft {
          background: #080808;
        }

        .tx-section-cta {
          background: #030303;
          overflow: hidden;
          padding-bottom: 56px;
        }

        .tx-section-head {
          text-align: center;
          margin-bottom: 72px;
        }

        .tx-section-pill {
          display: inline-flex;
          border: 1px solid #2a2a2a;
          border-radius: 999px;
          padding: 5px 12px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--emerald);
          background: rgba(16, 185, 129, 0.05);
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
          margin-bottom: 20px;
        }

        .tx-section-head h2 {
          font-size: clamp(34px, 5vw, 56px);
          margin: 0 0 16px;
          letter-spacing: -0.03em;
        }

        .tx-workflow-title {
          display: inline-flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tx-workflow-highlight {
          position: relative;
          color: transparent;
          background: linear-gradient(90deg, #10b981, #6ee7b7, #10b981);
          background-size: 220% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          animation: txWorkflowShimmer 3.4s linear infinite;
        }

        .tx-section-head p {
          color: var(--text-muted);
          font-size: 18px;
          max-width: 760px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .tx-card-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .tx-spotlight-card {
          border-radius: 16px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(18, 18, 18, 0.6);
          position: relative;
          overflow: hidden;
          transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1), border-color 260ms ease;
        }

        .tx-spotlight-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            520px circle at var(--card-mouse-x, 50%) var(--card-mouse-y, 50%),
            rgba(16, 185, 129, 0.08),
            transparent 42%
          );
          opacity: 0;
          transition: opacity 220ms ease;
          pointer-events: none;
        }

        .tx-spotlight-card:hover {
          transform: translateY(-4px);
          border-color: rgba(16, 185, 129, 0.24);
        }

        .tx-spotlight-card:hover::before {
          opacity: 1;
        }

        .tx-card-tag {
          display: inline-flex;
          border-radius: 6px;
          border: 1px solid #313131;
          background: #151515;
          color: var(--text-muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
          padding: 4px 8px;
          margin-bottom: 18px;
        }

        .tx-spotlight-card h3 {
          font-size: 24px;
          margin: 0 0 12px;
          letter-spacing: -0.02em;
        }

        .tx-spotlight-card p {
          margin: 0;
          color: var(--text-muted);
          line-height: 1.7;
          font-size: 15px;
        }

        .tx-timeline-container {
          position: relative;
          max-width: 980px;
        }

        .tx-timeline-line {
          position: absolute;
          left: 18px;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .tx-timeline-fill {
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            var(--emerald) var(--scroll-progress),
            rgba(255, 255, 255, 0.1) var(--scroll-progress)
          );
        }

        .tx-step-item {
          position: relative;
          display: grid;
          grid-template-columns: 46px 1fr;
          gap: 24px;
          align-items: start;
          margin-bottom: 46px;
        }

        .tx-step-content {
          min-width: 0;
        }

        .tx-step-icon {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 2px solid #374151;
          background: #0f0f0f;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
          transition: border-color 220ms ease, background 220ms ease;
        }

        .tx-step-icon.is-active {
          border-color: var(--emerald);
          background: rgba(16, 185, 129, 0.12);
        }

        .tx-step-svg {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: #9ca3af;
        }

        .tx-step-svg.is-active {
          background: var(--emerald);
        }

        .tx-step-kicker {
          display: inline-flex;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--emerald);
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
          margin-bottom: 8px;
        }

        .tx-step-content h3 {
          margin: 0 0 10px;
          font-size: 28px;
          letter-spacing: -0.02em;
        }

        .tx-step-content p {
          margin: 0;
          color: var(--text-muted);
          line-height: 1.7;
          font-size: 15px;
          max-width: 640px;
        }

        .tx-testimonial-grid .tx-spotlight-card {
          display: flex;
          flex-direction: column;
          min-height: 280px;
        }

        .tx-stars {
          color: var(--amber);
          letter-spacing: 2px;
          margin-bottom: 16px;
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
        }

        .tx-quote {
          flex: 1;
          margin: 0 0 22px;
          color: #f3f4f6;
          line-height: 1.7;
        }

        .tx-profile {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tx-avatar {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 1px solid #374151;
          background: #171717;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--text-muted);
          font-size: 12px;
        }

        .tx-name {
          font-weight: 700;
        }

        .tx-role {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
        }

        .tx-cta-glow {
          position: absolute;
          top: 26%;
          left: 50%;
          transform: translateX(-50%);
          width: min(900px, 90vw);
          height: 360px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.28);
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.25;
        }

        .tx-cta {
          text-align: center;
          margin-bottom: 86px;
          position: relative;
        }

        .tx-cta h2 {
          font-size: clamp(38px, 5.6vw, 72px);
          letter-spacing: -0.04em;
          margin: 0 auto 14px;
          line-height: 1.06;
          max-width: 980px;
        }

        .tx-cta p {
          margin: 0 auto 28px;
          max-width: 820px;
          color: var(--text-muted);
          font-size: 20px;
          line-height: 1.7;
        }

        .tx-small-note {
          margin-top: 16px;
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
        }

        .tx-footer {
          border-top: 1px solid var(--border-dim);
          padding-top: 52px;
        }

        .tx-footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 36px;
          margin-bottom: 42px;
        }

        .tx-footer h4 {
          margin: 0 0 14px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.09em;
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
          font-size: 11px;
        }

        .tx-footer a {
          display: block;
          margin-bottom: 10px;
          color: #d1d5db;
          font-size: 14px;
          text-decoration: none;
          transition: color 180ms ease;
        }

        .tx-footer a:hover {
          color: var(--emerald);
        }

        .tx-footer-copy {
          margin-top: 14px;
          color: var(--text-muted);
          line-height: 1.7;
          max-width: 360px;
        }

        .tx-footer-bottom {
          border-top: 1px solid var(--border-dim);
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding-top: 18px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .tx-credit-line a {
          color: #d1d5db;
          text-decoration: none;
          transition: color 180ms ease;
        }

        .tx-credit-line a:hover {
          color: var(--emerald);
        }

        .tx-reveal {
          opacity: 0;
          transform: translateY(34px);
          transition:
            opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tx-reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        .delay-100 {
          transition-delay: 100ms;
        }

        .delay-200 {
          transition-delay: 200ms;
        }

        .delay-300 {
          transition-delay: 300ms;
        }

        @keyframes txTicker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }

        @keyframes txPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        @keyframes txShine {
          to { background-position: 200% center; }
        }

        @keyframes txSpinSlow {
          to { transform: rotate(360deg); }
        }

        @keyframes txRadarSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes txFlowIn {
          to { stroke-dashoffset: 1000; }
        }

        @keyframes txFlowOut {
          to { stroke-dashoffset: -1000; }
        }

        @keyframes txCorePulse {
          0%, 100% {
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.1), inset 0 0 20px rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
          }
          50% {
            box-shadow: 0 0 60px rgba(16, 185, 129, 0.35), inset 0 0 30px rgba(16, 185, 129, 0.3);
            border-color: rgba(16, 185, 129, 0.8);
          }
        }

        @keyframes txFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(1.2deg); }
        }

        @keyframes txWorkflowShimmer {
          from { background-position: 220% 0; }
          to { background-position: 0 0; }
        }

        @media (max-width: 1120px) {
          .tx-nav,
          .tx-system-status,
          .tx-hero-right {
            display: none;
          }

          .tx-hero {
            min-height: auto;
            padding: 126px 0 70px;
          }

          .tx-hero-grid {
            grid-template-columns: 1fr;
          }

          .tx-hero-left {
            max-width: 800px;
          }

          .tx-card-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .tx-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .tx-container {
            width: calc(100% - 28px);
          }

          .tx-header {
            top: 34px;
          }

          .tx-brand-name {
            font-size: 18px;
          }

          .tx-btn-sm {
            font-size: 12px;
            padding: 7px 10px;
          }

          .tx-hero-title {
            font-size: clamp(38px, 12vw, 52px);
          }

          .tx-hero-subtitle {
            font-size: 16px;
            min-height: auto;
          }

          .tx-section {
            padding: 84px 0;
          }

          .tx-section-head h2 {
            font-size: clamp(28px, 9vw, 40px);
          }

          .tx-section-head p {
            font-size: 16px;
          }

          .tx-card-grid {
            grid-template-columns: 1fr;
          }

          .tx-spotlight-card {
            padding: 24px;
          }

          .tx-step-item {
            grid-template-columns: 40px 1fr;
            gap: 16px;
            margin-bottom: 34px;
          }

          .tx-step-content h3 {
            font-size: 24px;
          }

          .tx-cta {
            margin-bottom: 56px;
          }

          .tx-cta p {
            font-size: 17px;
          }

          .tx-footer-grid {
            grid-template-columns: 1fr;
            gap: 26px;
          }

          .tx-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
