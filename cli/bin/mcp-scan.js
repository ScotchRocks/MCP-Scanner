#!/usr/bin/env node

/**
 * mcp-scan — MCP Security & Trust Scanner
 * CLI entry point
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { scanEndpoint } from '../src/scanner.js';
import { readFileSync } from 'fs';

const program = new Command();

program
  .name('mcp-scan')
  .description('🔍 MCP Security & Trust Scanner — Assess your MCP server security posture')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan an MCP endpoint for vulnerabilities')
  .argument('<endpoint>', 'MCP server endpoint URL (e.g. http://localhost:8080/mcp or https://api.example.com/mcp)')
  .option('-o, --output <format>', 'Output format: json, table, summary', 'table')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '10000')
  .option('--headers <json>', 'Additional headers as JSON string')
  .action(async (endpoint, options) => {
    console.log(chalk.bold.cyan('\n╔══════════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║     MCP Security & Trust Scanner v1.0.0     ║'));
    console.log(chalk.bold.cyan('╚══════════════════════════════════════════════╝\n'));

    const extraHeaders = options.headers ? JSON.parse(options.headers) : {};
    
    const result = await scanEndpoint(endpoint, {
      timeout: parseInt(options.timeout),
      extraHeaders,
    });

    if (options.output === 'json') {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.trustScore >= 50 ? 0 : 1);
    }

    // Summary output
    console.log(chalk.bold(`\n📋 Scan Report for: ${chalk.underline(endpoint)}`));
    console.log(`   ${chalk.gray(`Scanned at: ${result.timestamp}`)}`);
    
    // Trust score with color
    const scoreColor = result.trustScore >= 80 ? chalk.green : 
                       result.trustScore >= 50 ? chalk.yellow : chalk.red;
    console.log(`\n${chalk.bold('🏆 Trust Score:')} ${scoreColor.bold(`${result.trustScore}/100`)}`);
    
    // Grade
    console.log(`   Grade: ${scoreColor.bold(result.grade)}`);

    // Check results
    console.log(chalk.bold('\n📊 Check Results:\n'));
    for (const check of result.checks) {
      const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
      const color = check.status === 'pass' ? chalk.green : check.status === 'warn' ? chalk.yellow : chalk.red;
      console.log(`   ${icon} ${color.bold(check.name)}`);
      console.log(`     ${chalk.gray(check.description)}`);
      if (check.detail) {
        console.log(`     ${color(check.detail)}`);
      }
    }

    // Recommendations
    const failed = result.checks.filter(c => c.status === 'fail');
    const warns = result.checks.filter(c => c.status === 'warn');
    if (failed.length > 0 || warns.length > 0) {
      console.log(chalk.bold('\n🔧 Recommendations:\n'));
      for (const check of [...failed, ...warns]) {
        if (check.remediation) {
          console.log(`   • ${check.name}: ${chalk.cyan(check.remediation)}`);
        }
      }
    }

    console.log(); // trailing newline
    process.exit(result.trustScore >= 50 ? 0 : 1);
  });

program
  .command('batch')
  .description('Scan multiple endpoints from a file')
  .argument('<file>', 'JSON file with array of endpoints to scan')
  .option('-o, --output <format>', 'Output format', 'table')
  .action(async (file, options) => {
    const endpoints = JSON.parse(readFileSync(file, 'utf-8'));
    if (!Array.isArray(endpoints)) {
      console.error(chalk.red('File must contain a JSON array of endpoint strings'));
      process.exit(1);
    }
    
    console.log(chalk.bold(`\nBatch scanning ${endpoints.length} endpoints...\n`));
    
    const results = [];
    for (const ep of endpoints) {
      const r = await scanEndpoint(ep, { timeout: 10000 });
      results.push(r);
      const icon = r.trustScore >= 80 ? '✅' : r.trustScore >= 50 ? '⚠️' : '❌';
      console.log(`   ${icon} ${ep} → ${r.trustScore}/100 (${r.grade})`);
    }
    
    if (options.output === 'json') {
      console.log(JSON.stringify(results, null, 2));
    }
  });

program.parse(process.argv);