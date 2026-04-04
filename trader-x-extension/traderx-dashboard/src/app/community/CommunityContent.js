'use client';
import { communityLinks, telegramDiscordSection } from '@/content/marketingContent';
import { Send, MessageCircle, Twitter, Users, ExternalLink } from 'lucide-react';

const platforms = [
  {
    key: 'telegram',
    icon: Send,
    name: 'Telegram',
    description: communityLinks.telegram.description,
    href: communityLinks.telegram.href,
    buttonLabel: communityLinks.telegram.label,
    color: '#14B8A6',
    features: [
      'Real-time signal drops from the TraderX system',
      'Product announcements and patch notes',
      'One-way broadcast channel for high-signal updates',
      'No spam — curated content only',
    ],
  },
  {
    key: 'discord',
    icon: MessageCircle,
    name: 'Discord',
    description: communityLinks.discord.description,
    href: communityLinks.discord.href,
    buttonLabel: communityLinks.discord.label,
    color: '#10B981',
    features: [
      'Interactive discussions with other traders',
      'Support channels for setup and configuration',
      'Feature request and feedback forums',
      'Bot-enabled workflows (/sentiment, /watch, etc.)',
      'Role-based access for Pro and Enterprise users',
    ],
  },
  {
    key: 'x',
    icon: Twitter,
    name: 'X / Twitter',
    description: communityLinks.x.description,
    href: communityLinks.x.href,
    buttonLabel: communityLinks.x.label,
    color: '#14B8A6',
    features: [
      'Launch updates and feature demos',
      'Public signal previews and market commentary',
      'Behind-the-scenes development updates',
      'Community engagement and polls',
    ],
  },
];

export default function CommunityContent() {
  return (
    <div className="community-page">
      <div className="community-hero">
        <div className="hero-icon"><Users size={32} /></div>
        <h1>{telegramDiscordSection.title}</h1>
        <p>{telegramDiscordSection.subtitle}</p>
      </div>

      <div className="platforms-grid">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.key} className="platform-card">
              <div className="card-header" style={{ borderColor: platform.color + '33' }}>
                <div className="platform-icon" style={{ background: platform.color + '22', color: platform.color }}>
                  <Icon size={28} />
                </div>
                <h2>{platform.name}</h2>
                <p className="platform-desc">{platform.description}</p>
              </div>
              <ul className="platform-features">
                {platform.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <a href={platform.href} target="_blank" rel="noopener noreferrer" className="platform-btn" style={{ background: platform.color }}>
                {platform.buttonLabel} <ExternalLink size={14} />
              </a>
            </div>
          );
        })}
      </div>

      <div className="community-cta">
        <h3>Why Join the Community?</h3>
        <p>Get faster support, early access to features, connect with like-minded traders, and help shape the future of TraderX Pro.</p>
      </div>

      <style jsx>{`
        .community-page { padding: 60px 24px 80px; max-width: 1100px; margin: 0 auto; }
        .community-hero { text-align: center; margin-bottom: 50px; }
        .hero-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(16,185,129,0.15); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #6EE7B7; }
        .community-hero h1 { font-size: clamp(24px, 3.5vw, 36px); font-weight: 800; margin: 0 0 8px; }
        .community-hero p { font-size: 15px; color: rgba(255,255,255,0.5); max-width: 500px; margin: 0 auto; }
        .platforms-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 60px; }
        .platform-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 28px 24px; display: flex; flex-direction: column;
        }
        .card-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .platform-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .platform-card h2 { font-size: 20px; font-weight: 700; margin: 0 0 6px; }
        .platform-desc { font-size: 13px; color: rgba(255,255,255,0.45); margin: 0; line-height: 1.4; }
        .platform-features { list-style: none; padding: 0; margin: 0 0 20px; flex: 1; }
        .platform-features li { font-size: 13px; color: rgba(255,255,255,0.55); padding: 4px 0; padding-left: 16px; position: relative; }
        .platform-features li::before { content: '•'; position: absolute; left: 0; color: rgba(255,255,255,0.3); }
        .platform-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px; border-radius: 10px; text-decoration: none; color: white;
          font-size: 14px; font-weight: 600; transition: opacity 0.2s;
        }
        .platform-btn:hover { opacity: 0.85; }
        .community-cta {
          text-align: center; padding: 40px; border-radius: 16px;
          background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.15);
        }
        .community-cta h3 { font-size: 20px; font-weight: 700; margin: 0 0 8px; }
        .community-cta p { font-size: 14px; color: rgba(255,255,255,0.5); max-width: 500px; margin: 0 auto; }
        @media (max-width: 768px) { .platforms-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
