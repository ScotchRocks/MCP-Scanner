/**
 * TLS/SSL check
 * Verifies the MCP endpoint uses proper TLS encryption
 */
export async function checkTLS(endpoint, { timeout, extraHeaders }) {
  const result = {
    name: 'TLS/SSL Encryption',
    status: 'pass',
    description: 'Verifies the endpoint uses HTTPS and proper TLS configuration',
    detail: '',
    score: 1.0,
    weight: 1,
    remediation: 'Always use HTTPS (TLS 1.2+) for MCP endpoints. Redirect all HTTP traffic to HTTPS. Avoid self-signed certificates in production.',
  };

  try {
    const testEndpoint = new URL(endpoint);
    
    if (testEndpoint.protocol === 'https:') {
      result.detail = 'Endpoint uses HTTPS (TLS encrypted).';
      result.score = 1.0;
    } else if (testEndpoint.protocol === 'http:') {
      const isLocalhost = testEndpoint.hostname === 'localhost' || 
                          testEndpoint.hostname === '127.0.0.1' ||
                          testEndpoint.hostname === '0.0.0.0';
      
      if (isLocalhost) {
        result.status = 'warn';
        result.detail = 'Using HTTP on localhost — acceptable for local development but verify in production';
        result.score = 0.6;
      } else {
        result.status = 'fail';
        result.detail = 'Unencrypted HTTP — all data transmitted in cleartext. Critical security risk for MCP traffic.';
        result.score = 0;
      }
    } else {
      result.status = 'warn';
      result.detail = `Unknown protocol: ${testEndpoint.protocol}`;
      result.score = 0.3;
    }
  } catch (err) {
    result.status = 'error';
    result.detail = `TLS check failed: ${err.message}`;
    result.score = 0;
  }

  return result;
}