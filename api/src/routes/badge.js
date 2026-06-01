import { Router } from 'express';
import { queryOne } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/badge/:userId.svg — Dynamic SVG badge for README embeds
 * Returns a shield-style SVG showing the user's latest trust score
 */
router.get('/badge/:userId.svg', (req, res) => {
  const { userId } = req.params;

  // Get the user's latest scan
  const scan = queryOne(`
    SELECT trust_score, grade, endpoint, created_at 
    FROM scans 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `, [userId]);

  const score = scan ? scan.trust_score : 0;
  const grade = scan ? scan.grade : 'N/A';
  
  // Determine color based on score
  let color;
  if (score >= 80) color = '#22c55e';      // green
  else if (score >= 60) color = '#eab308';  // yellow
  else if (score >= 40) color = '#f97316';  // orange
  else color = '#ef4444';                    // red

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="56" viewBox="0 0 240 56">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="240" height="56" rx="8" fill="url(#bg)" stroke="#334155" stroke-width="1"/>
  
  <!-- Shield icon -->
  <path d="M16 14 L40 20 L40 34 C40 44 28 50 28 50 C28 50 16 44 16 34 Z" 
        fill="${color}" opacity="0.9"/>
  
  <!-- Checkmark -->
  <path d="M21 32 L26 37 L35 27" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Text -->
  <text x="52" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">MCP TRUST SCORE</text>
  <text x="52" y="42" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="${color}">${score}/100</text>
  <text x="120" y="42" font-family="Arial, sans-serif" font-size="12" fill="#64748b">${grade}</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, max-age=3600');
  res.send(svg);
});

export default router;