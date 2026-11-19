import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNewsletterTable1792800000000 implements MigrationInterface {
  name = 'CreateNewsletterTable1792800000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE IF NOT EXISTS "newsletter" (
      "id" SERIAL NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP WITH TIME ZONE,
      "email" varchar(150),
      "mobile" varchar(20),
      "name" varchar(100),
      "is_active" boolean NOT NULL DEFAULT true,
      "source" varchar(50) NOT NULL DEFAULT 'footer',
      "last_notified_at" TIMESTAMP WITH TIME ZONE,
      "campaign_count" integer NOT NULL DEFAULT 0,
      CONSTRAINT "PK_newsletter" PRIMARY KEY ("id")
    )`);

    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_newsletter_email" ON "newsletter" ("email") WHERE "deleted_at" IS NULL AND "email" IS NOT NULL`);
    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_newsletter_mobile" ON "newsletter" ("mobile") WHERE "deleted_at" IS NULL AND "mobile" IS NOT NULL`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_newsletter_active_created" ON "newsletter" ("is_active", "created_at")`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "IDX_newsletter_active_created"`);
    await q.query(`DROP INDEX IF EXISTS "UQ_newsletter_mobile"`);
    await q.query(`DROP INDEX IF EXISTS "UQ_newsletter_email"`);
    await q.query(`DROP TABLE IF EXISTS "newsletter"`);
  }
}
