function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-seal underline underline-offset-2">{children}</a>;
}

export default function ByokGuide() {
  return (
    <details className="group rounded-xl border border-border bg-paper">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-ink">
        How to get a free OpenRouter key
      </summary>
      <ol className="list-decimal space-y-2 px-4 pb-4 pl-8 text-sm text-muted leading-relaxed">
        <li>Go to <ExtLink href="https://openrouter.ai">openrouter.ai</ExtLink> and sign up (Google, GitHub, or email). No credit card needed.</li>
        <li>Open <ExtLink href="https://openrouter.ai/settings/privacy">openrouter.ai/settings/privacy</ExtLink> and allow free model endpoints (some free models need this, otherwise requests fail with &quot;No endpoints found matching your data policy&quot;).</li>
        <li>Open <ExtLink href="https://openrouter.ai/keys">openrouter.ai/keys</ExtLink> → Create Key → name it &quot;Chinese Learner&quot; → set Credit limit to 0 so it can never spend money → Create.</li>
        <li>Copy the key (starts with <code>sk-or-</code>, shown only once) and paste it here → Save.</li>
        <li>Optional: a one-time $10 credit purchase on OpenRouter raises your free daily limit from 50 to 1,000 requests.</li>
      </ol>
    </details>
  );
}
