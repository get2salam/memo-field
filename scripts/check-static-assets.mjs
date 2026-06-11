import { access, readFile } from 'node:fs/promises';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = join(root, 'index.html');
const html = await readFile(indexPath, 'utf8');

const references = [
  ...html.matchAll(/<(?:script|link)\b[^>]+(?:src|href)="(\.\.?\/[^"?#]+)"/g),
].map((match) => match[1]);

const missing = [];
for (const reference of references) {
  const target = normalize(join(root, reference));
  if (!target.startsWith(root)) {
    missing.push(`${reference} (escapes project root)`);
    continue;
  }

  try {
    await access(target);
  } catch {
    missing.push(reference);
  }
}

if (missing.length > 0) {
  console.error('Missing static asset references:');
  for (const reference of missing) console.error(`- ${reference}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${references.length} static asset reference(s) from index.html.`);
}
