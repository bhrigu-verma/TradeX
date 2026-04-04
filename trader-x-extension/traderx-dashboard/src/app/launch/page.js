import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import LaunchClient from './LaunchClient';

export const metadata = {
  title: 'Launch Guide | TraderX Pro',
  description: 'Complete guide to launching TraderX Pro: Chrome Web Store publishing, Telegram bot setup, server deployment, and going live.',
};

export default function LaunchPage() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <LaunchClient />
      <MarketingFooter />
    </div>
  );
}
