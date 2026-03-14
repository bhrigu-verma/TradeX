import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import LaunchClient from './LaunchClient';

export const metadata = {
  title: 'Launch Guide | TraderX Pro',
  description: 'Complete guide to launching TraderX Pro: Chrome Web Store publishing, Telegram bot setup, server deployment, and going live.',
};

export default function LaunchPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 30%, #0d0d20 60%, #050510 100%)',
      color: 'white',
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
    }}>
      <Navbar />
      <LaunchClient />
      <MarketingFooter />
    </div>
  );
}
