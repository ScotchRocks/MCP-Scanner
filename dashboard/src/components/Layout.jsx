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
        <a href="/dashboard" style={styles.logo}>🔐 MCP Scanner</a>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/help" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>Help</a>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user.email}</span>
          <span style={{ 
            background: user.tier === 'basic_pro' ? '#3b82f6' : user.tier === 'team' ? '#8b5cf6' : '#334155',
            color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 
          }}>
            {user.tier || 'free'}
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