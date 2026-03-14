'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, ArrowRight } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How It Works', href: '/guide' },
  { label: 'Community', href: '/community' },
  { label: 'Docs', href: '/docs' },
  { label: 'Launch', href: '/launch' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="top-launch-banner"
      >
        <span className="banner-pulse" />
        <span>Launch offer: 7-day Pro trial with full feature access</span>
        <Link href="/pricing" className="banner-cta">
          Start Free <ArrowRight size={14} />
        </Link>
      </motion.div>

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`main-navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      >
        <div className="navbar-container">
          <Link href="/" className="navbar-logo">
            <motion.div
              className="logo-mark"
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Zap size={20} />
            </motion.div>
            <span className="logo-text">TraderX</span>
            <span className="logo-badge">PRO</span>
          </Link>

          <div className="navbar-center">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="navbar-right">
            <Link href="/pricing" className="nav-login">Sign In</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/pricing" className="nav-cta-btn">
                Get Started <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {navLinks.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={link.href} className="mobile-link" onClick={() => setMobileOpen(false)}>{link.label}</Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.05 }}>
                <Link href="/pricing" className="mobile-cta" onClick={() => setMobileOpen(false)}>Get Started →</Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
