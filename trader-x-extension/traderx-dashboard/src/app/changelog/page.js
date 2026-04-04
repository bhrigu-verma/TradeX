import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import ChangelogClient from './ChangelogClient';

export const metadata = {
  title: 'Changelog | TraderX Pro',
  description: "See what's new in TraderX Pro: feature releases, improvements, and bug fixes.",
};

export default function ChangelogPage() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <ChangelogClient />
      <MarketingFooter />
    </div>
  );
}
