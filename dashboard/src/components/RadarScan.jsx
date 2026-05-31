import React from 'react';

/**
 * RadarScan — Animated circular radar scanner SVG
 * Green-on-black oscilloscope-style radar sweep animation
 * Prominent version with thicker lines and stronger glow
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
        {/* Stronger glow filter */}
        <filter id="radarGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Scan gradient — stronger green wedge */}
        <radialGradient id="scanGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#22c55e" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>

        {/* Background glow behind radar */}
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#22c55e" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx="50" cy="50" r="48" fill="url(#bgGlow)" />

      {/* Outer ring — more prominent */}
      <circle
        cx="50" cy="50" r="46"
        fill="none"
        stroke="#22c55e"
        strokeWidth="1.5"
        opacity="0.7"
        filter="url(#radarGlow)"
      />

      {/* Middle ring */}
      <circle
        cx="50" cy="50" r="32"
        fill="none"
        stroke="#22c55e"
        strokeWidth="1"
        opacity="0.45"
        strokeDasharray="4 4"
      />

      {/* Inner ring */}
      <circle
        cx="50" cy="50" r="18"
        fill="none"
        stroke="#22c55e"
        strokeWidth="1"
        opacity="0.35"
        strokeDasharray="3 6"
      />

      {/* Crosshairs — more visible */}
      <line x1="4" y1="50" x2="96" y2="50" stroke="#22c55e" strokeWidth="0.5" opacity="0.25" />
      <line x1="50" y1="4" x2="50" y2="96" stroke="#22c55e" strokeWidth="0.5" opacity="0.25" />

      {/* Scan wedge — animated sweep */}
      <polygon
        points="50,50 50,4 62,6 72,12 80,22 86,34 90,48 88,62 82,74 72,84 60,90 50,92"
        fill="url(#scanGradient)"
        opacity="0.8"
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

      {/* Scan line — thicker, brighter, glowing */}
      <line
        x1="50" y1="50" x2="50" y2="4"
        stroke="#22c55e"
        strokeWidth="2"
        opacity="1"
        strokeLinecap="round"
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

      {/* Center dot — bigger glow */}
      <circle cx="50" cy="50" r="3.5" fill="#22c55e" opacity="1" filter="url(#radarGlow)" />
      <circle cx="50" cy="50" r="1.5" fill="#4ade80" opacity="0.9" />

      {/* Blips — bigger and brighter */}
      <circle cx="50" cy="50" r="2.5" fill="#4ade80" opacity="0">
        <animate attributeName="opacity" values="0;0;1;0" dur="5s" repeatCount="indefinite" />
        <animate attributeName="cx" values="50;50;68;68" dur="5s" repeatCount="indefinite" />
        <animate attributeName="cy" values="50;50;30;30" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="50" r="2.5" fill="#4ade80" opacity="0">
        <animate attributeName="opacity" values="0;0;0;0.9;0" dur="7s" repeatCount="indefinite" />
        <animate attributeName="cx" values="50;50;78;78;78" dur="7s" repeatCount="indefinite" />
        <animate attributeName="cy" values="50;50;55;55;55" dur="7s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="50" r="2" fill="#4ade80" opacity="0">
        <animate attributeName="opacity" values="0;0;0;0;0.8;0" dur="9s" repeatCount="indefinite" />
        <animate attributeName="cx" values="50;50;40;40;40;40" dur="9s" repeatCount="indefinite" />
        <animate attributeName="cy" values="50;50;20;20;20;20" dur="9s" repeatCount="indefinite" />
      </circle>

      {/* Ring pulse animation */}
      <circle cx="50" cy="50" r="10" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0">
        <animate attributeName="r" values="10;46" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}