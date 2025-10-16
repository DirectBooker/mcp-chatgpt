import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { context } from 'esbuild';

async function ensureDir(dir) {
  try {
    await stat(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
}

async function listTsEntries(dir) {
  const files = await readdir(dir);
  return files
    .filter(f => ['.ts', '.tsx'].includes(extname(f)) && !f.startsWith('.') && !f.endsWith('.d.ts'))
    .map(f => ({ name: basename(f, extname(f)), path: join(dir, f) }));
}

async function main() {
  const projectRoot = process.cwd();
  const srcDir = join(projectRoot, 'src/ts-resources');
  const outDir = join(projectRoot, 'dist/ts-resources-bundles');

  await ensureDir(outDir);

  const entries = await listTsEntries(srcDir);
  if (entries.length === 0) {
    console.error(`No TypeScript resources found in ${srcDir}`);
    return;
  }

  // Build a separate context per entry so each emits its own outfile
  const contexts = await Promise.all(
    entries.map(e =>
      context({
        entryPoints: [e.path],
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: ['es2020'],
        outfile: join(outDir, `${e.name}.js`),
        sourcemap: true,
        jsx: 'automatic',
        jsxImportSource: 'react',
        minify: false,
      })
    )
  );

  console.error(`Watching ${entries.length} TypeScript resource(s) for changes...`);
  await Promise.all(contexts.map(c => c.watch()));

  // Keep process alive
  process.stdin.resume();
}

main().catch(err => {
  console.error('Watch failed:', err);
  process.exit(1);
});
