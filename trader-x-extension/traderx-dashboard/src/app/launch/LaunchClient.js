'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chrome, Send, Server, Rocket, CheckCircle, Copy, ExternalLink,
  Shield, Image, FileText, CreditCard, Globe, Terminal, Database,
  Bot, Key, Zap, ChevronDown, ArrowRight, Package, Upload, Eye
} from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeading from '@/components/ui/SectionHeading';
import FloatingOrbs from '@/components/ui/FloatingOrbs';
import GlowButton from '@/components/ui/GlowButton';

// ============================================================================
// TABS
// ============================================================================
const tabs = [
  { id: 'chrome', label: 'Chrome Web Store', icon: Chrome, color: '#4285F4' },
  { id: 'telegram', label: 'Telegram Bot', icon: Send, color: '#0EA5E9' },
  { id: 'server', label: 'Server Deploy', icon: Server, color: '#10B981' },
  { id: 'quickstart', label: 'Quick Start', icon: Zap, color: '#F59E0B' },
];

// ============================================================================
// CHROME WEB STORE DATA
// ============================================================================
const chromeSteps = [
  {
    number: '01',
    title: 'Create Developer Account',
    icon: CreditCard,
    time: '5 min',
    content: [
      'Go to the Chrome Web Store Developer Dashboard',
      'Sign in with your Google account',
      'Pay the one-time $5 registration fee',
      'Accept the developer agreement',
    ],
    link: { url: 'https://chrome.google.com/webstore/devconsole', label: 'Open Developer Dashboard →' },
    tip: 'Use the same Google account you want as the publisher. This cannot be changed later.',
  },
  {
    number: '02',
    title: 'Prepare Store Assets',
    icon: Image,
    time: '30 min',
    content: [
      'Extension icon: 128×128 PNG (already have this ✓)',
      'Promotional tile: 440×280 PNG (marquee image)',
      'Screenshots: 1280×800 or 640×400 PNG (at least 1, max 5)',
      'Promotional images: 920×680 large, 440×280 small (optional)',
    ],
    tip: 'Take screenshots on x.com with the TraderX sidebar open. Show the AI Copilot, whale tracker, and sentiment dashboard.',
    checklist: [
      { item: 'Icon 128×128', file: 'assets/icons/icon-128.png' },
      { item: '1-5 screenshots (1280×800)', file: 'Take on x.com' },
      { item: 'Promotional tile (440×280)', file: 'Create in Figma/Canva' },
    ],
  },
  {
    number: '03',
    title: 'Write Store Listing',
    icon: FileText,
    time: '20 min',
    content: [
      'Title: "TraderX Pro — AI Trading Intelligence for X/Twitter"',
      'Short description (132 chars max)',
      'Detailed description (up to 16,000 chars)',
      'Select category: "Productivity" or "Social & Communication"',
      'Set language to English',
    ],
    tip: 'Use the description below — it\'s optimized for Chrome Web Store SEO.',
    copyBlock: {
      label: 'Optimized Store Description',
      text: `TraderX Pro — AI-Powered Trading Intelligence for X/Twitter

Turn Twitter/X noise into actionable trading signals. TraderX Pro injects a powerful AI sidebar directly into your Twitter feed.

🤖 AI TRADING COPILOT
• Real-time trade ideas with entry, stop-loss, and profit targets
• Multi-signal analysis: Sentiment + Technical + Volume + Influencer
• 65%+ confidence threshold — only high-probability setups
• Performance tracking: win rate, profit factor, P&L

🐋 WHALE FLOW TRACKER
• Monitor $100K+ transactions across BTC, ETH, SOL
• Exchange flow analysis — inflows vs outflows
• Real-time alerts for $1M+ whale movements

📊 MARKET PULSE DASHBOARD
• Real-time sentiment analysis for stocks & crypto
• Live price tracking (CoinGecko + Yahoo Finance)
• Volume spike detection with visual indicators
• Influencer-weighted sentiment scoring

🔍 ADVANCED SEARCH
• Load 150-200+ tweets per ticker with deep analysis
• Export to CSV, JSON, or formatted for ChatGPT/Claude
• Smart filtering: verified accounts, engagement thresholds

👥 SIGNAL DIRECTORY
• 250+ verified trading accounts across 13 categories
• Tier-weighted influencer scoring (10×, 5×, 2×)

📈 PORTFOLIO & ALERTS
• Portfolio tracker with real-time P&L
• Combo alerts: divergence detection, sentiment flips
• Sector heatmap for rotation analysis

Works seamlessly on x.com and twitter.com. No data leaves your browser — all analysis runs locally.`,
    },
  },
  {
    number: '04',
    title: 'Package the Extension',
    icon: Package,
    time: '2 min',
    content: [
      'Run the setup script with option [4] to create the .zip file',
      'Or manually zip the required files (see command below)',
      'The zip should NOT include: traderx-server/, traderx-dashboard/, node_modules/, .git/',
      'Verify the zip size is under 20MB (Chrome Web Store limit)',
    ],
    copyBlock: {
      label: 'Package Command',
      text: `# From the trader-x-extension/ root directory:
./setup.sh
# Choose option [4] "Chrome Extension only"

# Or manually:
zip -r traderx-pro-v1.0.0.zip \\
  manifest.json background.js popup.html popup.js \\
  suggested.js utils.js accounts.json \\
  content/ settings/ icons/ assets/icons/ \\
  -x "*.DS_Store" "*.git*" "node_modules/*"`,
    },
  },
  {
    number: '05',
    title: 'Upload & Submit for Review',
    icon: Upload,
    time: '10 min',
    content: [
      'Click "New Item" in the Developer Dashboard',
      'Upload your .zip file',
      'Fill in all store listing fields from Step 3',
      'Upload screenshots and promotional images',
      'Set privacy policy URL (your /privacy page)',
      'Declare permissions justification (see below)',
      'Click "Submit for Review"',
    ],
    tip: 'Review typically takes 1-3 business days. You\'ll get an email when approved.',
    important: {
      title: 'Permission Justifications (Required)',
      items: [
        { perm: 'storage', reason: 'Store user watchlist, filter settings, and cached analysis data' },
        { perm: 'notifications', reason: 'Alert users about significant sentiment changes and whale movements' },
        { perm: 'tabs', reason: 'Detect when user navigates to Twitter/X to activate the sidebar' },
        { perm: 'scripting', reason: 'Inject the trading intelligence sidebar into Twitter/X pages' },
        { perm: 'host_permissions (x.com)', reason: 'Core functionality — analyze tweets and inject sidebar UI' },
        { perm: 'host_permissions (coingecko)', reason: 'Fetch real-time cryptocurrency price data' },
        { perm: 'host_permissions (yahoo)', reason: 'Fetch real-time stock price data' },
      ],
    },
  },
  {
    number: '06',
    title: 'Post-Launch Checklist',
    icon: Eye,
    time: 'Ongoing',
    content: [
      'Monitor reviews and respond to user feedback',
      'Set up Google Analytics for install tracking (optional)',
      'Create a support email (support@traderx.app)',
      'Update the extension periodically (Chrome pushes updates automatically)',
      'Monitor the Developer Dashboard for policy warnings',
    ],
    tip: 'After approval, share your Chrome Web Store link everywhere — your website, README, Twitter/X, communities.',
  },
];

