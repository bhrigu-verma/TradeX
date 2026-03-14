import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import GuideClient from './GuideClient';

export const metadata = {
  title: 'How It Works | TraderX Pro — Installation & Setup Guide',
  description: 'Get started with TraderX Pro in 60 seconds. Install the Chrome extension, configure your watchlist, set up alerts, and start trading with AI-powered intelligence.',
};

export default function GuidePage() {
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
        <GuideClient />
      </main>
      <MarketingFooter />
    </div>
  );
}
