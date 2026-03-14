import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import PrivacyClient from './PrivacyClient';

export const metadata = {
  title: 'Privacy Policy | TraderX Pro',
  description: 'TraderX Pro privacy policy: how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 30%, #0d0d20 60%, #050510 100%)',
      color: 'white',
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
    }}>
      <Navbar />
      <PrivacyClient />
      <MarketingFooter />
    </div>
  );
}
