/**
 * Discovers and runs all `seed-*.ts` product scripts in `apps/api/scripts/`.
 *
 * Any new `seed-*.ts` file added to this directory is picked up automatically.
 * Optional CLI filters match against the filename (e.g. `npm run seed:products -- olibolla`).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { DataSource } from 'typeorm';
import dataSource from '../src/common/database/data-source';
import { printSeedSummary } from './lib/product-seed.helper';

interface SeedModule {
  seed?: (ds: DataSource) => Promise<void>;
}

function discoverSeedFiles(scriptsDir: string, filters: string[]): string[] {
  const files = fs
    .readdirSync(scriptsDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        /^seed-.*\.ts$/i.test(entry.name) &&
        entry.name !== 'seed-all.ts',
    )
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (!filters.length) return files;

  const normalized = filters.map((f) => f.toLowerCase());
  return files.filter((file) => {
    const lower = file.toLowerCase();
    return normalized.some((term) => lower.includes(term));
  });
}

function parseFilters(argv: string[]): string[] {
  const filters: string[] = [];
  for (const arg of argv) {
    if (arg.startsWith('--only=')) {
      filters.push(
        ...arg
          .slice('--only='.length)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      );
    } else if (!arg.startsWith('-')) {
      filters.push(arg.trim());
    }
  }
  return filters;
}

function runStandaloneSubprocess(apiDir: string, filePath: string): void {
  const tsNodeBin = require.resolve('ts-node/dist/bin.js');
  const result = spawnSync(
    process.execPath,
    [
      tsNodeBin,
      '-P',
      'tsconfig.typeorm.json',
      '-r',
      'tsconfig-paths/register',
      filePath,
    ],
    {
      cwd: apiDir,
      stdio: 'inherit',
    },
  );

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Process exited with status ${result.status ?? 'unknown'}`);
  }
}

async function main(): Promise<void> {
  const scriptsDir = __dirname;
  const apiDir = path.resolve(scriptsDir, '..');
  const filters = parseFilters(process.argv.slice(2));
  const files = discoverSeedFiles(scriptsDir, filters);

  if (!files.length) {
    console.log('هیچ فایل seed مطابق فیلتر پیدا نشد.');
    return;
  }

  console.log(`\n=== اجرای ${files.length} فایل seed محصولات ===`);
  for (const file of files) {
    console.log(`  • ${file}`);
  }

  const ds: DataSource = await dataSource.initialize();
  console.log(
    `\n  db=${(ds.options as { database?: string }).database} host=${(ds.options as { host?: string }).host}`,
  );

  const succeeded: string[] = [];
  const failed: Array<{ file: string; error: string }> = [];

  try {
    for (const file of files) {
      const fullPath = path.join(scriptsDir, file);
      console.log(`\n----------------------------------------`);
      console.log(`▶ اجرا: ${file}`);
      console.log(`----------------------------------------`);

      try {
        const source = fs.readFileSync(fullPath, 'utf8');
        const exportsSeedFn = /export\s+(?:async\s+)?function\s+seed\b/.test(
          source,
        );

        if (exportsSeedFn) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const mod = require(fullPath) as SeedModule;
          if (typeof mod.seed !== 'function') {
            throw new Error(`Module ${file} does not export a valid seed() function`);
          }
          await mod.seed(ds);
        } else {
          runStandaloneSubprocess(apiDir, fullPath);
        }

        succeeded.push(file);
        console.log(`✓ موفق: ${file}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        failed.push({ file, error: message });
        console.error(`✗ خطا در ${file}:`, err);
      }
    }

    await printSeedSummary(ds);
  } finally {
    await ds.destroy();
  }

  console.log('\n=== نتیجه‌ی اجرای seed ها ===');
  console.log(`  موفق: ${succeeded.length} | ناموفق: ${failed.length}`);
  if (failed.length) {
    for (const item of failed) {
      console.error(`  ✗ ${item.file}: ${item.error}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n✗ Seed runner failed:', error);
  process.exit(1);
});
