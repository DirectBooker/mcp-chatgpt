import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { build } from 'esbuild';

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

  console.error(`Bundling ${entries.length} TypeScript resource(s)...`);

  for (const entry of entries) {
    const outfile = join(outDir, `${entry.name}.js`);
    try {
      await build({
        entryPoints: [entry.path],
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: ['es2020'],
        outfile,
        sourcemap: true,
        jsx: 'automatic',
        jsxImportSource: 'react',
        minify: false,
      });
      console.error(`✓ Bundled ${entry.name} -> ${outfile}`);
    } catch (err) {
      console.error(`✗ Failed to bundle ${entry.name}:`, err && err.message ? err.message : err);
      process.exitCode = 1;
    }
  }
}

main().catch(err => {
  console.error('Bundling failed:', err);
  process.exit(1);
});
