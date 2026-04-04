import Navbar from '@/components/marketing/Navbar';
import MarketingFooter from '@/components/marketing/Footer';
import ContactClient from './ContactClient';

export const metadata = {
  title: 'Contact Us | TraderX Pro',
  description: 'Get in touch with the TraderX Pro team — support, sales, partnerships, and feature requests.',
};

export default function ContactPage() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <ContactClient />
      <MarketingFooter />
    </div>
  );
}
