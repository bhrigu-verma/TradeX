import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import TermsClient from './TermsClient';

export const metadata = {
  title: 'Terms of Service | TraderX Pro',
  description: 'TraderX Pro terms of service: usage terms, disclaimers, and legal agreements.',
};

export default function TermsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 30%, #0d0d20 60%, #050510 100%)',
      color: 'white',
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
    }}>
      <Navbar />
      <TermsClient />
      <MarketingFooter />
    </div>
  );
}
