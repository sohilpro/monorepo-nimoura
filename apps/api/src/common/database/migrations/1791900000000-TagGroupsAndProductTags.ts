import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Turns the hard-coded tag "type" column into real, admin-managed tag groups
 * and adds per-product low-stock threshold.
 *
 * NOTE: run with DB_SYNCHRONIZE=false. Schema sync would drop the old
 * tags.type/value columns before this migration can copy their data.
 */
export class TagGroupsAndProductTags1791900000000 implements MigrationInterface {
  name = 'TagGroupsAndProductTags1791900000000';

  private readonly defaultGroups: Array<[string, string, number]> = [
    ['nature', 'ماهیت محصول', 10],
    ['skin-type', 'نوع پوست', 20],
    ['hair-type', 'جنس مو', 30],
    ['benefit', 'مزیت', 40],
    ['concern', 'نیاز و دغدغه', 50],
    ['feature', 'ویژگی‌ها', 60],
    ['season', 'مناسب فصل', 70],
    ['brand-line', 'لاین برند', 80],
  ];

  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS "tag_groups" (
        "id" SERIAL PRIMARY KEY,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "name" varchar(64) NOT NULL,
        "slug" varchar(64) NOT NULL,
        "icon" varchar(64),
        "description" varchar(255),
        "sortOrder" int NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "isFilterable" boolean NOT NULL DEFAULT true
      )`);
    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_tag_groups_slug" ON "tag_groups" ("slug")`,
    );

    for (const [slug, name, sortOrder] of this.defaultGroups) {
      await q.query(
        `INSERT INTO "tag_groups" ("slug","name","sortOrder") VALUES ($1,$2,$3)
         ON CONFLICT ("slug") DO NOTHING`,
        [slug, name, sortOrder],
      );
    }

    // --- tags: add new columns --------------------------------------------
    await q.query(`ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "groupId" int`);
    await q.query(`ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "slug" varchar(160)`);
    await q.query(`ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "color" varchar(7)`);
    await q.query(`ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "sortOrder" int NOT NULL DEFAULT 0`);
    await q.query(`ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true`);

    const hasType = await q.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name='tags' AND column_name='type'`,
    );
    const hasValue = await q.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name='tags' AND column_name='value'`,
    );

    if (hasType.length) {
      // groups for any custom type that is not one of the defaults
      await q.query(`
        INSERT INTO "tag_groups" ("slug","name","sortOrder")
        SELECT DISTINCT t."type", t."type", 100 FROM "tags" t
        WHERE t."type" IS NOT NULL
        ON CONFLICT ("slug") DO NOTHING`);
      await q.query(`
        UPDATE "tags" t SET "groupId" = g."id"
        FROM "tag_groups" g WHERE g."slug" = t."type" AND t."groupId" IS NULL`);
    }

    if (hasValue.length) {
      await q.query(`ALTER TABLE "tags" RENAME COLUMN "value" TO "name"`);
    }

    // --- slugs (unique per group) ------------------------------------------
    const rows: Array<{ id: number; groupId: number; name: string }> = await q.query(
      `SELECT "id","groupId","name" FROM "tags" WHERE "slug" IS NULL ORDER BY "id"`,
    );
    const taken = new Map<number, Set<string>>();
    for (const row of rows) {
      const used = taken.get(row.groupId) ?? new Set<string>();
      taken.set(row.groupId, used);
      const base =
        row.name.trim().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]+/gu, '').toLowerCase() ||
        `tag-${row.id}`;
      let slug = base;
      let i = 2;
      while (used.has(slug)) slug = `${base}-${i++}`;
      used.add(slug);
      await q.query(`UPDATE "tags" SET "slug" = $1 WHERE "id" = $2`, [slug, row.id]);
    }

    // --- constraints ---------------------------------------------------------
    await q.query(`ALTER TABLE "tags" ALTER COLUMN "groupId" SET NOT NULL`);
    await q.query(`ALTER TABLE "tags" ALTER COLUMN "slug" SET NOT NULL`);
    if (hasType.length) await q.query(`ALTER TABLE "tags" DROP COLUMN "type" CASCADE`);

    await q.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_tags_group') THEN
          ALTER TABLE "tags" ADD CONSTRAINT "FK_tags_group"
            FOREIGN KEY ("groupId") REFERENCES "tag_groups"("id") ON DELETE RESTRICT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_tags_group_slug') THEN
          ALTER TABLE "tags" ADD CONSTRAINT "UQ_tags_group_slug" UNIQUE ("groupId","slug");
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_tags_group_name') THEN
          ALTER TABLE "tags" ADD CONSTRAINT "UQ_tags_group_name" UNIQUE ("groupId","name");
        END IF;
      END $$;`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_tags_group" ON "tags" ("groupId")`);

    // --- products ------------------------------------------------------------
    await q.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "lowStockThreshold" int NOT NULL DEFAULT 5`,
    );
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "lowStockThreshold"`);

    await q.query(`ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "type" varchar(64)`);
    await q.query(`UPDATE "tags" t SET "type" = g."slug" FROM "tag_groups" g WHERE g."id" = t."groupId"`);
    await q.query(`ALTER TABLE "tags" ALTER COLUMN "type" SET NOT NULL`);
    await q.query(`ALTER TABLE "tags" RENAME COLUMN "name" TO "value"`);
    await q.query(`ALTER TABLE "tags" DROP CONSTRAINT IF EXISTS "UQ_tags_group_slug"`);
    await q.query(`ALTER TABLE "tags" DROP CONSTRAINT IF EXISTS "UQ_tags_group_name"`);
    await q.query(`ALTER TABLE "tags" DROP CONSTRAINT IF EXISTS "FK_tags_group"`);
    await q.query(`DROP INDEX IF EXISTS "IDX_tags_group"`);
    await q.query(`ALTER TABLE "tags" ADD CONSTRAINT "UQ_tags_type_value" UNIQUE ("type","value")`);
    for (const col of ['groupId', 'slug', 'color', 'sortOrder', 'isActive']) {
      await q.query(`ALTER TABLE "tags" DROP COLUMN IF EXISTS "${col}"`);
    }
    await q.query(`DROP TABLE IF EXISTS "tag_groups"`);
  }
}
