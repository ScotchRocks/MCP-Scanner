import React from 'react';
import { getUser } from '../lib/api';

export default function PricingPage() {
  const user = getUser();

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="gradient-text">
          🎉 Completely Free
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '0.75rem', fontSize: '1.1rem', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
          The MCP Security Scanner is now 100% free. No subscriptions, no credit cards, no limits.
        </p>
      </div>

      <div className="card" style={{ maxWidth: 500, width: '100%', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Everything is included:</h2>
        <ul style={{ listStyle: 'none', marginBottom: '1.5rem', textAlign: 'left' }}>
          {[
            'Unlimited MCP endpoint scans',
            'Full scan history on the dashboard',
            '7 security checks (SSRF, injection, TLS, etc.)',
            'Trust Score with detailed remediation advice',
            'CI/CD integration with exit codes',
            'Cloud dashboard with stats and history',
            'No limits, no paywalls, no credit card needed',
          ].map((f, i) => (
            <li key={i} style={{ padding: '0.4rem 0', color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#22c55e' }}>✓</span> {f}
            </li>
          ))}
        </ul>

        <p style={{ color: '#475569', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          This service is supported by discreet ad placements. We will never paywall features.
        </p>

        {user ? (
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </button>
        ) : (
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => window.location.href = '/login'}>
            Sign In — It's Free
          </button>
        )}
      </div>
    </div>
  );
}