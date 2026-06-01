import React, { useState } from 'react';
import { login } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div className="card" style={{ width: 400, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }} className="gradient-text">100% Free MCP Scanner</h1>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Free security auditing for AI agent endpoints
          </p>
          <div style={{ marginTop: '0.75rem', display: 'inline-block', background: 'linear-gradient(135deg, #065f46, #047857)', color: '#6ee7b7', padding: '0.25rem 1rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
            🆓 Completely free — no credit card required
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'left', background: '#0f172a', borderRadius: '0.5rem', padding: '1rem', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>✓</span>
              <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>Scan any MCP endpoint for vulnerabilities — <strong style={{ color: '#6ee7b7' }}>free</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>✓</span>
              <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>Get a Trust Score (0-100) with detailed security report</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>✓</span>
              <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>Detect SSRF, injection, credential leaks &amp; more</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>✓</span>
              <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>CI/CD ready — add to your pipeline in minutes</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ marginBottom: '1rem' }}
          />
          
          {error && (
            <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          
          <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Get Started — It\'s Free'}
          </button>
        </form>
      </div>
    </div>
  );
}