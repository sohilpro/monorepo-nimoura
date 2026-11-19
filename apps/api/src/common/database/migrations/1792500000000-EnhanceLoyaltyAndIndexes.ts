import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceLoyaltyAndIndexes1792500000000 implements MigrationInterface {
  name = 'EnhanceLoyaltyAndIndexes1792500000000';

  async up(q: QueryRunner): Promise<void> {
    // 1. Add new enum values to loyalty_ledger_type_enum
    await q.query(`ALTER TYPE "loyalty_ledger_type_enum" ADD VALUE IF NOT EXISTS 'ORDER_REDEMPTION_REFUND'`);
    await q.query(`ALTER TYPE "loyalty_ledger_type_enum" ADD VALUE IF NOT EXISTS 'WITHDRAWAL'`);
    await q.query(`ALTER TYPE "loyalty_ledger_type_enum" ADD VALUE IF NOT EXISTS 'WITHDRAWAL_REFUND'`);

    // 2. Create loyalty_withdrawal_status_enum and loyalty_withdrawals table
    await q.query(`DO $$ BEGIN
      CREATE TYPE "loyalty_withdrawal_status_enum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    await q.query(`CREATE TABLE IF NOT EXISTS "loyalty_withdrawals" (
      "id" SERIAL NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP WITH TIME ZONE,
      "user_id" integer NOT NULL,
      "amount" bigint NOT NULL,
      "iban" varchar(34) NOT NULL,
      "card_number" varchar(24),
      "account_holder_name" varchar(150) NOT NULL,
      "status" "loyalty_withdrawal_status_enum" NOT NULL DEFAULT 'PENDING',
      "admin_note" varchar(500),
      "processed_at" TIMESTAMP WITH TIME ZONE,
      "processed_by_admin_id" integer,
      CONSTRAINT "PK_loyalty_withdrawals" PRIMARY KEY ("id")
    )`);

    await q.query(`ALTER TABLE "loyalty_withdrawals" DROP CONSTRAINT IF EXISTS "FK_loyalty_withdrawals_user"`);
    await q.query(`ALTER TABLE "loyalty_withdrawals" ADD CONSTRAINT "FK_loyalty_withdrawals_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_withdrawals_user_created" ON "loyalty_withdrawals" ("user_id", "created_at")`);

    // 3. Create missing indexes
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_ledger_user_created" ON "loyalty_ledger" ("user_id", "created_at")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_visits_user_week" ON "loyalty_visits" ("user_id", "week_key")`);

    // 4. Update unique constraints to partial unique indexes respecting soft deletes
    await q.query(`ALTER TABLE "loyalty_visits" DROP CONSTRAINT IF EXISTS "UQ_loyalty_visit"`);
    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_loyalty_visit_active" ON "loyalty_visits" ("user_id", "calendar_date") WHERE "deleted_at" IS NULL`);

    await q.query(`ALTER TABLE "loyalty_ledger" DROP CONSTRAINT IF EXISTS "UQ_loyalty_key"`);
    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_loyalty_ledger_idempotency_active" ON "loyalty_ledger" ("idempotency_key") WHERE "deleted_at" IS NULL`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "UQ_loyalty_ledger_idempotency_active"`);
    await q.query(`DROP INDEX IF EXISTS "UQ_loyalty_visit_active"`);
    await q.query(`DROP INDEX IF EXISTS "IDX_loyalty_visits_user_week"`);
    await q.query(`DROP INDEX IF EXISTS "IDX_loyalty_ledger_user_created"`);
    await q.query(`DROP TABLE IF EXISTS "loyalty_withdrawals"`);
    await q.query(`DROP TYPE IF EXISTS "loyalty_withdrawal_status_enum"`);
  }
}
