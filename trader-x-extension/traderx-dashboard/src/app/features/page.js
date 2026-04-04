import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import FeaturesClient from './FeaturesClient';

export const metadata = {
  title: 'Features | TraderX Pro — Every Capability Explained',
  description: 'Explore TraderX Pro features: AI Trading Copilot, Whale Tracker, Sentiment Engine, Infinite Data Export, Combo Alerts, and Enterprise Security.',
};

export default function FeaturesPage() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <main>
        <FeaturesClient />
      </main>
      <MarketingFooter />
    </div>
  );
}