// ============================================================================
// TELEGRAM BOT DATA
// ============================================================================
const telegramSteps = [
  {
    number: '01',
    title: 'Create Your Bot (Click 1)',
    icon: Bot,
    time: '1 min',
    content: [
      'Open Telegram on your phone or desktop',
      'Search for @BotFather (the official bot creator)',
      'Send the command: /newbot',
      'Give your bot a display name (e.g., "TraderX Pro")',
      'Give it a username ending in "bot" (e.g., "traderx_pro_bot")',
      'BotFather will send you a token — copy it!',
    ],
    link: { url: 'https://t.me/BotFather', label: 'Open @BotFather in Telegram →' },
    tip: 'The token looks like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz — keep it secret!',
    visual: {
      title: 'What BotFather sends you:',
      lines: [
        '🤖 Done! Congratulations on your new bot.',
        '  ',
        'You can find it at t.me/traderx_pro_bot.',
        'Use this token to access the HTTP API:',
        '  ',
        '7123456789:AAH...-abc123xyz',
        '  ',
        'Keep your token secure and store it safely.',
      ],
    },
  },
  {
    number: '02',
    title: 'Run the Setup Script (Click 2)',
    icon: Terminal,
    time: '2 min',
    content: [
      'Open your terminal in the project folder',
      'Run the one-click setup script',
      'Choose option [1] or [2]',
      'Paste your Telegram bot token when prompted',
      'The script creates .env, sets up the database, and configures everything',
    ],
    copyBlock: {
      label: 'One-Click Setup',
      text: `cd trader-x-extension
chmod +x setup.sh
./setup.sh

# Choose [1] Full setup
# Paste your Telegram bot token when asked
# Done! Everything is configured.`,
    },
    tip: 'That\'s it! Two clicks: create bot with BotFather, run the script. Your bot is ready.',
  },
  {
    number: '03',
    title: 'Start the Server & Test',
    icon: Rocket,
    time: '1 min',
    content: [
      'Start the TraderX server',
      'Open your bot in Telegram',
      'Send /start — you should see a welcome message',
      'Try /help to see all available commands',
    ],
    copyBlock: {
      label: 'Start Server',
      text: `cd traderx-server
npm run dev

# You should see:
# ✓ Telegram bot polling started ✓
# ✓ HTTP server running on port 3001 ✓`,
    },
  },
  {
    number: '04',
    title: 'Customize Your Bot (Optional)',
    icon: Shield,
    time: '5 min',
    content: [
      'Set a profile picture: Send /setuserpic to @BotFather',
      'Set a description: Send /setdescription to @BotFather',
      'Set commands menu: Send /setcommands to @BotFather',
      'Enable inline mode: Send /setinline to @BotFather (optional)',
    ],
    copyBlock: {
      label: 'Bot Commands List (paste to BotFather after /setcommands)',
      text: `start - Welcome and onboarding
help - Show all commands
watch - Add ticker to watchlist
unwatch - Remove ticker from watchlist
sentiment - Get sentiment analysis for a ticker
price - Get current price
alert - Set a price or sentiment alert
portfolio - View your portfolio
buy - Record a buy position
sell - Record a sell position
heatmap - Sector sentiment heatmap
digest - AI-powered market digest
settings - Manage your preferences`,
    },
  },
];

