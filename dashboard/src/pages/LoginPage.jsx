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
      window.location.href = data.user.tier !== 'free' ? '/dashboard' : '/pricing';
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
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔐</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }} className="gradient-text">MCP Scanner</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Security auditing for AI agent endpoints
          </p>
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
            {loading ? 'Signing in...' : 'Sign in / Register'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          Free tier includes basic CLI scanner. Upgrade for cloud features.
        </p>
      </div>
    </div>
  );
}