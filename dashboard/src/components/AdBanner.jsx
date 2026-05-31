import React from 'react';

/**
 * AdBanner — Placeholder ad slot for free-tier users.
 * 
 * Designed to be swapped with real ad code (Google AdSense, Carbon Ads, etc.)
 * by replacing the inner content of the ad-container div.
 * 
 * Props:
 *   - position: 'top' | 'between' | 'bottom' — styling hint for placement context
 *   - format: 'banner' | 'rectangle' — ad format/layout
 */
export default function AdBanner({ position = 'between', format = 'banner' }) {
  const isBanner = format === 'banner';

  return (
    <div
      className="ad-container"
      style={{
        width: '100%',
        maxWidth: isBanner ? '728px' : '300px',
        margin: position === 'top' ? '0 auto 1.5rem auto' : 
               position === 'bottom' ? '1.5rem auto 0 auto' : 
               '1.5rem auto',
        padding: '0.75rem',
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '0.5rem',
        position: 'relative',
        minHeight: isBanner ? '90px' : '250px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ad label */}
      <span
        style={{
          position: 'absolute',
          top: '0.25rem',
          left: '0.5rem',
          fontSize: '0.6rem',
          fontWeight: 600,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Ad
      </span>

      {/* Placeholder content — replace this with real ad code */}
      <div
        style={{
          textAlign: 'center',
          color: '#475569',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem', opacity: 0.5 }}>📢</div>
        <div style={{ fontWeight: 500 }}>
          {isBanner ? 'Sponsor Space Available' : 'Advertisement'}
        </div>
        <div style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
          728×90 {isBanner ? 'Banner' : '300×250 Rectangle'}
        </div>
      </div>

      {/* Swap-in instructions (hidden in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            bottom: '0.25rem',
            right: '0.5rem',
            fontSize: '0.55rem',
            color: '#334155',
          }}
        >
          Replace with ad code
        </div>
      )}
    </div>
  );
}