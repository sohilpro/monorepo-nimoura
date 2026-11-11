import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttributeKindAndColorHex1791800000000 implements MigrationInterface {
  name = 'AddAttributeKindAndColorHex1791800000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "attributes" ADD COLUMN IF NOT EXISTS "kind" varchar(16) NOT NULL DEFAULT 'custom'`,
    );
    await q.query(
      `ALTER TABLE "attribute_values" ADD COLUMN IF NOT EXISTS "colorHex" varchar(7)`,
    );

    // Backfill kind for existing attributes by their Persian name.
    await q.query(
      `UPDATE "attributes" SET "kind" = 'volume' WHERE "name" = 'حجم'`,
    );
    await q.query(
      `UPDATE "attributes" SET "kind" = 'weight' WHERE "name" = 'وزن'`,
    );
    await q.query(
      `UPDATE "attributes" SET "kind" = 'color' WHERE "name" = 'رنگ'`,
    );
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "attribute_values" DROP COLUMN IF EXISTS "colorHex"`,
    );
    await q.query(`ALTER TABLE "attributes" DROP COLUMN IF EXISTS "kind"`);
  }
}
