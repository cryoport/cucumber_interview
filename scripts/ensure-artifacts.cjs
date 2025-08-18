#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dirs = [
  'artifacts',
  path.join('artifacts', 'html'),
  path.join('artifacts', 'screenshots'),
  path.join('artifacts', 'videos'),
  path.join('artifacts', 'traces'),
];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
}

const reportJson = path.join('artifacts', 'cucumber-report.json');
if (!fs.existsSync(reportJson)) {
  fs.writeFileSync(reportJson, '[]', 'utf8');
}

console.log('[ensure-artifacts] prepared artifacts directories');
