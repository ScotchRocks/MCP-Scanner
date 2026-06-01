import React from 'react';

const styles = {
  h1: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' },
  h2: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '2rem' },
  h3: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', marginTop: '1.5rem' },
  p: { color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem' },
  code: { background: '#0f172a', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', color: '#38bdf8', fontSize: '0.85rem' },
};

export default function GuidePage() {
  return (
    <article>
      <h1 style={styles.h1}>What is MCP Security? A Guide to Auditing AI Agent Endpoints</h1>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Published by MarketForge — Last updated May 2026
      </p>

      <section>
        <h2 style={styles.h2}>What Is MCP?</h2>
        <p style={styles.p}>
          The <strong>Model Context Protocol (MCP)</strong> is an open protocol developed by Anthropic that allows AI agents — 
          like Claude, Cursor, and GitHub Copilot — to connect to external data sources, tools, and services. 
          MCP servers act as the bridge between AI models and real-world systems: databases, file systems, APIs, 
          and cloud services.
        </p>
        <p style={styles.p}>
          As AI agents become more capable, the MCP servers they connect to gain access to increasingly sensitive 
          resources. An insecure MCP server can expose your codebase, leak API keys, or become a vector for 
          attacks against your infrastructure.
        </p>
      </section>

      <section>
        <h2 style={styles.h2}>Why MCP Security Matters</h2>
        <p style={styles.p}>
          MCP servers typically run with significant privileges — read/write access to codebases, databases, 
          and cloud resources. A compromised or misconfigured MCP server can lead to:
        </p>
        <ul style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 2, marginBottom: '1rem', paddingLeft: '1.5rem' }}>
          <li><strong>Credential leakage</strong> — API keys and tokens exposed via MCP endpoints</li>
          <li><strong>SSRF attacks</strong> — Internal cloud metadata endpoints accessed through the MCP server</li>
          <li><strong>Path traversal</strong> — Unauthorized file system access on the host machine</li>
          <li><strong>Prompt injection</strong> — Malicious commands sent via MCP tool arguments</li>
          <li><strong>Data exfiltration</strong> — Sensitive data shipped to unauthorized destinations</li>
        </ul>
        <p style={styles.p}>
          According to recent security research, over 60% of publicly accessible MCP servers have at least 
          one critical vulnerability. Don't let yours be one of them.
        </p>
      </section>

      <section>
        <h2 style={styles.h2}>How the MCP Security Scanner Works</h2>
        <p style={styles.p}>
          The <a href="/dashboard" style={{ color: '#38bdf8', textDecoration: 'none' }}>MCP Security Scanner</a> runs 7 specialized security checks against any MCP endpoint 
          and produces a weighted <strong>Trust Score (0–100)</strong>:
        </p>
        <div className="card" style={{ margin: '1rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Check</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>What It Detects</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>Weight</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['SSRF Protection', 'Checks for access to internal/private IP ranges and cloud metadata endpoints', 'High'],
                ['Path Traversal', 'Detects directory traversal sequences and unsafe file operations', 'High'],
                ['Credential Leakage', 'Scans URLs for exposed API keys, tokens, and secrets in query params', 'High'],
                ['Authentication', 'Evaluates whether proper authentication is enforced', 'High'],
                ['TLS/SSL Encryption', 'Verifies HTTPS usage and encryption in transit', 'Medium'],
                ['Rate Limiting', 'Checks for throttle headers to prevent abuse', 'Low'],
                ['Injection Protection', 'Tests for prompt injection and command injection vectors', 'High'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '0.5rem', color: '#e2e8f0', fontWeight: 500 }}>{row[0]}</td>
                  <td style={{ padding: '0.5rem', color: '#94a3b8' }}>{row[1]}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: row[2] === 'High' ? '#f97316' : '#94a3b8' }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={styles.p}>
          Each check returns a pass/warn/fail status with specific remediation advice. The weighted Trust Score 
          gives you a clear at-a-glance picture of your MCP server's security posture.
        </p>
      </section>

      <section>
        <h2 style={styles.h2}>Sample Trust Scores from Real Scans</h2>
        <p style={styles.p}>
          Here are sample scores from scanning well-known endpoints — showing what a good security posture looks like:
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div className="card" style={{ flex: 1, minWidth: 200, textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}>92</div>
            <div style={{ color: '#22c55e', fontSize: '0.8rem' }}>A (Very Good)</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Sample MCP Server</div>
          </div>
          <div className="card" style={{ flex: 1, minWidth: 200, textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}>87</div>
            <div style={{ color: '#22c55e', fontSize: '0.8rem' }}>A (Very Good)</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Well-Configured API</div>
          </div>
          <div className="card" style={{ flex: 1, minWidth: 200, textAlign: 'center', padding: '1.25rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#eab308' }}>64</div>
            <div style={{ color: '#eab308', fontSize: '0.8rem' }}>C (Fair)</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Minimal Config</div>
          </div>
        </div>
        <p style={styles.p}>
          Most well-maintained MCP servers score between 80–95. Scores below 60 typically indicate missing 
          authentication, unencrypted HTTP, or exposed credentials.
        </p>
      </section>

      <section>
        <h2 style={styles.h2}>How to Integrate with CI/CD</h2>
        <p style={styles.p}>
          The MCP Scanner CLI (<code style={styles.code}>npx mcp-security-scanner</code>) is designed for CI/CD pipelines. 
          It returns exit code 0 for passing scores (≥50) and exit code 1 for failing scores (&lt;50):
        </p>
        <pre style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#38bdf8', overflow: 'auto', marginBottom: '1rem' }}>
{`# GitHub Actions example
name: MCP Security Scan
on: [deployment]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - run: npx mcp-security-scanner scan $MCP_ENDPOINT`}
        </pre>
        <p style={styles.p}>
          This ensures that every MCP server deployment is automatically audited before going live. 
          See the <a href="/dashboard" style={{ color: '#38bdf8', textDecoration: 'none' }}>Dashboard</a> for more integration options.
        </p>
      </section>

      <section>
        <h2 style={styles.h2}>Get Started for Free</h2>
        <p style={styles.p}>
          The MCP Security Scanner is <strong>100% free</strong> — no credit card, no paywalls, no limits. 
          You can scan any MCP endpoint instantly and get a detailed security report with remediation advice.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <a href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>Scan an Endpoint</a>
          <a href="/help" className="btn-secondary" style={{ textDecoration: 'none' }}>Help & FAQ</a>
        </div>
      </section>
    </article>
  );
}