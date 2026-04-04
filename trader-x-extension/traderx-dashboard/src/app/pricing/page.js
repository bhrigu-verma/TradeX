import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import PricingClient from './PricingClient';

export const metadata = {
  title: 'Pricing | TraderX Pro — Plans for Every Trader',
  description: 'Start free. Upgrade when you need AI Copilot, Whale Tracker, Combo Alerts, and premium analytics. Simple, transparent pricing.',
};

export default function PricingPage() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <main>
        <PricingClient />
      </main>
      <MarketingFooter />
    </div>
  );
}
