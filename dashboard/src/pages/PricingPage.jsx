import React, { useState, useEffect } from 'react';
import { getPrices, createCheckoutSession, getUser } from '../lib/api';

const tierIcons = { free: '🔍', basic_pro: '🛡️', team: '🚀' };

export default function PricingPage() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(null);
  const user = getUser();

  useEffect(() => {
    getPrices().then(d => setPrices(d.prices)).catch(() => {});
  }, []);

  const handleSubscribe = async (price) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setLoading(price.id);
    try {
      const data = await createCheckoutSession(price.priceId, user.id);
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert('Subscription error: ' + err.message);
    }
    setLoading(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <a href="/login" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1rem', display: 'block' }}>
          ← Back to login
        </a>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="gradient-text">
          Choose Your Plan
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.75rem', fontSize: '1.05rem' }}>
          Secure your AI agent endpoints. Start free, upgrade when you're ready.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1000 }}>
        {prices.map(price => (
          <div key={price.id} className="card" style={{ 
            width: 300, 
            padding: '2rem',
            border: user?.tier === price.id.replace('free', 'free').replace('price_basic_pro', 'basic_pro') || 
                    (price.id === 'free' && (!user || user.tier === 'free')) 
              ? '2px solid #6366f1' : '1px solid #334155',
            position: 'relative',
          }}>
            {(user?.tier === price.id || (price.id === 'free' && (!user || user.tier === 'free'))) && (
              <div style={{ position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: 'white', padding: '0.2rem 1rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                Current Plan
              </div>
            )}
            
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{tierIcons[price.id] || '🔐'}</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{price.name}</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>{price.display_price || 'Free'}</span>
              {price.interval && <span style={{ color: '#64748b', fontSize: '0.85rem' }}>/{price.interval}</span>}
            </div>
            
            <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
              {price.features.map((f, i) => (
                <li key={i} style={{ padding: '0.4rem 0', color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#22c55e' }}>✓</span> {f}
                </li>
              ))}
            </ul>

            <button 
              className="btn-primary" 
              style={{ width: '100%', opacity: price.id === 'free' ? 0.6 : 1 }}
              disabled={loading === price.id || price.id === 'free'}
              onClick={() => handleSubscribe(price)}
            >
              {loading === price.id ? 'Processing...' : price.id === 'free' ? 'Get Started' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
      
      {user && (
        <button className="btn-secondary" style={{ marginTop: '2rem' }} onClick={() => window.location.href = '/dashboard'}>
          Go to Dashboard
        </button>
      )}
    </div>
  );
}