import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import FeaturesClient from './FeaturesClient';

export const metadata = {
  title: 'Features | TraderX Pro — Every Capability Explained',
  description: 'Explore TraderX Pro features: AI Trading Copilot, Whale Tracker, Sentiment Engine, Infinite Data Export, Combo Alerts, and Enterprise Security.',
};

export default function FeaturesPage() {
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
        <FeaturesClient />
      </main>
      <MarketingFooter />
    </div>
  );
}
