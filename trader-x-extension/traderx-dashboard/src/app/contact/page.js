import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import ContactClient from './ContactClient';

export const metadata = {
  title: 'Contact Us | TraderX Pro',
  description: 'Get in touch with the TraderX Pro team — support, sales, partnerships, and feature requests.',
};

export default function ContactPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 30%, #0d0d20 60%, #050510 100%)',
      color: 'white',
      fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
    }}>
      <Navbar />
      <ContactClient />
      <MarketingFooter />
    </div>
  );
}
