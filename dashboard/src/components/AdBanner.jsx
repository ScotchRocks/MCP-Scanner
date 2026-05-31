import React from 'react';

/**
 * AdBanner — Placeholder ad slot for free-tier users.
 *
 * Props:
 *   - position: 'top' | 'between' | 'bottom'
 *   - compact: boolean — smaller footprint when true (default: false)
 */
export default function AdBanner({ position = 'between', compact = false }) {
  if (compact) {
    return (
      <div
        className="ad-container"
        style={{
          width: '100%',
          maxWidth: '468px',
          margin: position === 'top' ? '0 auto 1rem auto' : 
                 position === 'bottom' ? '1rem auto 0 auto' : 
                 '1rem auto',
          padding: '0.4rem 0.75rem',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '0.375rem',
          position: 'relative',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{
          position: 'absolute', top: '0.15rem', left: '0.4rem',
          fontSize: '0.55rem', fontWeight: 600, color: '#475569',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>Ad</span>
        <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.75rem', padding: '0 2rem' }}>
          <span style={{ opacity: 0.5, marginRight: '0.3rem' }}>📢</span>
          Sponsor Space Available
        </div>
      </div>
    );
  }

  // Non-compact version (rectangle)
  return (
    <div
      className="ad-container"
      style={{
        width: '100%',
        maxWidth: '200px',
        margin: position === 'top' ? '0 auto 1rem auto' : 
               position === 'bottom' ? '1rem auto 0 auto' : 
               '1rem auto',
        padding: '0.5rem',
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '0.375rem',
        position: 'relative',
        minHeight: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{
        position: 'absolute', top: '0.2rem', left: '0.4rem',
        fontSize: '0.55rem', fontWeight: 600, color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>Ad</span>
      <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.75rem' }}>
        <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem', opacity: 0.5 }}>📢</div>
        <div style={{ fontWeight: 500 }}>Ad Space</div>
      </div>
    </div>
  );
}