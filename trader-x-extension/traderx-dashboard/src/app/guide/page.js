import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import GuideClient from './GuideClient';

export const metadata = {
  title: 'How It Works | TraderX Pro — Installation & Setup Guide',
  description: 'Get started with TraderX Pro in 60 seconds. Install the Chrome extension, configure your watchlist, set up alerts, and start trading with AI-powered intelligence.',
};

export default function GuidePage() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <main>
        <GuideClient />
      </main>
      <MarketingFooter />
    </div>
  );
}
