'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HomeClient() {
    const spotlightRef = useRef(null);
    const typingBadgeRef = useRef(null);
    const scrambleTargetRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        // 1. Global Mouse Spotlight Tracking
        const handleMouseMove = (e) => {
            const root = document.documentElement;
            root.style.setProperty('--mouse-x', `${e.clientX}px`);
            root.style.setProperty('--mouse-y', `${e.clientY}px`);

            document.querySelectorAll('.spotlight-card').forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--card-mouse-x', `${x}px`);
                card.style.setProperty('--card-mouse-y', `${y}px`);
            });
        };
        document.addEventListener('mousemove', handleMouseMove);

        // 2. Intersection Observer (Scroll Reveal)
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    if (entry.target.classList.contains('step-item')) {
                        const icon = entry.target.querySelector('.step-icon');
                        const svg = entry.target.querySelector('.step-svg');
                        if (icon && svg) {
                            setTimeout(() => {
                                icon.classList.add('border-emerald', 'bg-emerald/10');
                                icon.classList.remove('border-gray-800', 'bg-obsidian');
                                svg.setAttribute('stroke', '#10B981');
                            }, 300);
                        }
                    }
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach((el) => {
            observer.observe(el);
        });

        const handleScroll = () => {
            const timeline = document.querySelector('.timeline-container');
            if (timeline) {
                const rect = timeline.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                let progress = 0;
                if (rect.top < windowHeight / 2) {
                    progress = Math.min(100, Math.max(0, ((windowHeight / 2 - rect.top) / rect.height) * 100));
                }
                document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
            }
        };
        window.addEventListener('scroll', handleScroll);

        // 3. Typing Badge Animation
        const badgePhrases = [
            "Initializing FinBERT Engine...",
            "Connecting to X.com DOM...",
            "Loading 988 Institutional Accounts...",
            "System Ready. Awaiting Signals."
        ];
        let phraseIndex = 0;
        let badgeInterval;
        if (typingBadgeRef.current) {
             badgeInterval = setInterval(() => {
                phraseIndex = (phraseIndex + 1) % badgePhrases.length;
                if(typingBadgeRef.current) {
                    typingBadgeRef.current.style.opacity = 0;
                    setTimeout(() => {
                        if(typingBadgeRef.current) {
                            typingBadgeRef.current.innerText = badgePhrases[phraseIndex];
                            typingBadgeRef.current.style.opacity = 1;
                            typingBadgeRef.current.style.transition = "opacity 0.5s ease";
                        }
                    }, 500);
                }
            }, 4000);
        }

        // 4. Text Scramble Animation
        class TextScramble {
            constructor(el) {
                this.el = el;
                this.chars = '01#X$!<>-_\\/[]{}—=+*^?#';
                this.update = this.update.bind(this);
            }
            setText(newText) {
                const oldText = this.el.innerText;
                const length = Math.max(oldText.length, newText.length);
                const promise = new Promise((resolve) => this.resolve = resolve);
                this.queue = [];
                for (let i = 0; i < length; i++) {
                    const from = oldText[i] || '';
                    const to = newText[i] || '';
                    const start = Math.floor(Math.random() * 40);
                    const end = start + Math.floor(Math.random() * 40);
                    this.queue.push({ from, to, start, end, char: '' });
                }
                cancelAnimationFrame(this.frameRequest);
                this.frame = 0;
                this.update();
                return promise;
            }
            update() {
                let output = '';
                let complete = 0;
                for (let i = 0, n = this.queue.length; i < n; i++) {
                    let { from, to, start, end, char } = this.queue[i];
                    if (this.frame >= end) {
                        complete++;
                        output += to;
                    } else if (this.frame >= start) {
                        if (!char || Math.random() < 0.28) {
                            char = this.chars[Math.floor(Math.random() * this.chars.length)];
                            this.queue[i].char = char;
                        }
                        output += `<span style="color: #10B981; opacity: 0.8; font-family: monospace;">${char}</span>`;
                    } else {
                        output += from;
                    }
                }
                this.el.innerHTML = output;
                if (complete === this.queue.length) {
                    this.resolve();
                } else {
                    this.frameRequest = requestAnimationFrame(this.update);
                    this.frame++;
                }
            }
        }

        let fx;
        let scrambleTimeout;
        if (scrambleTargetRef.current) {
            scrambleTimeout = setTimeout(() => {
                if (scrambleTargetRef.current) {
                    fx = new TextScramble(scrambleTargetRef.current);
                    fx.setText("Turn noisy timelines into structured conviction. TraderX combines whale flow, sentiment context, and tactical alerts in a clean execution workspace.");
                }
            }, 300);
        }

        // 5. Hero Particle Physics Canvas
        const canvas = canvasRef.current;
        let ctx;
        let particles = [];
        let animationFrameId;

        let mouse = { x: -1000, y: -1000, radius: 250 };

        const handleCanvasMouseMove = (e) => {
            if (e.clientY < window.innerHeight) {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            } else {
                mouse.x = -1000; mouse.y = -1000;
            }
        };

        const handleCanvasMouseLeave = () => {
            mouse.x = -1000; mouse.y = -1000;
        };

        let width, height;
        function resize() {
            if(canvas) {
                width = window.innerWidth;
                height = window.innerHeight;
                canvas.width = width;
                canvas.height = height;
            }
        }

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
                this.size = Math.random() * 1.5 + 0.5;
                this.isSignal = Math.random() > 0.92;

                this.baseColor = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
                this.signalColor = `rgba(16, 185, 129, 0.8)`;
            }

            update() {
                this.baseX += (Math.random() - 0.5) * 0.5;
                this.baseY -= Math.random() * 0.5;

                if (this.baseY < 0) this.baseY = height;
                if (this.baseX < 0) this.baseX = width;
                if (this.baseX > width) this.baseX = 0;

                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;

                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                if (force < 0) force = 0;

                let directionX = (forceDirectionX * force * this.density);
                let directionY = (forceDirectionY * force * this.density);

                if (distance < mouse.radius) {
                    if (this.isSignal) {
                        this.x += directionX * 0.5;
                        this.y += directionY * 0.5;
                    } else {
                        this.x -= directionX * 0.8;
                        this.y -= directionY * 0.8;
                    }
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 20;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 20;
                    }
                }
            }

            draw() {
                if(!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.isSignal ? this.size * 1.5 : this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.isSignal ? this.signalColor : this.baseColor;
                if (this.isSignal) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#10B981';
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
            }
        }

        if (canvas) {
             ctx = canvas.getContext('2d');
             window.addEventListener('mousemove', handleCanvasMouseMove);
             window.addEventListener('mouseleave', handleCanvasMouseLeave);
             window.addEventListener('resize', resize);
             resize();

             const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 9000);
             for (let i = 0; i < particleCount; i++) {
                 particles.push(new Particle());
             }

             const animateCanvas = () => {
                 if(!ctx) return;
                 ctx.clearRect(0, 0, width, height);

                 particles.forEach(p => {
                     p.update();
                     p.draw();
                 });

                 let signals = particles.filter(p => p.isSignal);
                 ctx.shadowBlur = 0;

                 for (let i = 0; i < signals.length; i++) {
                     for (let j = i + 1; j < signals.length; j++) {
                         let dx = signals[i].x - signals[j].x;
                         let dy = signals[i].y - signals[j].y;
                         let dist = Math.sqrt(dx*dx + dy*dy);

                         if (dist < 180) {
                             ctx.beginPath();
                             let opacity = 0.3 - (dist/180) * 0.3;
                             ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
                             ctx.lineWidth = 1;
                             ctx.moveTo(signals[i].x, signals[i].y);
                             ctx.lineTo(signals[j].x, signals[j].y);
                             ctx.stroke();
                         }
                     }
                 }
                 animationFrameId = requestAnimationFrame(animateCanvas);
             }
             animateCanvas();
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            if (badgeInterval) clearInterval(badgeInterval);
            if (scrambleTimeout) clearTimeout(scrambleTimeout);
            if(fx) cancelAnimationFrame(fx.frameRequest);
            if(canvas) {
                window.removeEventListener('mousemove', handleCanvasMouseMove);
                window.removeEventListener('mouseleave', handleCanvasMouseLeave);
                window.removeEventListener('resize', resize);
                cancelAnimationFrame(animationFrameId);
            }
        }
    }, []);

    return (
        <div className="antialiased flex flex-col relative selection:bg-emerald selection:text-obsidian pt-[34px]">
             <div id="spotlight"></div>

            {/* Live Ticker Tape */}
            <div className="ticker-wrap">
                <div className="ticker-move">
                    <div className="ticker-item"><span className="text-emerald">●</span> $BTC: BULLISH (0.89)</div>
                    <div className="ticker-item"><span className="text-amber">●</span> $TSLA: VOLATILE</div>
                    <div className="ticker-item text-emerald">+2,401 Signals Parsed</div>
                    <div className="ticker-item"><span className="text-text_muted">Whale Alert:</span> 1.2K ETH Moved</div>
                    <div className="ticker-item"><span className="text-emerald">●</span> $SOL: BULLISH (0.92)</div>
                    <div className="ticker-item">Tier 1 Influencer (Fed): NEUTRAL</div>
                    <div className="ticker-item"><span className="text-emerald">●</span> $NVDA: VERY BULLISH</div>
                    {/* Duplicates for loop */}
                    <div className="ticker-item"><span className="text-emerald">●</span> $BTC: BULLISH (0.89)</div>
                    <div className="ticker-item"><span className="text-amber">●</span> $TSLA: VOLATILE</div>
                    <div className="ticker-item text-emerald">+2,401 Signals Parsed</div>
                    <div className="ticker-item"><span className="text-text_muted">Whale Alert:</span> 1.2K ETH Moved</div>
                    <div className="ticker-item"><span className="text-emerald">●</span> $SOL: BULLISH (0.92)</div>
                    <div className="ticker-item">Tier 1 Influencer (Fed): NEUTRAL</div>
                    <div className="ticker-item"><span className="text-emerald">●</span> $NVDA: VERY BULLISH</div>
                </div>
            </div>

            {/* Header */}
            <header className="fixed top-[34px] left-0 right-0 z-[60] w-full px-6 py-4 flex justify-between items-center bg-obsidian/60 backdrop-blur-xl border-b border-border_dim transition-all duration-300" id="main-header">
                <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-graphite border border-gray-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#10B981" filter="drop-shadow(0px 0px 4px rgba(16,185,129,0.8))"/>
                            </svg>
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-text_main flex items-center gap-2">
                            TraderX
                            <span className="text-[10px] font-mono bg-emerald/10 border border-emerald/30 px-1.5 py-0.5 rounded text-emerald uppercase tracking-wider">Pro</span>
                        </span>
                    </div>
                    <nav className="hidden md:flex gap-8 text-sm text-text_muted font-medium">
                        <Link href="#features" className="hover:text-text_main transition-colors">Features</Link>
                        <Link href="#workflow" className="hover:text-text_main transition-colors">Workflow</Link>
                        <Link href="#testimonials" className="hover:text-text_main transition-colors">Testimonials</Link>
                        <Link href="/pricing" className="hover:text-text_main transition-colors">Pricing</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-text_muted mr-2">
                            <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
                            </span>
                            Systems Online
                        </div>
                        <Link href="/launch" className="btn-rotating-border text-text_main font-semibold text-xs md:text-sm px-4 md:px-5 py-2 hidden sm:flex">Download</Link>
                    </div>
                </div>
            </header>

             {/* HERO SECTION */}
            <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10" id="hero">
                <canvas id="particleCanvas" ref={canvasRef} className="absolute inset-0 z-0 w-full h-full pointer-events-none"></canvas>
                <div className="perspective-floor"></div>

                <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-30">
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left mt-10 lg:mt-0">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-graphite/80 border border-gray-800 text-xs font-mono text-text_muted mb-8 backdrop-blur-md reveal">
                            <span className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_10px_#10B981]"></span>
                            <span id="typing-badge" ref={typingBadgeRef}>Initializing FinBERT Engine...</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-text_main tracking-tighter leading-[1.05] mb-6 drop-shadow-2xl reveal delay-100">
                            A calmer, sharper way <br className="hidden lg:block"/>
                            to trade on <span className="sweep-text">X.</span>
                        </h1>

                        <p id="scramble-target" ref={scrambleTargetRef} className="text-lg text-text_muted max-w-xl mb-10 h-[70px] font-medium leading-relaxed reveal delay-200">
                            {/* Injected via JS */}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full sm:w-auto reveal delay-300">
                            <Link href="#features" className="btn-rotating-border w-full sm:w-auto text-text_main font-semibold text-sm flex items-center justify-center gap-3 px-8 py-4 group cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                                <span>Start Tracking</span>
                            </Link>
                            <div className="flex items-center gap-3 px-4 text-xs font-mono text-text_muted">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                988+ Curated Accounts
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full aspect-square max-w-[550px] mx-auto hidden lg:flex items-center justify-center reveal delay-400">
                        <div className="absolute inset-4 radar-scan opacity-70"></div>
                        <div className="absolute inset-16 rounded-full border border-gray-800/40 border-dashed animate-spin-slow"></div>
                        <div className="absolute inset-32 rounded-full border border-gray-800/60"></div>

                        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 550 550">
                            <path d="M 480 150 Q 380 200 275 275" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" className="flow-line-in" />
                            <path d="M 500 400 Q 380 350 275 275" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" className="flow-line-in" />
                            <path d="M 400 500 Q 350 400 275 275" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" className="flow-line-in" />

                            <path d="M 275 275 Q 150 180 80 120" fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="2" className="flow-line-out" />
                            <path d="M 275 275 Q 150 350 60 420" fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="2" className="flow-line-out" />
                            <path d="M 275 275 Q 100 275 40 275" fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="2" className="flow-line-out" />
                        </svg>

                        <div className="absolute z-40 w-32 h-32 rounded-2xl glass-panel-hero border border-emerald/50 flex flex-col items-center justify-center pulse-glow bg-obsidian/80 backdrop-blur-xl">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" className="mb-2">
                                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
                                <line x1="12" y1="22" x2="12" y2="15.5"></line>
                                <polyline points="22 8.5 12 15.5 2 8.5"></polyline>
                                <polyline points="2 15.5 12 8.5 22 15.5"></polyline>
                                <line x1="12" y1="2" x2="12" y2="8.5"></line>
                            </svg>
                            <div className="text-[10px] font-mono text-emerald tracking-widest leading-none">FinBERT</div>
                            <div className="text-[8px] font-mono text-text_muted mt-1">PROCESSING</div>
                        </div>

                        <div className="absolute right-[5%] top-[15%] w-48 glass-panel-hero p-3 rounded-lg border border-gray-800 opacity-60 transform rotate-[8deg] float-1 z-20">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] text-text_muted">@DegenApe99</span>
                                <span className="text-[8px] font-mono text-red_neon border border-red_neon/50 bg-red_neon/10 px-1 rounded">ENGAGEMENT BAIT</span>
                            </div>
                            <p className="text-xs text-text_main opacity-80 blur-[0.5px]">RT if you think $PEPE is going to $1 by tomorrow!! LFG 🚀🚀🌕</p>
                        </div>
                        <div className="absolute right-[0%] bottom-[20%] w-44 glass-panel-hero p-3 rounded-lg border border-gray-800 opacity-50 transform -rotate-[5deg] float-3 z-20">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] text-text_muted">@CryptoGuru</span>
                                <span className="text-[8px] font-mono text-red_neon border border-red_neon/50 bg-red_neon/10 px-1 rounded">SPAM</span>
                            </div>
                            <p className="text-xs text-text_main opacity-80 blur-[1px]">Link in bio for my VIP signals group. 1000% returns guaranteed 📈</p>
                        </div>

                        <div className="absolute left-[2%] top-[10%] w-56 glass-panel-hero p-4 rounded-xl border border-emerald/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] float-2 z-30">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-mono text-obsidian font-bold bg-emerald px-1.5 py-0.5 rounded">STRUCTURED SIGNAL</span>
                                <span className="text-[10px] text-text_muted">Just now</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-emerald animate-pulse"></div>
                                <span className="text-sm font-bold text-text_main">$BTC Momentum</span>
                            </div>
                            <p className="text-[11px] text-text_muted">Tier-1 Institutional accumulation detected across 4 whale wallets.</p>
                        </div>
                        <div className="absolute left-[-5%] bottom-[25%] w-52 glass-panel-hero p-3 rounded-xl border border-amber/40 shadow-[0_0_30px_rgba(245,158,11,0.1)] float-1 z-30">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-mono text-obsidian font-bold bg-amber px-1.5 py-0.5 rounded">VOLATILITY ALERT</span>
                            </div>
                            <div className="text-sm font-bold text-text_main">$TSLA Earnings Context</div>
                            <p className="text-[11px] text-text_muted mt-1">Sentiment divergence high. Standard deviation of scores &gt; 0.35.</p>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 reveal delay-500 opacity-50">
                    <span className="text-[10px] font-mono tracking-widest text-text_muted uppercase">Scroll</span>
                    <div className="w-[1px] h-10 bg-gradient-to-b from-text_muted to-transparent"></div>
                </div>
            </section>

             {/* SECTION: FEATURES */}
            <section id="features" className="relative w-full py-32 px-6 bg-obsidian z-20 border-t border-border_dim">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20 reveal">
                        <span className="inline-block border border-gray-800 rounded-full px-3 py-1 text-[10px] font-mono text-emerald tracking-widest uppercase mb-6 bg-emerald/5">Features</span>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text_main mb-6">A Platform That Feels Deliberate</h2>
                        <p className="text-text_muted text-lg max-w-2xl mx-auto">Each module was designed to remove noise, improve timing, and support disciplined decision-making.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="spotlight-card p-8 flex flex-col h-full reveal delay-100 group">
                            <span className="text-[10px] font-mono text-text_muted bg-graphite border border-gray-800 px-2 py-1 rounded w-max mb-6 tracking-widest uppercase">Core Signal</span>
                            <div className="w-12 h-12 rounded-lg bg-graphite border border-gray-800 flex items-center justify-center mb-6 group-hover:border-emerald/50 transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </div>
                            <h3 className="text-xl font-bold text-text_main mb-3">AI Trading Copilot</h3>
                            <p className="text-sm text-text_muted leading-relaxed">Generate cleaner trade plans with entries, stops, and confidence windows from sentiment and market structure.</p>
                        </div>

                        <div className="spotlight-card p-8 flex flex-col h-full reveal delay-200 group">
                            <span className="text-[10px] font-mono text-text_muted bg-graphite border border-gray-800 px-2 py-1 rounded w-max mb-6 tracking-widest uppercase">On-Chain</span>
                            <div className="w-12 h-12 rounded-lg bg-graphite border border-gray-800 flex items-center justify-center mb-6 group-hover:border-emerald/50 transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                            </div>
                            <h3 className="text-xl font-bold text-text_main mb-3">Whale Flow Tracker</h3>
                            <p className="text-sm text-text_muted leading-relaxed">Monitor high-value on-chain movement and detect accumulation versus distribution before social narratives catch up.</p>
                        </div>

                        <div className="spotlight-card p-8 flex flex-col h-full reveal delay-300 group">
                            <span className="text-[10px] font-mono text-text_muted bg-graphite border border-gray-800 px-2 py-1 rounded w-max mb-6 tracking-widest uppercase">Workflow</span>
                            <div className="w-12 h-12 rounded-lg bg-graphite border border-gray-800 flex items-center justify-center mb-6 group-hover:border-emerald/50 transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </div>
                            <h3 className="text-xl font-bold text-text_main mb-3">Infinite Data Export</h3>
                            <p className="text-sm text-text_muted leading-relaxed">Capture full feed context while you scroll and export it in clean formats for journals, quant backtests, or model training.</p>
                        </div>

                        <div className="spotlight-card p-8 flex flex-col h-full reveal delay-100 group">
                            <span className="text-[10px] font-mono text-text_muted bg-graphite border border-gray-800 px-2 py-1 rounded w-max mb-6 tracking-widest uppercase">Context</span>
                            <div className="w-12 h-12 rounded-lg bg-graphite border border-gray-800 flex items-center justify-center mb-6 group-hover:border-emerald/50 transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                            </div>
                            <h3 className="text-xl font-bold text-text_main mb-3">Sector Heatmaps</h3>
                            <p className="text-sm text-text_muted leading-relaxed">Read momentum by narrative cluster at a glance and quickly rotate attention to sectors gaining structural traction.</p>
                        </div>

                        <div className="spotlight-card p-8 flex flex-col h-full reveal delay-200 group">
                            <span className="text-[10px] font-mono text-text_muted bg-graphite border border-gray-800 px-2 py-1 rounded w-max mb-6 tracking-widest uppercase">Precision</span>
                            <div className="w-12 h-12 rounded-lg bg-graphite border border-gray-800 flex items-center justify-center mb-6 group-hover:border-emerald/50 transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-text_main mb-3">Combo Alerts</h3>
                            <p className="text-sm text-text_muted leading-relaxed">Build condition stacks that notify only when conviction is high, drastically reducing alert fatigue and false positives.</p>
                        </div>

                        <div className="spotlight-card p-8 flex flex-col h-full reveal delay-300 group">
                            <span className="text-[10px] font-mono text-amber bg-amber/10 border border-amber/20 px-2 py-1 rounded w-max mb-6 tracking-widest uppercase">Trust</span>
                            <div className="w-12 h-12 rounded-lg bg-graphite border border-gray-800 flex items-center justify-center mb-6 group-hover:border-amber/50 transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-text_main mb-3">Verified Institutional Tier</h3>
                            <p className="text-sm text-text_muted leading-relaxed">Filter noise by exclusively tracking a curated registry of 988+ verified institutional, macro, and tier-1 trading accounts.</p>
                        </div>
                    </div>
                </div>
            </section>

             {/* SECTION: HOW IT WORKS */}
            <section id="workflow" className="relative w-full py-32 px-6 bg-[#080808] z-20 border-t border-border_dim">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-20 reveal">
                        <span className="inline-block border border-gray-800 rounded-full px-3 py-1 text-[10px] font-mono text-emerald tracking-widest uppercase mb-6 bg-emerald/5">How It Works</span>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text_main mb-6">Fast onboarding, durable edge</h2>
                        <p className="text-text_muted text-lg max-w-xl mx-auto">A short setup path designed for repeatable, high-quality execution right inside your browser.</p>
                    </div>

                    <div className="relative pl-8 md:pl-0">
                        <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-[1px] md:transform md:-translate-x-1/2 bg-gray-800 timeline-container">
                            <div className="w-full h-full timeline-line" id="timeline-progress"></div>
                        </div>

                        <div className="relative flex flex-col md:flex-row items-center justify-between mb-16 md:mb-24 reveal step-item">
                            <div className="w-full md:w-5/12 text-left md:text-right pr-0 md:pr-10">
                                <span className="text-[10px] font-mono text-emerald tracking-widest uppercase mb-2 block">Step 01</span>
                                <h3 className="text-2xl font-bold text-text_main mb-3">Download and install</h3>
                                <p className="text-sm text-text_muted">Get the latest extension release from GitHub or the Web Store, then load it and pin it to your toolbar.</p>
                            </div>
                            <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-obsidian border-2 border-gray-800 z-10 transition-colors duration-500 step-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-svg"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>
                            </div>
                            <div className="w-full md:w-5/12 hidden md:block"></div>
                        </div>

                        <div className="relative flex flex-col md:flex-row items-center justify-between mb-16 md:mb-24 reveal step-item">
                            <div className="w-full md:w-5/12 hidden md:block"></div>
                            <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-obsidian border-2 border-gray-800 z-10 transition-colors duration-500 step-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-svg"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            </div>
                            <div className="w-full md:w-5/12 text-left pl-14 md:pl-10">
                                <span className="text-[10px] font-mono text-emerald tracking-widest uppercase mb-2 block">Step 02</span>
                                <h3 className="text-2xl font-bold text-text_main mb-3">Use X as usual</h3>
                                <p className="text-sm text-text_muted">Continue browsing normally while our intelligence layers process context, remove spam, and tag tickers in real time.</p>
                            </div>
                        </div>

                        <div className="relative flex flex-col md:flex-row items-center justify-between mb-16 md:mb-24 reveal step-item">
                            <div className="w-full md:w-5/12 text-left md:text-right pr-0 md:pr-10 pl-14 md:pl-0">
                                <span className="text-[10px] font-mono text-emerald tracking-widest uppercase mb-2 block">Step 03</span>
                                <h3 className="text-2xl font-bold text-text_main mb-3">Define your conditions</h3>
                                <p className="text-sm text-text_muted">Set up watchlists and stacked alerts that reflect your actual trading framework, filtering out irrelevant noise.</p>
                            </div>
                            <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-obsidian border-2 border-gray-800 z-10 transition-colors duration-500 step-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-svg"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            </div>
                            <div className="w-full md:w-5/12 hidden md:block"></div>
                        </div>

                        <div className="relative flex flex-col md:flex-row items-center justify-between reveal step-item">
                            <div className="w-full md:w-5/12 hidden md:block"></div>
                            <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-obsidian border-2 border-gray-800 z-10 transition-colors duration-500 step-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-svg"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                            </div>
                            <div className="w-full md:w-5/12 text-left pl-14 md:pl-10">
                                <span className="text-[10px] font-mono text-emerald tracking-widest uppercase mb-2 block">Step 04</span>
                                <h3 className="text-2xl font-bold text-text_main mb-3">Execute with confidence</h3>
                                <p className="text-sm text-text_muted">Act only when confluence aligns. Track post-trade quality with clean exported data sent straight to your journal.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* SECTION: TESTIMONIALS */}
            <section id="testimonials" className="relative w-full py-32 px-6 bg-obsidian z-20 border-t border-border_dim">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20 reveal">
                        <span className="inline-block border border-gray-800 rounded-full px-3 py-1 text-[10px] font-mono text-emerald tracking-widest uppercase mb-6 bg-emerald/5">Testimonials</span>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text_main mb-6">What traders notice first</h2>
                        <p className="text-text_muted text-lg max-w-2xl mx-auto">Sharper focus, cleaner timing, and vastly less reactive decision-making.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="spotlight-card p-8 flex flex-col h-full reveal delay-100">
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                ))}
                            </div>
                            <p className="text-text_main text-[15px] leading-relaxed mb-8 flex-grow">"TraderX helps me cut through narrative spikes fast. I get context, apply my technicals, then act with significantly less hesitation."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-graphite border border-gray-700 flex items-center justify-center text-xs font-bold text-text_muted">AP</div>
                                <div>
                                    <div className="text-sm font-bold text-text_main">A. Patel</div>
                                    <div className="text-[11px] font-mono text-text_muted uppercase">Independent Trader</div>
                                </div>
                            </div>
                        </div>

                        <div className="spotlight-card p-8 flex flex-col h-full reveal delay-200">
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                ))}
                            </div>
                            <p className="text-text_main text-[15px] leading-relaxed mb-8 flex-grow">"We use it as a first-pass filter before deeper desk research. The time savings on broad market scanning are immediate."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-graphite border border-gray-700 flex items-center justify-center text-xs font-bold text-text_muted">MC</div>
                                <div>
                                    <div className="text-sm font-bold text-text_main">M. Chen</div>
                                    <div className="text-[11px] font-mono text-text_muted uppercase">Research Analyst</div>
                                </div>
                            </div>
                        </div>

                        <div className="spotlight-card p-8 flex flex-col h-full reveal delay-300">
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                ))}
                            </div>
                            <p className="text-text_main text-[15px] leading-relaxed mb-8 flex-grow">"Signals show up right where I already work. I don't need another tab open. That one change massively improved my execution consistency."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-graphite border border-gray-700 flex items-center justify-center text-xs font-bold text-text_muted">JR</div>
                                <div>
                                    <div className="text-sm font-bold text-text_main">J. Romero</div>
                                    <div className="text-[11px] font-mono text-text_muted uppercase">Quant Hobbyist</div>
                                </div>
                            </div>
                        </div>

                        <div className="spotlight-card p-8 flex flex-col h-full reveal delay-100">
                            <div className="flex gap-1 mb-6">
                                 {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                ))}
                            </div>
                            <p className="text-text_main text-[15px] leading-relaxed mb-8 flex-grow">"Combo alerts reduced random pings and improved decision quality. Less noise, better focus during high volatility sessions."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-graphite border border-gray-700 flex items-center justify-center text-xs font-bold text-text_muted">SW</div>
                                <div>
                                    <div className="text-sm font-bold text-text_main">S. Williams</div>
                                    <div className="text-[11px] font-mono text-text_muted uppercase">Swing Trader</div>
                                </div>
                            </div>
                        </div>

                        <div className="spotlight-card p-8 flex flex-col h-full reveal delay-200">
                            <div className="flex gap-1 mb-6">
                                 {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                ))}
                            </div>
                            <p className="text-text_main text-[15px] leading-relaxed mb-8 flex-grow">"Export depth is exceptional. It feeds directly into my Python notebooks and research pipelines. A true quant-friendly tool."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-graphite border border-gray-700 flex items-center justify-center text-xs font-bold text-text_muted">KN</div>
                                <div>
                                    <div className="text-sm font-bold text-text_main">K. Nakamura</div>
                                    <div className="text-[11px] font-mono text-text_muted uppercase">Data Scientist</div>
                                </div>
                            </div>
                        </div>

                        <div className="spotlight-card p-8 flex flex-col h-full reveal delay-300">
                            <div className="flex gap-1 mb-6">
                                 {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                ))}
                            </div>
                            <p className="text-text_main text-[15px] leading-relaxed mb-8 flex-grow">"Team rollout was straightforward, and the institutional filter integration fit our existing workflow entirely without friction."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-graphite border border-gray-700 flex items-center justify-center text-xs font-bold text-text_muted">RG</div>
                                <div>
                                    <div className="text-sm font-bold text-text_main">R. Goldman</div>
                                    <div className="text-[11px] font-mono text-text_muted uppercase">Portfolio Manager</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* SECTION: CTA & FOOTER */}
            <section className="relative w-full pt-32 pb-12 px-6 bg-[#030303] z-20 border-t border-border_dim overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] bg-emerald rounded-[100%] blur-[120px]"></div>
                </div>
                <div className="footer-glow"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10 mb-32 reveal">
                    <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-text_main mb-6">Build your edge.<br/>Keep your composure.</h2>
                    <p className="text-text_muted text-lg md:text-xl max-w-2xl mx-auto mb-10">TraderX gives you a premium intelligence layer inside the feed you already use, with less noise and better decision timing from day one.</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
                        <Link href="/launch" className="btn-rotating-border w-full sm:w-auto text-text_main font-semibold text-sm flex items-center justify-center gap-3 px-8 py-4 group cursor-pointer shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>Download Extension</span>
                        </Link>

                        <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 rounded-lg bg-graphite border border-gray-800 text-text_main font-semibold text-sm hover:bg-gray-800 hover:border-gray-600 transition-all flex items-center justify-center gap-2 group">
                            View Plans
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </Link>
                    </div>
                    <p className="mt-8 text-xs text-text_muted font-mono tracking-wide">No credit card required — Cancel anytime — Works on Chromium browsers</p>
                </div>

                <footer className="max-w-6xl mx-auto border-t border-border_dim pt-16 pb-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 reveal delay-100">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="relative flex h-6 w-6 items-center justify-center rounded bg-graphite border border-gray-800">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#10B981"/>
                                    </svg>
                                </div>
                                <span className="font-bold text-text_main">TraderX Pro</span>
                            </div>
                            <p className="text-sm text-text_muted mb-6 leading-relaxed">AI-powered trading intelligence that turns X/Twitter noise into actionable trade signals. Not financial advice.</p>
                            <div className="flex gap-3">
                                <Link href="#" className="w-8 h-8 rounded bg-graphite border border-gray-800 flex items-center justify-center text-text_muted hover:text-text_main hover:border-gray-600 transition-all"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></Link>
                                <Link href="/community" className="h-8 px-3 rounded bg-graphite border border-gray-800 flex items-center justify-center text-xs font-semibold text-text_muted hover:text-text_main hover:border-gray-600 transition-all">Discord</Link>
                                <Link href="/community" className="h-8 px-3 rounded bg-graphite border border-gray-800 flex items-center justify-center text-xs font-semibold text-text_muted hover:text-text_main hover:border-gray-600 transition-all">Telegram</Link>
                            </div>
                        </div>

                        <div className="col-span-1">
                            <h4 className="text-[11px] font-mono text-text_muted uppercase tracking-widest mb-6">Product</h4>
                            <ul className="flex flex-col gap-4 text-sm text-text_muted">
                                <li><Link href="#features" className="hover:text-emerald transition-colors">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-emerald transition-colors">Pricing</Link></li>
                                <li><Link href="#workflow" className="hover:text-emerald transition-colors">How It Works</Link></li>
                                <li><Link href="/changelog" className="hover:text-emerald transition-colors">Changelog</Link></li>
                            </ul>
                        </div>

                        <div className="col-span-1">
                            <h4 className="text-[11px] font-mono text-text_muted uppercase tracking-widest mb-6">Resources</h4>
                            <ul className="flex flex-col gap-4 text-sm text-text_muted">
                                <li><Link href="/docs" className="hover:text-emerald transition-colors">Documentation</Link></li>
                                <li><Link href="/docs/api" className="hover:text-emerald transition-colors">API Reference</Link></li>
                                <li><Link href="/community" className="hover:text-emerald transition-colors">Community</Link></li>
                                <li><Link href="/contact" className="hover:text-emerald transition-colors">Support</Link></li>
                            </ul>
                        </div>

                        <div className="col-span-1">
                            <h4 className="text-[11px] font-mono text-text_muted uppercase tracking-widest mb-6">Company</h4>
                            <ul className="flex flex-col gap-4 text-sm text-text_muted">
                                <li><Link href="/privacy" className="hover:text-emerald transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-emerald transition-colors">Terms of Service</Link></li>
                                <li><Link href="/contact" className="hover:text-emerald transition-colors">Contact Sales</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-border_dim pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text_muted reveal delay-200">
                        <p>&copy; 2026 TraderX Pro. All rights reserved.</p>
                        <p>Built with <span className="text-emerald">♥</span> for traders worldwide.</p>
                    </div>
                </footer>
            </section>
        </div>
    );
}
