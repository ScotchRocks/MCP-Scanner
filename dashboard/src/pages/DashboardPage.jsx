import React, { useState, useEffect } from 'react';
import { getScans, getScanStats, runScan, getUser } from '../lib/api';
import AdBanner from '../components/AdBanner';

const scoreColor = (score) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanUrl, setScanUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const user = getUser();

  useEffect(() => {
    Promise.all([
      getScanStats().catch(() => null),
      getScans().catch(() => ({ scans: [] })),
    ]).then(([s, sc]) => {
      setStats(s);
      setScans(sc.scans || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading dashboard...</div>;
  }

  const needUpgrade = user?.tier === 'free';

  const handleRunScan = async () => {
    if (!scanUrl.trim()) return;
    setScanning(true);
    setScanError('');
    setScanResult(null);
    try {
      const result = await runScan(scanUrl.trim());
      setScanResult(result);
      // Refresh stats and scan list
      const [s, sc] = await Promise.all([
        getScanStats().catch(() => null),
        getScans().catch(() => ({ scans: [] })),
      ]);
      if (s) setStats(s);
      setScans(sc.scans || []);
    } catch (err) {
      setScanError(err.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
          {needUpgrade 
            ? 'View basic scan results and upgrade for full history' 
            : 'Your scan history and compliance overview'}
        </p>
      </div>

      {needUpgrade && (
        <div className="card" style={{ background: '#1e1b4b', border: '1px solid #3b3b8b', marginBottom: '2rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ color: '#c4b5fd' }}>🔒 Free Plan</strong>
            <span style={{ color: '#94a3b8', marginLeft: '0.75rem', fontSize: '0.85rem' }}>Upgrade for unlimited scan history, API keys, and compliance reports</span>
          </div>
          <a href="/pricing" className="btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Upgrade →</a>
        </div>
      )}

      {/* Free-tier compact ad */}
      {needUpgrade && <AdBanner position="between" compact />}

      {/* New Scan Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem' }}>🔍 Run a Scan</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Enter an MCP endpoint URL to scan for vulnerabilities and get a Trust Score.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="url"
            value={scanUrl}
            onChange={(e) => setScanUrl(e.target.value)}
            placeholder="https://your-mcp-server.com/mcp"
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === 'Enter' && handleRunScan()}
          />
          <button className="btn-primary" onClick={handleRunScan} disabled={scanning || !scanUrl.trim()} style={{ whiteSpace: 'nowrap' }}>
            {scanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>

        {scanError && (
          <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1rem', fontSize: '0.85rem' }}>
            ❌ {scanError}
          </div>
        )}

        {scanResult && (
          <div style={{ marginTop: '1rem', background: '#0f172a', borderRadius: '0.5rem', padding: '1rem', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{scanResult.endpoint}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(scanResult.timestamp).toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: scoreColor(scanResult.trustScore) }}>{scanResult.trustScore}/100</div>
                <div style={{ fontSize: '0.8rem', color: scoreColor(scanResult.trustScore) }}>{scanResult.grade}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {scanResult.checks?.map((check, i) => (
                <span key={i} style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '0.25rem',
                  background: check.status === 'pass' ? '#166534' : check.status === 'warn' ? '#713f12' : check.status === 'fail' ? '#7f1d1d' : '#1e293b',
                  color: check.status === 'pass' ? '#4ade80' : check.status === 'warn' ? '#facc15' : check.status === 'fail' ? '#f87171' : '#94a3b8',
                }}>
                  {check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : check.status === 'fail' ? '❌' : '❓'} {check.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Scans', value: stats.total_scans || 0, color: '#3b82f6' },
            { label: 'Avg Trust Score', value: stats.avg_trust_score ? Math.round(stats.avg_trust_score) + '/100' : 'N/A', color: '#22c55e' },
            { label: 'Passed (80+)', value: stats.passed_scans || 0, color: '#22c55e' },
            { label: 'Critical (<50)', value: stats.critical_scans || 0, color: '#ef4444' },
          ].map((card, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color }}>{card.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Free-tier compact ad between sections */}
      {needUpgrade && <AdBanner position="bottom" compact />}

      {/* Recent Scans */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Scans</h2>
      
      {scans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p style={{ color: '#64748b' }}>No scans yet. Run <code style={{ background: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', color: '#38bdf8' }}>mcp-scan scan &lt;endpoint&gt;</code> to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {scans.map(scan => (
            <div key={scan.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{scan.endpoint}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(scan.created_at).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  background: scoreColor(scan.trust_score) + '22',
                  color: scoreColor(scan.trust_score),
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.5rem',
                }}>
                  {scan.trust_score}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{scan.grade}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CI/CD Integration Info */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>🔧 CI/CD Integration</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Add the scanner to your CI pipeline to automatically audit MCP servers on every deploy.
        </p>
        <pre style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#38bdf8', overflow: 'auto' }}>
{`# GitHub Actions - .github/workflows/mcp-scan.yml
name: MCP Security Scan
on: [deployment]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - run: npx mcp-security-scanner scan <endpoint-url>`}
        </pre>
      </div>
    </div>
  );
}