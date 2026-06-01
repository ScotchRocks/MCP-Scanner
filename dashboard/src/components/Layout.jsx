import React from 'react';

const styles = {
  container: { minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column' },
  header: { borderBottom: '1px solid #1e293b', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', textDecoration: 'none' },
  main: { flex: 1, padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' },
};

export default function Layout({ children }) {
  const user = JSON.parse(localStorage.getItem('mcp_user') || '{}');

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <a href="/dashboard" style={{ ...styles.logo, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
            <circle cx="50" cy="50" r="46" fill="none" stroke="#22c55e" strokeWidth="0.8" opacity="0.5" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#22c55e" strokeWidth="0.5" opacity="0.3" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="18" fill="none" stroke="#22c55e" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 6" />
            <line x1="50" y1="50" x2="50" y2="4" stroke="#22c55e" strokeWidth="1.2" opacity="0.9" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="3s" repeatCount="indefinite" />
            </line>
            <circle cx="50" cy="50" r="2.5" fill="#22c55e" opacity="0.9" />
          </svg>
          MCP Scanner<span style={{ color: '#f97316' }}> Pro</span></a>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/help" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>Help</a>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user.email}</span>
          <span style={{ 
            background: '#065f46',
            color: '#6ee7b7', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 
          }}>
            free
          </span>
          <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
            Logout
          </button>
        </div>
      </header>
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}