import { rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

await rm(join(dirname(fileURLToPath(import.meta.url)), '..', 'dist'), { recursive: true, force: true });
