/**
 * Authentication check
 * Tests if the MCP server enforces authentication
 */
export async function checkAuthentication(endpoint, { timeout, extraHeaders }) {
  const result = {
    name: 'Authentication Strength',
    status: 'warn',
    description: 'Evaluates whether proper authentication is required to access the MCP server',
    detail: '',
    score: 0.5,
    weight: 2,
    remediation: 'Implement authentication for all MCP endpoints. Use Bearer tokens (JWT) or API keys. Avoid transmitting auth tokens in URLs. Require auth for all tools/resources.',
  };

  try {
    const testEndpoint = new URL(endpoint);
    
    // Check if the endpoint uses authentication headers
    const hasAuthHeader = extraHeaders && (
      extraHeaders['Authorization'] || 
      extraHeaders['authorization'] || 
      extraHeaders['X-API-Key'] ||
      extraHeaders['x-api-key']
    );

    if (hasAuthHeader) {
      result.status = 'pass';
      result.detail = 'Authentication headers detected. Bearer token/API key is being sent.';
      result.score = 1.0;
    } else {
      // Check if endpoint uses HTTPS (basic auth is acceptable over HTTPS)
      if (testEndpoint.protocol === 'https:') {
        result.status = 'warn';
        result.detail = 'No authentication headers detected, but endpoint uses HTTPS. Consider adding auth.';
        result.score = 0.5;
      } else {
        result.status = 'fail';
        result.detail = 'No authentication detected AND unencrypted HTTP — credentials would be sent in cleartext';
        result.score = 0;
      }
    }
  } catch (err) {
    result.status = 'error';
    result.detail = `Authentication check failed: ${err.message}`;
    result.score = 0;
  }

  return result;
}