import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import CommunityContent from './CommunityContent';

export const metadata = {
  title: 'Community | TraderX Pro',
  description: 'Join the TraderX Pro community on Telegram, Discord, and X/Twitter for signals, support, and alpha.',
};

export default function CommunityPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 30%, #0d0d20 60%, #050510 100%)',
      color: 'white',
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
    }}>
      <Navbar />
      <CommunityContent />
      <MarketingFooter />
    </div>
  );
}
