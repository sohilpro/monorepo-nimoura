import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryImageAndVisualFields1792300000000
  implements MigrationInterface
{
  name = 'AddCategoryImageAndVisualFields1792300000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "image" character varying(500)`,
    );
    await q.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "icon" character varying(500)`,
    );
    await q.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "badge" character varying(50)`,
    );
    await q.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "showInShowcase" boolean NOT NULL DEFAULT true`,
    );
    await q.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "sortOrder" integer NOT NULL DEFAULT 0`,
    );
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "sortOrder"`);
    await q.query(
      `ALTER TABLE "categories" DROP COLUMN IF EXISTS "showInShowcase"`,
    );
    await q.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "badge"`);
    await q.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "icon"`);
    await q.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "image"`);
  }
}
