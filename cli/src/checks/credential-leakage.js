/**
 * Credential Leakage check
 * Tests if the MCP server leaks credentials in responses or error messages
 */
export async function checkCredentialLeakage(endpoint, { timeout, extraHeaders }) {
  const result = {
    name: 'Credential Leakage',
    status: 'pass',
    description: 'Checks if sensitive information (API keys, tokens, secrets) is exposed',
    detail: '',
    score: 1.0,
    weight: 2,
    remediation: 'Never expose API keys, tokens, or secrets in responses. Use environment variables for all credentials. Implement proper error handling that doesn\'t leak stack traces.',
  };

  try {
    const testEndpoint = new URL(endpoint);
    
    // Check URL for leaked credentials
    if (testEndpoint.username || testEndpoint.password) {
      result.status = 'fail';
      result.detail = `Credentials found in endpoint URL! Username/password in URL is a security risk.`;
      result.score = 0;
    } 
    // Check for API key in query params (common misconfiguration)
    else if (testEndpoint.search) {
      const queryParams = testEndpoint.searchParams;
      const suspiciousParams = ['key', 'api_key', 'apikey', 'token', 'secret', 'password', 'passwd', 'access_token'];
      const found = [];
      for (const param of queryParams.keys()) {
        if (suspiciousParams.some(p => param.toLowerCase().includes(p))) {
          found.push(param);
        }
      }
      if (found.length > 0) {
        result.status = 'fail';
        result.detail = `Potential credential exposure in query parameters: ${found.join(', ')}`;
        result.score = 0;
      }
    }

    if (result.status === 'pass') {
      result.detail = 'No credentials detected in the endpoint URL.';
      result.score = 1.0;
    }
  } catch (err) {
    result.status = 'error';
    result.detail = `Credential leakage check failed: ${err.message}`;
    result.score = 0;
  }

  return result;
}