// ============================================================================
// SERVER DEPLOY DATA
// ============================================================================
const serverSteps = [
  {
    number: '01',
    title: 'Choose a Hosting Provider',
    icon: Globe,
    time: '10 min',
    content: [
      'The server is a standard Node.js app — deploy anywhere:',
    ],
    providers: [
      { name: 'Railway', desc: 'Easiest — click to deploy from GitHub', url: 'https://railway.app', free: true, recommended: true },
      { name: 'Render', desc: 'Free tier with auto-deploy from GitHub', url: 'https://render.com', free: true },
      { name: 'Fly.io', desc: 'Fast global deployment', url: 'https://fly.io', free: true },
      { name: 'DigitalOcean', desc: 'App Platform — $5/mo droplets', url: 'https://digitalocean.com', free: false },
      { name: 'AWS/GCP', desc: 'Enterprise-grade (EC2, Cloud Run)', url: '#', free: false },
    ],
  },
  {
    number: '02',
    title: 'Deploy with Railway (Recommended)',
    icon: Rocket,
    time: '5 min',
    content: [
      'Connect your GitHub repository',
      'Set the root directory to traderx-server/',
      'Add environment variables from your .env file',
      'Railway auto-detects Node.js and runs npm start',
      'You get a public URL like: traderx-server.up.railway.app',
    ],
    copyBlock: {
      label: 'Railway Deploy Steps',
      text: `# 1. Push your code to GitHub
git add -A && git commit -m "ready for deploy" && git push

# 2. Go to railway.app → "New Project" → "Deploy from GitHub"
# 3. Select your repo, set root to "traderx-server"
# 4. Add env vars in Railway dashboard
# 5. Deploy! You'll get a public URL.

# For Telegram webhooks in production:
TELEGRAM_WEBHOOK_URL=https://your-app.up.railway.app`,
    },
  },
  {
    number: '03',
    title: 'Set Up Production Telegram Webhook',
    icon: Send,
    time: '2 min',
    content: [
      'In development, the bot uses long-polling (automatic)',
      'In production, use webhooks for better performance:',
      'Set TELEGRAM_WEBHOOK_URL in your environment variables',
      'The server auto-registers the webhook on startup',
    ],
    copyBlock: {
      label: 'Production Environment Variables',
      text: `NODE_ENV=production
TELEGRAM_WEBHOOK_URL=https://your-server-url.com
# All other env vars from .env`,
    },
    tip: 'Webhooks are faster than polling and don\'t require a persistent connection.',
  },
  {
    number: '04',
    title: 'Deploy the Dashboard (Vercel)',
    icon: Globe,
    time: '5 min',
    content: [
      'The Next.js dashboard deploys perfectly on Vercel (free)',
      'Connect your GitHub repo → set root to "traderx-dashboard"',
      'Vercel auto-detects Next.js and handles everything',
      'You get a URL like: traderx.vercel.app',
    ],
    link: { url: 'https://vercel.com/new', label: 'Deploy to Vercel →' },
  },
];

