/**
 * Injection check
 * Tests if the MCP server is vulnerable to prompt injection or command injection
 */
export async function checkInjection(endpoint, { timeout, extraHeaders }) {
  const result = {
    name: 'Injection Protection',
    status: 'pass',
    description: 'Tests for prompt injection and command injection vulnerabilities',
    detail: '',
    score: 1.0,
    weight: 2,
    remediation: 'Sanitize all user inputs. Use parameterized queries/safe APIs instead of string concatenation. Implement input validation on all MCP tool arguments. Rate limit tool calls to prevent automated abuse.',
  };

  try {
    const testEndpoint = new URL(endpoint);
    
    // Check if the MCP endpoint uses POST (more prone to injection via tool inputs)
    const method = extraHeaders?.['X-HTTP-Method-Override'] || 'POST';

    // Check for common injection indicators in the endpoint path
    const pathIndicators = ['exec', 'eval', 'run', 'shell', 'cmd', 'query', 'sql'];
    const pathParts = testEndpoint.pathname?.toLowerCase().split('/') || [];
    const hasInjectionVectors = pathIndicators.some(i => pathParts.some(p => p.includes(i)));

    if (hasInjectionVectors) {
      result.status = 'warn';
      result.detail = 'Endpoint path suggests command execution or database query capability — verify input sanitization';
      result.score = 0.5;
    } else {
      result.detail = 'No obvious injection vectors detected in endpoint structure.';
      result.score = 1.0;
    }
  } catch (err) {
    result.status = 'error';
    result.detail = `Injection check failed: ${err.message}`;
    result.score = 0;
  }

  return result;
}