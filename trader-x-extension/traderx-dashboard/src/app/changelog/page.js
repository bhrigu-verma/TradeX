import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import ChangelogClient from './ChangelogClient';

export const metadata = {
  title: 'Changelog | TraderX Pro',
  description: "See what's new in TraderX Pro: feature releases, improvements, and bug fixes.",
};

export default function ChangelogPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 30%, #0d0d20 60%, #050510 100%)',
      color: 'white',
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
    }}>
      <Navbar />
      <ChangelogClient />
      <MarketingFooter />
    </div>
  );
}
