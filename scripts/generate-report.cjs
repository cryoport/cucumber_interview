#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const reporter = require('multiple-cucumber-html-reporter');

const jsonDir = path.resolve('artifacts');
const reportPath = path.resolve('artifacts', 'html');

if (!fs.existsSync(jsonDir)) {
  console.error('[report] JSON directory not found:', jsonDir);
  process.exit(0);
}

// Ensure report directory
fs.mkdirSync(reportPath, { recursive: true });

try {
  reporter.generate({
    jsonDir,
    reportPath,
    reportName: 'Mini Cart API – Cucumber Report',
    pageTitle: 'Mini Cart API – Report',
    openReportInBrowser: false,
    displayDuration: true,
    disableLog: true,
    metadata: {
      browser: {
        name: 'headless',
        version: 'n/a'
      },
      device: 'Localhost',
      platform: {
        name: process.platform,
        version: process.version
      }
    },
    customData: {
      title: 'Run Info',
      data: [
        { label: 'Generated', value: new Date().toISOString() },
        { label: 'Base URL', value: 'http://localhost:3000' }
      ]
    }
  });
  console.log('[report] HTML report generated at', reportPath);
} catch (err) {
  console.error('[report] Failed to generate report:', err.message);
  process.exit(0);
}
