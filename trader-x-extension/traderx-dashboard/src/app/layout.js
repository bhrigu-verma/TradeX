/* src/app/layout.js */
import './globals.css';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata = {
  title: {
    template: '%s | TraderX Pro',
    default: 'TraderX Pro | AI-Powered Trading Intelligence',
  },
  description: 'AI-powered trading intelligence platform with sentiment analysis, whale tracking, and actionable trade ideas.',
  metadataBase: new URL('https://traderx.app'),
  openGraph: {
    type: 'website',
    siteName: 'TraderX Pro',
    title: 'TraderX Pro | AI-Powered Trading Intelligence',
    description: 'Turn Twitter/X noise into actionable trade signals with AI copilot, whale flow, and real-time sentiment.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TraderX Pro',
    description: 'AI-powered trading intelligence for stocks and crypto.',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetBrainsMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
