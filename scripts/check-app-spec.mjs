import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mainPath = join(root, 'js', 'main.js');
const source = await readFile(mainPath, 'utf8');

function extractSpec(src) {
  const marker = 'const SPEC = ';
  const start = src.indexOf(marker);
  if (start === -1) throw new Error('Could not find "const SPEC = " in js/main.js');
  const braceStart = start + marker.length;
  if (src[braceStart] !== '{') throw new Error('SPEC must be assigned an object literal');

  let depth = 0;
  for (let i = braceStart; i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') {
      depth -= 1;
      if (depth === 0) return src.slice(braceStart, i + 1);
    }
  }
  throw new Error('Unterminated SPEC object literal in js/main.js');
}

let spec;
try {
  spec = JSON.parse(extractSpec(source));
} catch (error) {
  console.error(`Failed to parse SPEC from js/main.js as JSON: ${error.message}`);
  process.exit(1);
}

const failures = [];
function expect(condition, message) {
  if (!condition) failures.push(message);
}

const states = new Set(spec.states || []);
const categories = new Set(spec.categories || []);
const stateWeights = spec.stateWeights || {};

for (const state of Object.keys(stateWeights)) {
  expect(states.has(state),
    `stateWeights references unknown state "${state}" (add it to states or fix the typo).`);
}
for (const state of states) {
  expect(Object.prototype.hasOwnProperty.call(stateWeights, state),
    `state "${state}" has no stateWeights entry; scoring.js will silently score it as 0.`);
}
for (const state of spec.completedStates || []) {
  expect(states.has(state), `completedStates references unknown state "${state}".`);
}
for (const action of spec.actions || []) {
  if (action.state !== undefined) {
    expect(states.has(action.state), `action "${action.id}" targets unknown state "${action.state}".`);
  }
}
for (const item of spec.items || []) {
  expect(states.has(item.state), `seed item "${item.title}" has unknown state "${item.state}".`);
  expect(categories.has(item.category), `seed item "${item.title}" has unknown category "${item.category}".`);
}

const metric = spec.metric || {};
expect(typeof metric.min === 'number' && typeof metric.max === 'number' && metric.min < metric.max,
  'metric.min must be a number less than metric.max.');
expect(typeof metric.default === 'number' && metric.default >= metric.min && metric.default <= metric.max,
  'metric.default must fall inside [metric.min, metric.max].');

if (failures.length > 0) {
  console.error('App spec contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Verified SPEC consistency in js/main.js (${states.size} states, ${categories.size} categories, ${(spec.items || []).length} seed items).`,
  );
}
