import dataSource from '../src/common/database/data-source';

(async () => {
  const ds = await dataSource.initialize();
  const cats = await ds.query(`SELECT id, name, slug, "parentId" FROM categories ORDER BY id`);
  console.log('--- CATEGORIES ---');
  console.table(cats);
  const groups = await ds.query(`SELECT id, slug, name, "sortOrder", "isActive", "isFilterable" FROM tag_groups ORDER BY "sortOrder", id`);
  console.log('\n--- TAG GROUPS ---');
  console.table(groups);
  const brands = await ds.query(`SELECT id, name, slug FROM brands ORDER BY id`);
  console.log('\n--- BRANDS ---');
  console.table(brands);
  const attrs = await ds.query(`SELECT id, name, kind FROM attributes ORDER BY id`);
  console.log('\n--- ATTRIBUTES ---');
  console.table(attrs);
  await ds.destroy();
})().catch((e) => { console.error(e); process.exit(1); });
