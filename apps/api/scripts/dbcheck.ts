import ds from '../src/common/database/data-source';

(async () => {
  console.log('options:', (ds.options as any).host, (ds.options as any).database, (ds.options as any).username);
  await ds.initialize();
  const rows = await ds.query('select current_database() as db, current_user as usr, current_schema() as sch');
  console.log(rows);
  const t = await ds.query("select tablename from pg_tables where schemaname='public' order by 1");
  console.log('tables count:', t.length);
  console.log(t.slice(0, 15));
  await ds.destroy();
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
