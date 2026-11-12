import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategorySeoAndUniqueSlug1792100000000
  implements MigrationInterface
{
  name = 'AddCategorySeoAndUniqueSlug1792100000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "seoTitle" character varying(255)`,
    );
    await q.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "seoDescription" text`,
    );

    // Backfill null or blank slugs before adding the unique index
    await q.query(
      `UPDATE "categories" SET "slug" = 'cat-' || "id" WHERE "slug" IS NULL OR btrim("slug") = ''`,
    );

    // Deduplicate any existing duplicate slugs among active rows
    await q.query(`
      UPDATE "categories" c
      SET "slug" = c."slug" || '-' || c."id"
      FROM (
        SELECT "id", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "id") AS rn
        FROM "categories"
        WHERE "deleted_at" IS NULL
      ) dup
      WHERE c."id" = dup."id" AND dup.rn > 1
    `);

    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "idx_categories_slug_unique" ON "categories" ("slug") WHERE "deleted_at" IS NULL`,
    );
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "idx_categories_slug_unique"`);
    await q.query(
      `ALTER TABLE "categories" DROP COLUMN IF EXISTS "seoDescription"`,
    );
    await q.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "seoTitle"`);
  }
}
