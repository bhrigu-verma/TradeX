import HomeClient from './HomeClient';

export const metadata = {
  title: 'TraderX Pro | AI-Powered Trading Intelligence for X/Twitter',
  description: 'Turn X/Twitter noise into actionable trade signals. AI Copilot, Whale Tracking, Real-Time Sentiment, and infinite data exports — all in one Chrome Extension.',
};

export default function HomePage() {
  return (
    <main>
      <HomeClient />
    </main>
  );
}
