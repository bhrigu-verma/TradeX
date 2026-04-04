import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import TermsClient from './TermsClient';

export const metadata = {
  title: 'Terms of Service | TraderX Pro',
  description: 'TraderX Pro terms of service: usage terms, disclaimers, and legal agreements.',
};

export default function TermsPage() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <TermsClient />
      <MarketingFooter />
    </div>
  );
}
