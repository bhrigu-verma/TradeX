'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, BrainCircuit, Waves, CreditCard, Code, Webhook, Server, Rocket, Send, MessageCircle, ChevronRight, Menu, X } from 'lucide-react';

const sections = [
  {
    title: 'Product',
    links: [
      { label: 'Overview', href: '/docs', icon: BookOpen },
      { label: 'AI Copilot', href: '/docs/ai-copilot', icon: BrainCircuit },
      { label: 'Whale Tracker', href: '/docs/whale-tracker', icon: Waves },
      { label: 'Pricing & Billing', href: '/docs/pricing-billing', icon: CreditCard },
    ],
  },
  {
    title: 'Developer',
    links: [
      { label: 'API Reference', href: '/docs/api', icon: Code },
      { label: 'Webhooks', href: '/docs/webhooks', icon: Webhook },
      { label: 'Environment Setup', href: '/docs/environment', icon: Server },
      { label: 'Deployment', href: '/docs/deployment', icon: Rocket },
    ],
  },
  {
    title: 'Integrations',
    links: [
      { label: 'Telegram Bot', href: '/docs/telegram-setup', icon: Send },
      { label: 'Discord Bot', href: '/docs/discord-bot-setup', icon: MessageCircle },
    ],
  },
];

function DocsSidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`docs-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/docs" className="sidebar-brand">📖 Docs</Link>
          <button className="sidebar-close" onClick={onClose}><X size={18} /></button>
        </div>
        {sections.map(section => (
          <div key={section.title} className="sidebar-section">
            <div className="sidebar-section-title">{section.title}</div>
            {section.links.map(link => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={`sidebar-link ${active ? 'active' : ''}`} onClick={onClose}>
                  <Icon size={14} />
                  <span>{link.label}</span>
                  {active && <ChevronRight size={12} className="active-indicator" />}
                </Link>
              );
            })}
          </div>
        ))}
      </aside>
    </>
  );
}

export default function DocsLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="docs-shell">
      <DocsSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="docs-content">
        <button className="docs-mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          <Menu size={18} /> Docs Menu
        </button>
        {children}
      </div>
    </div>
  );
}
