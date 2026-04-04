import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import PrivacyClient from './PrivacyClient';

export const metadata = {
  title: 'Privacy Policy | TraderX Pro',
  description: 'TraderX Pro privacy policy: how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <PrivacyClient />
      <MarketingFooter />
    </div>
  );
}
