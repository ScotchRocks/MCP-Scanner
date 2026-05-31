/**
 * Rate Limiting check
 * Evaluates whether the MCP endpoint implements rate limiting
 */
export async function checkRateLimiting(endpoint, { timeout, extraHeaders }) {
  const result = {
    name: 'Rate Limiting',
    status: 'warn',
    description: 'Checks if the server has rate limiting to prevent abuse',
    detail: '',
    score: 0.5,
    weight: 1,
    remediation: 'Implement rate limiting (e.g., 100 requests/minute per IP). Return 429 Too Many Requests with Retry-After headers. Consider token bucket or sliding window algorithms for MCP endpoints.',
  };

  try {
    // Attempt a lightweight probe to check for rate limit headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'MCP-Security-Scanner/1.0',
        ...extraHeaders,
      },
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (response) {
      // Check for rate limit headers
      const rateLimitHeaders = [
        'x-ratelimit-limit', 'x-rate-limit', 'ratelimit-limit',
        'x-ratelimit-remaining', 'retry-after',
      ];
      
      const hasRateLimiting = rateLimitHeaders.some(h => response.headers.get(h) !== null);
      
      if (hasRateLimiting) {
        result.status = 'pass';
        result.detail = 'Rate limiting headers detected — server implements request throttling.';
        result.score = 1.0;
      } else {
        result.status = 'warn';
        result.detail = 'No rate limiting headers detected. Server may be vulnerable to abuse.';
        result.score = 0.4;
      }
    } else {
      result.detail = 'Could not probe the endpoint for rate limiting headers.';
      result.score = 0.3;
    }
  } catch (err) {
    // Non-blocking check — don't error out completely
    result.detail = 'Rate limiting check skipped (endpoint not reachable for probe).';
    result.score = 0.3;
  }

  return result;
}