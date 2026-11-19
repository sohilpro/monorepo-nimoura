import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoyaltyModule1792400000000 implements MigrationInterface {
  name = 'AddLoyaltyModule1792400000000';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TYPE "loyalty_ledger_type_enum" AS ENUM ('WEEKLY_VISIT_REWARD','CASHBACK','ORDER_REDEMPTION','MANUAL_ADJUSTMENT')`);
    await q.query(`CREATE TABLE "loyalty_settings" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "enabled" boolean NOT NULL DEFAULT true, "weekly_reward" bigint NOT NULL DEFAULT 15000, "cashback_min_order" bigint NOT NULL DEFAULT 2000000, "cashback_amount" bigint NOT NULL DEFAULT 100000, "cashback_enabled" boolean NOT NULL DEFAULT true, "auto_redeem" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_loyalty_settings" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "loyalty_visits" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "user_id" integer NOT NULL, "calendar_date" date NOT NULL, "week_key" varchar(20) NOT NULL, CONSTRAINT "UQ_loyalty_visit" UNIQUE ("user_id","calendar_date"), CONSTRAINT "PK_loyalty_visits" PRIMARY KEY ("id"))`);
    await q.query(`CREATE TABLE "loyalty_ledger" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "user_id" integer NOT NULL, "amount" bigint NOT NULL, "type" "loyalty_ledger_type_enum" NOT NULL, "description" varchar(500), "order_id" integer, "idempotency_key" varchar(180) NOT NULL, CONSTRAINT "UQ_loyalty_key" UNIQUE ("idempotency_key"), CONSTRAINT "PK_loyalty_ledger" PRIMARY KEY ("id"))`);
    await q.query(`ALTER TABLE "loyalty_visits" ADD CONSTRAINT "FK_loyalty_visits_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`);
    await q.query(`ALTER TABLE "loyalty_ledger" ADD CONSTRAINT "FK_loyalty_ledger_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`);
  }
  async down(q: QueryRunner): Promise<void> { await q.query(`DROP TABLE "loyalty_ledger"`); await q.query(`DROP TABLE "loyalty_visits"`); await q.query(`DROP TABLE "loyalty_settings"`); await q.query(`DROP TYPE "loyalty_ledger_type_enum"`); }
}
