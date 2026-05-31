import React from 'react';

export default function HelpPage() {
  const faqs = [
    {
      q: 'How do I scan an MCP endpoint?',
      a: 'Enter the endpoint URL in the scan form on the Dashboard and click "Scan Now". The scanner will run 7 security checks and return a Trust Score within seconds.',
    },
    {
      q: 'What does the Trust Score mean?',
      a: 'The Trust Score is a 0–100 rating based on weighted security checks. 80+ is good, 50–79 needs work, and below 50 is critical. Each check shows remediation advice for failed items.',
    },
    {
      q: 'What checks are performed?',
      a: 'The scanner checks 7 areas: SSRF Protection, Path Traversal, Credential Leakage, Authentication Strength, TLS/SSL Encryption, Rate Limiting, and Injection Protection.',
    },
    {
      q: 'Is scanning free?',
      a: 'Yes! Basic scanning is always free. The CLI scanner is open source. Upgrade to Basic Pro ($19/mo) or Team ($49/mo) for unlimited scan history, API keys, cloud dashboard, and compliance reports.',
    },
    {
      q: 'How do I upgrade?',
      a: 'Go to the Pricing page, choose a plan, and click Subscribe. We use Stripe for secure payment processing. In dev mode, subscriptions are simulated instantly.',
    },
    {
      q: 'How do I use the CLI instead of the web dashboard?',
      a: 'Run npx mcp-security-scanner scan <endpoint-url> in your terminal. Use --output json for JSON format. Use --help to see all options including batch scanning.',
    },
    {
      q: 'Can I integrate this with CI/CD?',
      a: 'Yes! The CLI returns exit code 0 for pass (score ≥ 50) and 1 for fail. See the CI/CD section on the Dashboard for a GitHub Actions example.',
    },
    {
      q: 'I found a bug or have a question.',
      a: 'Email support@mcp-scanner.dev. We respond within 24 hours on business days.',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>❓ Help & FAQ</h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
          Common questions about the MCP Security Scanner
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="card"
            style={{ padding: '1rem 1.25rem', cursor: 'pointer' }}
          >
            <summary style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.95rem' }}>
              {faq.q}
            </summary>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
              {faq.a}
            </p>
          </details>
        ))}
      </div>

      <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '1.5rem' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Still have questions? Email us at{' '}
          <a href="mailto:support@mcp-scanner.dev" style={{ color: '#38bdf8', textDecoration: 'none' }}>
            support@mcp-scanner.dev
          </a>
        </p>
      </div>
    </div>
  );
}