// ============================================================================
// QUICK START DATA
// ============================================================================
const quickStartCommands = [
  {
    label: 'Extension Install (GitHub Release)',
    command: `# 1. Open the latest release page
# https://github.com/bhrigu-verma/traderx-extension/releases/latest
# 2. Download the zip asset
# 3. Extract the zip to a folder`,
  },
  {
    label: 'Start Backend (Terminal 1)',
    command: `cd traderx-server && npm run dev`,
  },
  {
    label: 'Start Dashboard (Terminal 2)',
    command: `cd traderx-dashboard && npm run dev`,
  },
  {
    label: 'Load Chrome Extension',
    command: `# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" → select extracted extension folder
# 4. Visit x.com — sidebar appears!`,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================
export default function LaunchClient() {
  const [activeTab, setActiveTab] = useState('chrome');
  const [copiedText, setCopiedText] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <FloatingOrbs />

      {/* Hero */}
      <section style={{ padding: '100px 24px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <SectionHeading
          badge="Launch Guide"
          title="Ship TraderX to the World"
          subtitle="Everything you need to publish on the Chrome Web Store, set up your Telegram bot, and deploy the server — step by step."
        />
      </section>

      {/* Tab Navigation */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{
            display: 'flex', gap: 8, padding: 6, borderRadius: 16,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            flexWrap: 'wrap',
          }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1, minWidth: 150, padding: '12px 16px', borderRadius: 12,
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: 13, fontWeight: 600,
                    background: isActive ? `${tab.color}20` : 'transparent',
                    color: isActive ? tab.color : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </FadeIn>
      </section>

      {/* Tab Content */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 100px', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {activeTab === 'chrome' && (
            <TabContent key="chrome">
              <TabHeader
                icon={Chrome}
                color="#4285F4"
                title="Publish to Chrome Web Store"
                subtitle="Get your extension in front of millions. One-time $5 fee, then free forever."
              />
              {chromeSteps.map((step, i) => (
                <StepCard key={i} step={step} index={i} copyToClipboard={copyToClipboard} copiedText={copiedText} />
              ))}
            </TabContent>
          )}

          {activeTab === 'telegram' && (
            <TabContent key="telegram">
              <TabHeader
                icon={Send}
                color="#0EA5E9"
                title="Set Up Your Telegram Bot"
                subtitle="Literally 2 clicks: create bot with BotFather, run the setup script. That's it."
              />
              <TwoClickBanner />
              {telegramSteps.map((step, i) => (
                <StepCard key={i} step={step} index={i} copyToClipboard={copyToClipboard} copiedText={copiedText} />
              ))}
            </TabContent>
          )}

          {activeTab === 'server' && (
            <TabContent key="server">
              <TabHeader
                icon={Server}
                color="#10B981"
                title="Deploy to Production"
                subtitle="Deploy the backend API and dashboard so your Telegram bot and website work 24/7."
              />
              {serverSteps.map((step, i) => (
                <StepCard key={i} step={step} index={i} copyToClipboard={copyToClipboard} copiedText={copiedText} />
              ))}
            </TabContent>
          )}

          {activeTab === 'quickstart' && (
            <TabContent key="quickstart">
              <TabHeader
                icon={Zap}
                color="#F59E0B"
                title="Quick Start — Copy & Paste"
                subtitle="Just the commands. No reading. Copy, paste, run."
              />
              {quickStartCommands.map((cmd, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div style={{ marginBottom: 20 }}>
                    <GlassCard padding="0">
                      <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: 8,
                            background: 'rgba(245,158,11,0.15)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800, color: '#F59E0B',
                          }}>{i + 1}</span>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{cmd.label}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(cmd.command, `qs-${i}`)}
                          style={{
                            padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                            background: copiedText === `qs-${i}` ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
                            color: copiedText === `qs-${i}` ? '#10B981' : 'rgba(255,255,255,0.5)',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}
                        >
                          {copiedText === `qs-${i}` ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                        </motion.button>
                      </div>
                      <pre style={{
                        padding: '16px 20px', margin: 0, fontSize: 12, lineHeight: 1.7,
                        color: 'rgba(255,255,255,0.6)', fontFamily: "'SF Mono', 'Fira Code', monospace",
                        overflowX: 'auto',
                      }}>{cmd.command}</pre>
                    </GlassCard>
                  </div>
                </FadeIn>
              ))}

              <FadeIn delay={0.5}>
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <GlowButton href="/guide" variant="primary" size="lg">
                    Full Setup Guide <ArrowRight size={16} />
                  </GlowButton>
                </div>
              </FadeIn>
            </TabContent>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TabContent({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

function TabHeader({ icon: Icon, color, title, subtitle }) {
  return (
    <FadeIn>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32,
        padding: '24px', borderRadius: 16,
        background: `${color}08`, border: `1px solid ${color}20`,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `${color}15`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={24} color={color} />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{title}</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{subtitle}</p>
        </div>
      </div>
    </FadeIn>
  );
}

function TwoClickBanner() {
  return (
    <FadeIn delay={0.1}>
      <div style={{
        padding: '20px 24px', borderRadius: 14, marginBottom: 32,
        background: 'linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(99,102,241,0.1) 100%)',
        border: '1px solid rgba(14,165,233,0.2)',
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <Zap size={20} color="#0EA5E9" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>2-Click Setup</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              <strong style={{ color: '#0EA5E9' }}>Click 1:</strong> Tell @BotFather to /newbot →
              <strong style={{ color: '#0EA5E9' }}> Click 2:</strong> Run ./setup.sh and paste token
            </div>
          </div>
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: 'rgba(14,165,233,0.2)', color: '#0EA5E9',
        }}>
          ~3 minutes total
        </div>
      </div>
    </FadeIn>
  );
}

function StepCard({ step, index, copyToClipboard, copiedText }) {
  const [expanded, setExpanded] = useState(true);
  const Icon = step.icon;

  return (
    <FadeIn delay={index * 0.08}>
      <div style={{ marginBottom: 20 }}>
        <GlassCard padding="0">
          {/* Header */}
          <motion.button
            onClick={() => setExpanded(!expanded)}
            style={{
              width: '100%', padding: '20px 24px', border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'white', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 16,
              borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: 'rgba(99,102,241,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={20} color="#A5B4FC" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: '#6366F1',
                  fontFamily: 'monospace',
                }}>{step.number}</span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{step.title}</span>
              </div>
              {step.time && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>⏱ {step.time}</span>
              )}
            </div>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} color="rgba(255,255,255,0.3)" />
            </motion.div>
          </motion.button>

          {/* Body */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '20px 24px' }}>
                  {/* Content bullets */}
                  <ul style={{ padding: 0, margin: '0 0 16px', listStyle: 'none' }}>
                    {step.content.map((item, i) => (
                      <li key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '5px 0', fontSize: 13, color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.6,
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: '#6366F1', flexShrink: 0, marginTop: 7,
                        }} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Link */}
                  {step.link && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontWeight: 600, color: '#A5B4FC',
                        textDecoration: 'none', marginBottom: 16,
                      }}
                    >
                      <ExternalLink size={13} /> {step.link.label}
                    </a>
                  )}

                  {/* Providers */}
                  {step.providers && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                      {step.providers.map((p, i) => (
                        <a
                          key={i}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                            background: p.recommended ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${p.recommended ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', display: 'flex', gap: 8, alignItems: 'center' }}>
                              {p.name}
                              {p.recommended && (
                                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.2)', color: '#10B981', fontWeight: 700 }}>
                                  RECOMMENDED
                                </span>
                              )}
                              {p.free && (
                                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: '#A5B4FC', fontWeight: 600 }}>
                                  FREE TIER
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{p.desc}</div>
                          </div>
                          <ExternalLink size={14} color="rgba(255,255,255,0.3)" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Checklist */}
                  {step.checklist && (
                    <div style={{
                      padding: '14px 16px', borderRadius: 10, marginBottom: 16,
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Asset Checklist
                      </div>
                      {step.checklist.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', fontSize: 13 }}>
                          <CheckCircle size={14} color="#6366F1" />
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{c.item}</span>
                          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{c.file}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Visual (BotFather mock) */}
                  {step.visual && (
                    <div style={{
                      padding: '16px', borderRadius: 10, marginBottom: 16,
                      background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0EA5E9', marginBottom: 10, textTransform: 'uppercase' }}>
                        {step.visual.title}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8, color: 'rgba(255,255,255,0.5)' }}>
                        {step.visual.lines.map((line, i) => (
                          <div key={i}>{line || '\u00A0'}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Code Block */}
                  {step.copyBlock && (
                    <div style={{
                      borderRadius: 10, overflow: 'hidden', marginBottom: 16,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{
                        padding: '10px 14px', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.04)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
                          {step.copyBlock.label}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(step.copyBlock.text, `step-${step.number}`)}
                          style={{
                            padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
                            background: copiedText === `step-${step.number}` ? 'rgba(16,185,129,0.2)' : 'transparent',
                            color: copiedText === `step-${step.number}` ? '#10B981' : 'rgba(255,255,255,0.4)',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}
                        >
                          {copiedText === `step-${step.number}` ? <><CheckCircle size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                        </motion.button>
                      </div>
                      <pre style={{
                        padding: '14px 16px', margin: 0, fontSize: 12, lineHeight: 1.7,
                        color: 'rgba(255,255,255,0.55)', fontFamily: "'SF Mono', 'Fira Code', monospace",
                        overflowX: 'auto', whiteSpace: 'pre-wrap',
                      }}>{step.copyBlock.text}</pre>
                    </div>
                  )}

                  {/* Permission Justifications */}
                  {step.important && (
                    <div style={{
                      padding: '16px', borderRadius: 10, marginBottom: 16,
                      background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Shield size={14} /> {step.important.title}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {step.important.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                            <code style={{
                              padding: '2px 8px', borderRadius: 4, flexShrink: 0,
                              background: 'rgba(255,255,255,0.06)', color: '#A5B4FC',
                              fontFamily: 'monospace', fontSize: 11,
                            }}>{item.perm}</code>
                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{item.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tip */}
                  {step.tip && (
                    <div style={{
                      padding: '12px 16px', borderRadius: 10,
                      background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                      <Zap size={14} color="#A5B4FC" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                        <strong style={{ color: '#A5B4FC' }}>Tip:</strong> {step.tip}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </FadeIn>
  );
}
