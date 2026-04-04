import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import CommunityContent from './CommunityContent';

export const metadata = {
  title: 'Community | TraderX Pro',
  description: 'Join the TraderX Pro community on Telegram, Discord, and X/Twitter for signals, support, and alpha.',
};

export default function CommunityPage() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <CommunityContent />
      <MarketingFooter />
    </div>
  );
}
