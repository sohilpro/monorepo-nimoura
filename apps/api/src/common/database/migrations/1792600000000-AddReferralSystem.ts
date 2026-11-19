import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReferralSystem1792600000000 implements MigrationInterface {
  name = 'AddReferralSystem1792600000000';

  async up(q: QueryRunner): Promise<void> {
    // 1. Add REFERRAL_REWARD to loyalty_ledger_type_enum
    await q.query(`ALTER TYPE "loyalty_ledger_type_enum" ADD VALUE IF NOT EXISTS 'REFERRAL_REWARD'`);

    // 2. Create referral_status_enum
    await q.query(`DO $$ BEGIN
      CREATE TYPE "referral_status_enum" AS ENUM ('PENDING', 'COMPLETED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    // 3. Add referral columns to users table
    await q.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_code" varchar(32)`);
    await q.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referred_by_id" integer`);
    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_referral_code" ON "users" ("referral_code") WHERE "deleted_at" IS NULL`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_users_referred_by" ON "users" ("referred_by_id")`);

    // 4. Add referral settings to loyalty_settings table
    await q.query(`ALTER TABLE "loyalty_settings" ADD COLUMN IF NOT EXISTS "referral_enabled" boolean NOT NULL DEFAULT true`);
    await q.query(`ALTER TABLE "loyalty_settings" ADD COLUMN IF NOT EXISTS "referral_reward_amount" bigint NOT NULL DEFAULT 50000`);
    await q.query(`ALTER TABLE "loyalty_settings" ADD COLUMN IF NOT EXISTS "referral_discount_amount" bigint NOT NULL DEFAULT 50000`);
    await q.query(`ALTER TABLE "loyalty_settings" ADD COLUMN IF NOT EXISTS "referral_min_order" bigint NOT NULL DEFAULT 150000`);

    // 5. Create referrals table
    await q.query(`CREATE TABLE IF NOT EXISTS "referrals" (
      "id" SERIAL NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP WITH TIME ZONE,
      "referrer_id" integer NOT NULL,
      "referred_user_id" integer NOT NULL,
      "referral_code" varchar(32) NOT NULL,
      "discount_code" varchar(64),
      "promotion_id" integer,
      "order_id" integer,
      "status" "referral_status_enum" NOT NULL DEFAULT 'PENDING',
      "reward_amount" bigint NOT NULL DEFAULT 50000,
      "discount_amount" bigint NOT NULL DEFAULT 50000,
      "completed_at" TIMESTAMP WITH TIME ZONE,
      CONSTRAINT "PK_referrals" PRIMARY KEY ("id")
    )`);

    await q.query(`ALTER TABLE "referrals" DROP CONSTRAINT IF EXISTS "FK_referrals_referrer"`);
    await q.query(`ALTER TABLE "referrals" ADD CONSTRAINT "FK_referrals_referrer" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE`);

    await q.query(`ALTER TABLE "referrals" DROP CONSTRAINT IF EXISTS "FK_referrals_referred"`);
    await q.query(`ALTER TABLE "referrals" ADD CONSTRAINT "FK_referrals_referred" FOREIGN KEY ("referred_user_id") REFERENCES "users"("id") ON DELETE CASCADE`);

    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_referrals_referrer_created" ON "referrals" ("referrer_id", "created_at")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_referrals_referred_status" ON "referrals" ("referred_user_id", "status")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_referrals_code" ON "referrals" ("referral_code")`);

    // 6. Ensure promotions_allowed_users_users join table exists
    await q.query(`CREATE TABLE IF NOT EXISTS "promotions_allowed_users_users" (
      "promotionsId" integer NOT NULL,
      "usersId" integer NOT NULL,
      CONSTRAINT "PK_promotions_allowed_users_users" PRIMARY KEY ("promotionsId", "usersId"),
      CONSTRAINT "FK_promotions_allowed_users_promotions" FOREIGN KEY ("promotionsId") REFERENCES "promotions"("id") ON DELETE CASCADE,
      CONSTRAINT "FK_promotions_allowed_users_users" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE
    )`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "referrals"`);
    await q.query(`DROP TYPE IF EXISTS "referral_status_enum"`);
    await q.query(`ALTER TABLE "loyalty_settings" DROP COLUMN IF EXISTS "referral_min_order"`);
    await q.query(`ALTER TABLE "loyalty_settings" DROP COLUMN IF EXISTS "referral_discount_amount"`);
    await q.query(`ALTER TABLE "loyalty_settings" DROP COLUMN IF EXISTS "referral_reward_amount"`);
    await q.query(`ALTER TABLE "loyalty_settings" DROP COLUMN IF EXISTS "referral_enabled"`);
    await q.query(`DROP INDEX IF EXISTS "IDX_users_referred_by"`);
    await q.query(`DROP INDEX IF EXISTS "UQ_users_referral_code"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "referred_by_id"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "referral_code"`);
  }
}
