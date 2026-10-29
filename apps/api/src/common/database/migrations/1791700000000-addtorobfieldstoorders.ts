import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTorobFieldsToOrders1791700000000 implements MigrationInterface {
  name = 'AddTorobFieldsToOrders1791700000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "torobClid" varchar(100)`,
    );
    await q.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "purchasedAt" timestamptz(6)`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS "idx_orders_torob_purchased"
       ON "orders" ("purchasedAt", "id")
       WHERE "torobClid" IS NOT NULL AND "purchasedAt" IS NOT NULL`,
    );
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "idx_orders_torob_purchased"`);
    await q.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "purchasedAt"`);
    await q.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "torobClid"`);
  }
}