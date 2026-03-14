import { discordBotDocs } from '@/content/marketingContent';

export const metadata = {
  title: 'Discord Bot Setup - TraderX Pro Docs',
  description: 'Set up the TraderX Pro Discord bot with slash commands, permissions, and alert delivery.',
};

export default function DiscordBotSetupPage() {
  return (
    <article className="doc-article">
      <h1>{discordBotDocs.title}</h1>
      <p className="lead">{discordBotDocs.intro}</p>

      <h2>Prerequisites</h2>
      <ul>
        {discordBotDocs.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
      </ul>

      {discordBotDocs.steps.map((step, i) => (
        <div key={i}>
          <h2>{step.title}</h2>
          <ul>
            {step.points.map((point, j) => <li key={j}>{point}</li>)}
          </ul>
        </div>
      ))}

      <h2>Sample Environment Variables</h2>
      <div className="code-block">
        <code>{discordBotDocs.sampleEnv.join('\n')}</code>
      </div>

      <h2>Security Checklist</h2>
      <ul>
        {discordBotDocs.securityChecklist.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
