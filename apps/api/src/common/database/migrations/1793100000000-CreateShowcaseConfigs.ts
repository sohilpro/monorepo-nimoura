import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShowcaseConfigs1793100000000 implements MigrationInterface {
  name = 'CreateShowcaseConfigs1793100000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE IF NOT EXISTS "showcase_configs" (
      "id" SERIAL NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP WITH TIME ZONE,
      "key" varchar(100) NOT NULL,
      "name" varchar(150) NOT NULL,
      "title" varchar(200),
      "highlight" varchar(200),
      "subtitle" text,
      "badge_text" varchar(100),
      "all_link" varchar(300),
      "variant" varchar(30) NOT NULL DEFAULT 'grid',
      "limit" integer NOT NULL DEFAULT 6,
      "show_header" boolean NOT NULL DEFAULT true,
      "is_active" boolean NOT NULL DEFAULT true,
      "sort_order" integer NOT NULL DEFAULT 0,
      "center_item" jsonb,
      "items" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "metadata" jsonb,
      CONSTRAINT "PK_showcase_configs" PRIMARY KEY ("id")
    )`);

    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_showcase_configs_key" ON "showcase_configs" ("key") WHERE "deleted_at" IS NULL`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS "IDX_showcase_configs_active_sort" ON "showcase_configs" ("is_active", "sort_order")`,
    );
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS "IDX_showcase_configs_active_sort"`);
    await q.query(`DROP INDEX IF EXISTS "UQ_showcase_configs_key"`);
    await q.query(`DROP TABLE IF EXISTS "showcase_configs"`);
  }
}
