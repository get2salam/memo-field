import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const packagePath = join(root, 'package.json');
const workflowPath = join(root, '.github', 'workflows', 'verify.yml');

const [packageSource, workflowSource] = await Promise.all([
  readFile(packagePath, 'utf8'),
  readFile(workflowPath, 'utf8'),
]);

const pkg = JSON.parse(packageSource);
const scripts = pkg.scripts || {};
const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

expect(scripts['check:assets'] === 'node scripts/check-static-assets.mjs',
  'package.json must keep check:assets wired to the static asset verifier.');
expect(scripts['check:workflow'] === 'node scripts/check-developer-workflow.mjs',
  'package.json must expose check:workflow for CI contract checks.');
expect(scripts['check:spec'] === 'node scripts/check-app-spec.mjs',
  'package.json must expose check:spec for SPEC consistency checks.');
expect(scripts.test === 'node --test tests/*.test.mjs',
  'npm test must use an unquoted node:test glob: node --test tests/*.test.mjs');
expect(scripts.verify?.includes('npm run check:assets'),
  'npm run verify must include the static asset check.');
expect(scripts.verify?.includes('npm run check:workflow'),
  'npm run verify must include the workflow contract check.');
expect(scripts.verify?.includes('npm run check:spec'),
  'npm run verify must include the SPEC consistency check.');
expect(scripts.verify?.includes('npm test'),
  'npm run verify must include the Node regression suite.');

const workflowChecks = [
  {
    ok: /on:\s*\n\s*push:\s*\n\s*branches:\s*\[main\]/.test(workflowSource),
    message: 'verify.yml must run on pushes to main.',
  },
  {
    ok: /pull_request:\s*(?:\n|$)/.test(workflowSource),
    message: 'verify.yml must run on pull requests.',
  },
  {
    ok: /uses:\s*actions\/checkout@v4/.test(workflowSource),
    message: 'verify.yml must use actions/checkout@v4.',
  },
  {
    ok: /uses:\s*actions\/setup-node@v4/.test(workflowSource),
    message: 'verify.yml must use actions/setup-node@v4.',
  },
  {
    ok: /node-version:\s*20/.test(workflowSource),
    message: 'verify.yml must test with Node 20.',
  },
  {
    ok: /run:\s*npm run verify/.test(workflowSource),
    message: 'verify.yml must delegate to npm run verify.',
  },
];

for (const check of workflowChecks) expect(check.ok, check.message);

if (failures.length > 0) {
  console.error('Developer workflow contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Verified package scripts and GitHub Actions workflow contract.');
}
