import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { queryAll, queryOne, run } from '../db/database.js';
import { requireAuth, requireSubscription } from '../middleware/auth.js';

// Dynamic import of the scanner (CLI code, available in the monorepo)
let scanEndpoint;
try {
  const scanner = await import('../../cli/src/scanner.js');
  scanEndpoint = scanner.scanEndpoint;
} catch (e) {
  // Fallback if CLI not available
  scanEndpoint = null;
}

const router = Router();

/**
 * POST /api/scans/run — Run a scan on an endpoint (authenticated)
 * Body: { endpoint, timeout? }
 */
router.post('/scans/run', requireAuth, async (req, res) => {
  const { endpoint, timeout } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'endpoint is required' });
  }

  try {
    // Import and run the CLI scanner dynamically
    const { scanEndpoint: runScan } = await import('../../cli/src/scanner.js');
    
    const result = await runScan(endpoint, { 
      timeout: parseInt(timeout) || 10000 
    });

    // Save the result
    const id = uuidv4();
    run(
      'INSERT INTO scans (id, user_id, endpoint, trust_score, grade, checks_data, summary) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, endpoint, result.trustScore, result.grade || '', JSON.stringify(result.checks || []), JSON.stringify(result.summary || {})]
    );

    res.status(201).json({
      id,
      endpoint: result.endpoint,
      trustScore: result.trustScore,
      grade: result.grade,
      checks: result.checks,
      summary: result.summary,
      timestamp: result.timestamp,
    });
  } catch (err) {
    console.error('Scan run error:', err);
    res.status(500).json({ error: `Scan failed: ${err.message}` });
  }
});

/**
 * POST /api/scans — Save a scan result (authenticated)
 * Body: { endpoint, trustScore, grade, checks, summary }
 */
router.post('/scans', requireAuth, (req, res) => {
  const { endpoint, trustScore, grade, checks, summary } = req.body;

  if (!endpoint || trustScore === undefined) {
    return res.status(400).json({ error: 'endpoint and trustScore are required' });
  }

  const id = uuidv4();
  run(
    'INSERT INTO scans (id, user_id, endpoint, trust_score, grade, checks_data, summary) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, endpoint, trustScore, grade || '', JSON.stringify(checks || []), JSON.stringify(summary || {})]
  );

  res.status(201).json({ id, message: 'Scan saved successfully' });
});

/**
 * GET /api/scans — Get scan history for current user
 * Query: ?limit=10&offset=0
 */
router.get('/scans', requireAuth, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const offset = parseInt(req.query.offset) || 0;

  const scans = queryAll(
    'SELECT id, endpoint, trust_score, grade, created_at FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [req.user.id, limit, offset]
  );

  const totalRow = queryOne('SELECT COUNT(*) as count FROM scans WHERE user_id = ?', [req.user.id]);

  res.json({
    scans,
    total: totalRow?.count || 0,
    limit,
    offset,
  });
});

/**
 * GET /api/scans/:id — Get detailed scan result
 */
router.get('/scans/:id', requireAuth, (req, res) => {
  const scan = queryOne('SELECT * FROM scans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }

  res.json({
    ...scan,
    checks: JSON.parse(scan.checks_data),
    summary: JSON.parse(scan.summary),
  });
});

/**
 * DELETE /api/scans/:id — Delete a scan
 */
router.delete('/scans/:id', requireAuth, (req, res) => {
  const before = queryOne('SELECT COUNT(*) as cnt FROM scans WHERE user_id = ?', [req.user.id]);
  run('DELETE FROM scans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  const after = queryOne('SELECT COUNT(*) as cnt FROM scans WHERE user_id = ?', [req.user.id]);
  
  if (before.cnt === after.cnt) {
    return res.status(404).json({ error: 'Scan not found' });
  }

  res.json({ message: 'Scan deleted' });
});

/**
 * GET /api/scans/stats — Get scan statistics for the current user
 */
router.get('/scans/stats', requireAuth, (req, res) => {
  const stats = queryOne(`
    SELECT 
      COUNT(*) as total_scans,
      AVG(trust_score) as avg_trust_score,
      MIN(trust_score) as min_score,
      MAX(trust_score) as max_score,
      SUM(CASE WHEN trust_score >= 80 THEN 1 ELSE 0 END) as passed_scans,
      SUM(CASE WHEN trust_score < 50 THEN 1 ELSE 0 END) as critical_scans,
      COUNT(DISTINCT endpoint) as unique_endpoints
    FROM scans WHERE user_id = ?
  `, [req.user.id]);

  const recentScans = queryAll(
    'SELECT created_at, trust_score FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
    [req.user.id]
  );

  res.json({ ...stats, recentScans: recentScans.reverse() });
});

/**
 * POST /api/keys — Generate a new API key
 * Body: { name? }
 */
router.post('/keys', requireAuth, requireSubscription('basic_pro', 'team'), (req, res) => {
  const name = req.body.name || 'default';
  const id = uuidv4();
  const rawKey = `mcp_scan_${randomBytes(24).toString('hex')}`;

  run('INSERT INTO api_keys (id, user_id, key_hash, name) VALUES (?, ?, ?, ?)',
    [id, req.user.id, rawKey, name]);

  res.status(201).json({
    id,
    key: rawKey,
    name,
    message: 'Save this key — it will not be shown again',
  });
});

/**
 * GET /api/keys — List API keys for user
 */
router.get('/keys', requireAuth, (req, res) => {
  const keys = queryAll(
    'SELECT id, name, is_active, created_at, last_used_at FROM api_keys WHERE user_id = ?',
    [req.user.id]
  );

  res.json({ keys });
});

/**
 * DELETE /api/keys/:id — Revoke an API key
 */
router.delete('/keys/:id', requireAuth, (req, res) => {
  const before = queryOne('SELECT is_active FROM api_keys WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  
  if (!before) {
    return res.status(404).json({ error: 'Key not found' });
  }

  run('UPDATE api_keys SET is_active = 0 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'API key revoked' });
});

export default router;