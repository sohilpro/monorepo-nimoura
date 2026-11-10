import dataSource from '../src/common/database/data-source';

(async () => {
  const ds = await dataSource.initialize();
  const [info] = await ds.query(
    `select current_database() db, current_user usr, inet_server_addr() addr, inet_server_port() port`,
  );
  console.log('connection:', info);

  const products = await ds.query(`
    SELECT p.id, p.title, p.slug, p.type, p.price, p.stock, p."lowStockThreshold",
           c.name AS category, b.name AS brand, p.thumbnail,
           (SELECT COUNT(*) FROM product_images pi WHERE pi."productId" = p.id) AS images
    FROM products p
    LEFT JOIN categories c ON c.id = p."categoryId"
    LEFT JOIN brands b ON b.id = p."brandId"`);
  console.log('\n--- PRODUCTS ---');
  console.table(products);

  const variants = await ds.query(`
    SELECT v.id, v.sku, v.price, v.stock, v."isAvailable",
           av.value AS colour, av."colorHex", v.images
    FROM product_variants v
    JOIN variant_attribute_values vav ON vav.variant_id = v.id
    JOIN attribute_values av ON av.id = vav.attribute_value_id
    ORDER BY v.id`);
  console.log('\n--- VARIANTS ---');
  console.table(variants);

  const cats = await ds.query(`SELECT id, name, slug, "parentId" FROM categories ORDER BY id`);
  console.log('\n--- CATEGORIES ---');
  console.table(cats);

  const tags = await ds.query(`
    SELECT tg.name AS grp, t.name AS tag, t.slug
    FROM tags t JOIN tag_groups tg ON tg.id = t."groupId"
    ORDER BY tg."sortOrder", t."sortOrder"`);
  console.log('\n--- TAGS ---');
  console.table(tags);

  const links = await ds.query(`
    SELECT t.name FROM product_tag pt JOIN tags t ON t.id = pt.tag_id WHERE pt.product_id = 1 ORDER BY t.id`);
  console.log('\n--- TAGS ON PRODUCT ---');
  console.log(links.map((l: any) => l.name).join('، '));

  const attrs = await ds.query(`
    SELECT a.name, a.kind, av.value, av."colorHex"
    FROM attributes a JOIN attribute_values av ON av."attributeId" = a.id ORDER BY av.id`);
  console.log('\n--- ATTRIBUTES ---');
  console.table(attrs);

  await ds.destroy();
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
