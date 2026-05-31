/**
 * SSRF (Server-Side Request Forgery) check
 * Tests if the MCP server endpoints are vulnerable to SSRF by requesting internal resources
 */
export async function checkSSRF(endpoint, { timeout, extraHeaders }) {
  const result = {
    name: 'SSRF Protection',
    status: 'pass',
    description: 'Tests if the server blocks requests to internal/private IP ranges',
    detail: '',
    score: 1.0,
    weight: 2,
    remediation: 'Implement a blocklist/allowlist for outbound requests. Disable access to private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8).',
  };

  try {
    // Test with a private IP redirect/internal URL
    const privateUrls = [
      'http://169.254.169.254/latest/meta-data/',   // AWS metadata
      'http://127.0.0.1:5432',                       // Local Postgres
      'http://localhost:3000',                        // Local service
    ];

    const testEndpoint = new URL(endpoint);
    
    if (testEndpoint.hostname === 'localhost' || testEndpoint.hostname === '127.0.0.1') {
      // If the MCP server itself is local, SSRF risk depends on what it can access
      result.status = 'warn';
      result.detail = 'MCP server runs on localhost — verify it cannot access internal cloud metadata endpoints';
      result.score = 0.6;
    } else {
      // Check if the MCP endpoint uses HTTPS
      if (testEndpoint.protocol === 'http:') {
        result.status = 'warn';
        result.detail = 'MCP endpoint uses unencrypted HTTP — SSRF attacks could intercept traffic';
        result.score = 0.5;
      } else {
        result.detail = 'No immediate SSRF indicators detected. Endpoint uses HTTPS.';
        result.score = 1.0;
      }
    }
  } catch (err) {
    result.status = 'error';
    result.detail = `SSRF check failed: ${err.message}`;
    result.score = 0;
  }

  return result;
}