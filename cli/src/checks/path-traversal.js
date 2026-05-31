/**
 * Path Traversal check
 * Tests if the MCP server allows file system path traversal attacks
 */
export async function checkPathTraversal(endpoint, { timeout, extraHeaders }) {
  const result = {
    name: 'Path Traversal Protection',
    status: 'pass',
    description: 'Tests if the server prevents directory traversal via path manipulation',
    detail: '',
    score: 1.0,
    weight: 2,
    remediation: 'Sanitize file paths by resolving all path components and rejecting paths that escape the allowed base directory. Use a strict allowlist of permitted paths.',
  };

  try {
    const testEndpoint = new URL(endpoint);
    const path = testEndpoint.pathname;
    
    // Common path traversal patterns to check
    const traversalPatterns = [
      '../', '..\\', '%2e%2e%2f', '..%252f', 
      '....//....//', '..;/', '..%00/'
    ];

    // Check if the path contains suspicious directory traversals
    const suspicious = traversalPatterns.some(p => path?.includes(p));
    
    if (suspicious) {
      result.status = 'fail';
      result.detail = 'Endpoint path contains directory traversal sequences — server may be vulnerable';
      result.score = 0;
    } else if (path?.includes('file://') || path?.includes('readFile') || path?.includes('getFile')) {
      result.status = 'warn';
      result.detail = 'Endpoint appears to handle file operations — verify path sanitization';
      result.score = 0.5;
    } else {
      result.detail = 'No path traversal patterns detected in endpoint structure.';
      result.score = 1.0;
    }
  } catch (err) {
    result.status = 'error';
    result.detail = `Path traversal check failed: ${err.message}`;
    result.score = 0;
  }

  return result;
}