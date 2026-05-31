#!/usr/bin/env node

/**
 * MCP Security Scanner Core Engine
 * Tests MCP endpoints for common vulnerabilities and generates a Trust Score
 */

import { checkSSRF } from './checks/ssrf.js';
import { checkPathTraversal } from './checks/path-traversal.js';
import { checkCredentialLeakage } from './checks/credential-leakage.js';
import { checkAuthentication } from './checks/authentication.js';
import { checkTLS } from './checks/tls.js';
import { checkRateLimiting } from './checks/rate-limiting.js';
import { checkInjection } from './checks/injection.js';

/**
 * Scan an MCP endpoint for vulnerabilities
 * @param {string} endpoint - MCP server endpoint URL
 * @param {object} options - Scan options
 * @param {number} options.timeout - Request timeout in ms
 * @param {object} options.extraHeaders - Additional headers to include
 * @returns {Promise<object>} Scan result with trust score
 */
export async function scanEndpoint(endpoint, options = {}) {
  const {
    timeout = 10000,
    extraHeaders = {},
  } = options;

  const checks = await Promise.allSettled([
    checkSSRF(endpoint, { timeout, extraHeaders }),
    checkPathTraversal(endpoint, { timeout, extraHeaders }),
    checkCredentialLeakage(endpoint, { timeout, extraHeaders }),
    checkAuthentication(endpoint, { timeout, extraHeaders }),
    checkTLS(endpoint, { timeout, extraHeaders }),
    checkRateLimiting(endpoint, { timeout, extraHeaders }),
    checkInjection(endpoint, { timeout, extraHeaders }),
  ]);

  const results = checks.map((r, i) => {
    const checkNames = [
      'ssrf', 'path-traversal', 'credential-leakage', 
      'authentication', 'tls', 'rate-limiting', 'injection'
    ];
    if (r.status === 'fulfilled') {
      return { ...r.value, id: checkNames[i] };
    }
    return {
      id: checkNames[i],
      name: checkNames[i].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      status: 'error',
      description: 'Check failed to execute',
      detail: r.reason?.message || 'Unknown error',
      score: 0,
      weight: 1,
      remediation: 'Investigate scanner connectivity to the endpoint',
    };
  });

  // Calculate weighted trust score
  const totalWeight = results.reduce((sum, c) => sum + c.weight, 0);
  const weightedScore = results.reduce((sum, c) => sum + (c.score * c.weight), 0);
  const trustScore = Math.round((weightedScore / totalWeight) * 100);

  // Determine grade
  let grade;
  if (trustScore >= 90) grade = 'A+ (Excellent)';
  else if (trustScore >= 80) grade = 'A (Very Good)';
  else if (trustScore >= 70) grade = 'B (Good)';
  else if (trustScore >= 60) grade = 'C (Fair)';
  else if (trustScore >= 50) grade = 'D (Poor)';
  else grade = 'F (Critical)';

  return {
    endpoint,
    timestamp: new Date().toISOString(),
    trustScore,
    grade,
    checks: results.map(c => ({
      name: c.name,
      status: c.status,
      description: c.description,
      detail: c.detail,
      score: c.score,
      remediation: c.remediation,
    })),
    summary: {
      total: results.length,
      passed: results.filter(c => c.status === 'pass').length,
      warnings: results.filter(c => c.status === 'warn').length,
      failed: results.filter(c => c.status === 'fail').length,
      errors: results.filter(c => c.status === 'error').length,
    },
  };
}

/**
 * Format scan result as a simple text summary
 */
export function formatSummary(result) {
  let output = `MCP Trust Score: ${result.trustScore}/100 (${result.grade})\n`;
  output += `Endpoint: ${result.endpoint}\n`;
  output += `Checks: ${result.summary.passed} passed, ${result.summary.warnings} warnings, ${result.summary.failed} failed\n`;
  
  for (const check of result.checks) {
    const icon = check.status === 'pass' ? '✓' : check.status === 'warn' ? '!' : '✗';
    output += `  ${icon} ${check.name}: ${check.status.toUpperCase()} - ${check.detail || check.description}\n`;
  }
  
  return output;
}
