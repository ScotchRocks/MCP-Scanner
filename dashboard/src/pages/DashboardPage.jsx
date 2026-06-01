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

  const user = JSON.parse(localStorage.getItem('mcp_user') || '{}');
  const badgeUrl = user.id ? `/api/badge/${user.id}.svg` : null;
  const markdownEmbed = badgeUrl ? `[![MCP Trust Score](${window.location.origin}${badgeUrl})](${window.location.origin}/dashboard)` : '';

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

  const handleRunScan = async () => {
    if (!scanUrl.trim()) return;
    setScanning(true);
    setScanError('');
    setScanResult(null);
    try {
      const result = await runScan(scanUrl.trim());
      setScanResult(result);
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
          Your scan history and security overview — completely free
        </p>
      </div>

      {/* Ad Banner */}
      <AdBanner position="between" compact />

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

      {/* Ad Banner */}
      <AdBanner position="bottom" compact />

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

      {/* Trust Score Badge */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>🏆 Trust Score Badge</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Embed your latest scan result in your README or website. Dynamically updates when you run new scans.
        </p>
        {stats?.total_scans > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {badgeUrl && (
              <img 
                src={badgeUrl}
                alt="MCP Trust Score"
                style={{ borderRadius: '0.5rem', border: '1px solid #334155' }}
                onError={e => e.target.style.display = 'none'}
              />
            )}
            <div style={{ flex: 1, minWidth: 280 }}>
              <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Markdown
              </label>
              <pre style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#38bdf8', overflow: 'auto', margin: 0 }}
                onClick={e => { navigator.clipboard?.writeText(e.target.textContent); }}>
                {markdownEmbed}
              </pre>
            </div>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Run a scan first, then come back to get your embeddable badge!</p>
        )}
      </div>

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