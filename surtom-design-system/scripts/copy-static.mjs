import { cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

await mkdir(dist, { recursive: true });
await cp(join(root, 'src', 'styles', 'fonts.css'), join(dist, 'fonts.css'));
await cp(join(root, 'src', 'assets', 'fonts'), join(dist, 'fonts'), { recursive: true });

console.log('Copied fonts.css and font files to dist.');
