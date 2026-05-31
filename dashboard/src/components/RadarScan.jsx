import React from 'react';

/**
 * RadarScan — Animated circular radar scanner SVG
 * Green-on-black oscilloscope-style radar sweep animation
 */
export default function RadarScan({ size = 80 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block', margin: '0 auto' }}
    >
      <defs>
        {/* Glow filter */}
        <filter id="radarGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Scan gradient — fades from green to transparent */}
        <radialGradient id="scanGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
          <stop offset="60%" stopColor="#22c55e" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>

        {/* Subtle radial glow behind radar */}
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08" />
          <stop offset="70%" stopColor="#22c55e" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx="50" cy="50" r="48" fill="url(#bgGlow)" />

      {/* Outer ring */}
      <circle
        cx="50" cy="50" r="46"
        fill="none"
        stroke="#22c55e"
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* Middle ring */}
      <circle
        cx="50" cy="50" r="32"
        fill="none"
        stroke="#22c55e"
        strokeWidth="0.5"
        opacity="0.25"
        strokeDasharray="4 4"
      />

      {/* Inner ring */}
      <circle
        cx="50" cy="50" r="18"
        fill="none"
        stroke="#22c55e"
        strokeWidth="0.5"
        opacity="0.2"
        strokeDasharray="3 6"
      />

      {/* Crosshairs */}
      <line x1="4" y1="50" x2="96" y2="50" stroke="#22c55e" strokeWidth="0.3" opacity="0.15" />
      <line x1="50" y1="4" x2="50" y2="96" stroke="#22c55e" strokeWidth="0.3" opacity="0.15" />

      {/* Scan wedge — animated sweep */}
      <polygon
        points="50,50 50,4 62,6 72,12 80,22 86,34 90,48 88,62 82,74 72,84 60,90 50,92"
        fill="url(#scanGradient)"
        opacity="0.6"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="3s"
          repeatCount="indefinite"
        />
      </polygon>

      {/* Scan line */}
      <line
        x1="50" y1="50" x2="50" y2="4"
        stroke="#22c55e"
        strokeWidth="1.2"
        opacity="0.8"
        filter="url(#radarGlow)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="3s"
          repeatCount="indefinite"
        />
      </line>

      {/* Center dot */}
      <circle cx="50" cy="50" r="2.5" fill="#22c55e" opacity="0.9" filter="url(#radarGlow)" />

      {/* Blips — random appearing dots */}
      <circle cx="50" cy="50" r="1.5" fill="#22c55e" opacity="0">
        <animate attributeName="opacity" values="0;0;0.9;0" dur="6s" repeatCount="indefinite" />
        <animate attributeName="cx" values="50;50;65;65" dur="6s" repeatCount="indefinite" />
        <animate attributeName="cy" values="50;50;35;35" dur="6s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="50" r="1.5" fill="#22c55e" opacity="0">
        <animate attributeName="opacity" values="0;0;0;0.8;0" dur="8s" repeatCount="indefinite" />
        <animate attributeName="cx" values="50;50;75;75;75" dur="8s" repeatCount="indefinite" />
        <animate attributeName="cy" values="50;50;60;60;60" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="50" r="1" fill="#22c55e" opacity="0">
        <animate attributeName="opacity" values="0;0;0;0;0.7;0" dur="10s" repeatCount="indefinite" />
        <animate attributeName="cx" values="50;50;42;42;42;42" dur="10s" repeatCount="indefinite" />
        <animate attributeName="cy" values="50;50;22;22;22;22" dur="10s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}