import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import PricingClient from './PricingClient';

export const metadata = {
  title: 'Pricing | TraderX Pro — Plans for Every Trader',
  description: 'Start free. Upgrade when you need AI Copilot, Whale Tracker, Combo Alerts, and premium analytics. Simple, transparent pricing.',
};

export default function PricingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 30%, #0d0d20 60%, #050510 100%)',
      color: 'white',
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      <Navbar />
      <main>
        <PricingClient />
      </main>
      <MarketingFooter />
    </div>
  );
}
