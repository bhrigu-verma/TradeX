'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'How It Works', href: '/guide' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/docs/api' },
      { label: 'Community', href: '/community' },
      { label: 'Support', href: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact Sales', href: '/contact' },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-glow" />
      <div className="footer-container">
        <FadeIn direction="up" className="footer-top">
          <div className="footer-brand-col">
            <Link href="/" className="footer-logo">
              <div className="footer-logo-mark"><Zap size={16} /></div>
              <span className="footer-logo-text">TraderX Pro</span>
            </Link>
            <p className="footer-desc">
              AI-powered trading intelligence that turns X/Twitter noise into actionable trade signals. Not financial advice.
            </p>
            <div className="footer-socials">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-link">𝕏</a>
              <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="social-link">Discord</a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="social-link">Telegram</a>
            </div>
          </div>

          {footerLinks.map((col) => (
            <div key={col.title} className="footer-link-col">
              <h4 className="footer-col-title">{col.title}</h4>
              {col.links.map((link) => (
                <Link key={link.label} href={link.href} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </FadeIn>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} TraderX Pro. All rights reserved.</span>
          <span className="footer-bottom-right">
            Built with ❤️ for traders worldwide
          </span>
        </div>
      </div>
    </footer>
  );
}
