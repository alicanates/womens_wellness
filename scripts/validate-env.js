#!/usr/bin/env node
// scripts/validate-env.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const NC = '\x1b[0m';

let failures = 0;

function check(name, fn, fix) {
  try {
    fn();
    console.log(`${GREEN}✔${NC} ${name}`);
  } catch (e) {
    console.log(`${RED}✘${NC} ${name}`);
    if (fix) console.log(`  ${YELLOW}→ ${fix}${NC}`);
    failures++;
  }
}

function command(cmd) {
  execSync(cmd, { stdio: 'ignore' });
}

console.log('🔍 Validating development environment...\n');

console.log('== Core Tools ==');
check('Node.js v20.x', () => {
  const version = execSync('node -v').toString().trim();
  if (!version.startsWith('v20.')) throw new Error();
}, 'Install Node.js 20.x via brew install node@20');

check('PNPM installed', () => command('which pnpm'), 'brew install pnpm');
check('Git installed', () => command('which git'), 'brew install git');
check('Watchman installed', () => command('which watchman'), 'brew install watchman');

console.log('\n== Services ==');
check('PostgreSQL running', () => command('pg_isready -q'), 'brew services start postgresql@16');
check('Redis running', () => {
  const result = execSync('redis-cli ping').toString().trim();
  if (result !== 'PONG') throw new Error();
}, 'brew services start redis');
check('Mailpit SMTP (1025)', () => command('nc -z 127.0.0.1 1025'), 'brew services start mailpit');
check('wellness DB exists', () => {
  execSync("psql -lqt | awk '{print $1}' | grep -qw wellness");
}, 'createdb wellness');

console.log('\n== Environment Files ==');
const envFiles = [
  'apps/api/.env.local',
  'apps/mobile/.env.local',
  'apps/admin/.env.local'
];

envFiles.forEach(file => {
  check(`${file} exists`, () => {
    if (!fs.existsSync(file)) throw new Error();
  }, `Copy from ${file.replace('.local', '.example')}`);
});

// Check for placeholder values
if (fs.existsSync('apps/api/.env.local')) {
  const apiEnv = fs.readFileSync('apps/api/.env.local', 'utf8');

  check('JWT secrets configured', () => {
    if (apiEnv.includes('__GENERATE_WITH_OPENSSL__')) throw new Error();
  }, 'Run: openssl rand -hex 32 (for each secret)');

  check('At least one AI provider configured', () => {
    const hasProvider =
      !apiEnv.includes('sk-PLACEHOLDER_OPENAI_KEY') ||
      !apiEnv.includes('sk-PLACEHOLDER_ANTHROPIC_KEY') ||
      !apiEnv.includes('PLACEHOLDER_GOOGLE_AI_KEY');
    if (!hasProvider) throw new Error();
  }, 'Add at least one AI provider API key');
}

console.log('\n== Optional Tools ==');
check('applesimutils (Detox)',
  () => command('which applesimutils'),
  'brew tap wix/brew && brew install applesimutils'
);

// Summary
console.log('\n' + '='.repeat(40));
if (failures === 0) {
  console.log(`${GREEN}✅ All checks passed! Ready for development.${NC}`);
  process.exit(0);
} else {
  console.log(`${RED}❌ ${failures} check(s) failed. Review the fixes above.${NC}`);
  process.exit(1);
}
