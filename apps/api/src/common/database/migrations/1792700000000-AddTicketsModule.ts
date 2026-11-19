import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTicketsModule1792700000000 implements MigrationInterface {
  name = 'AddTicketsModule1792700000000';

  async up(q: QueryRunner): Promise<void> {
    // 1. Create Enums
    await q.query(`DO $$ BEGIN
      CREATE TYPE "ticket_department_enum" AS ENUM ('technical', 'financial', 'orders', 'sales', 'general');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    await q.query(`DO $$ BEGIN
      CREATE TYPE "ticket_priority_enum" AS ENUM ('low', 'medium', 'high', 'urgent');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    await q.query(`DO $$ BEGIN
      CREATE TYPE "ticket_status_enum" AS ENUM ('open', 'in_progress', 'waiting_user', 'resolved', 'closed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    await q.query(`DO $$ BEGIN
      CREATE TYPE "ticket_sender_role_enum" AS ENUM ('user', 'admin');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    // 2. Create tickets table
    await q.query(`CREATE TABLE IF NOT EXISTS "tickets" (
      "id" SERIAL NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP WITH TIME ZONE,
      "tracking_code" varchar(32) NOT NULL,
      "user_id" integer NOT NULL,
      "order_id" integer,
      "title" varchar(255) NOT NULL,
      "department" "ticket_department_enum" NOT NULL DEFAULT 'general',
      "priority" "ticket_priority_enum" NOT NULL DEFAULT 'medium',
      "status" "ticket_status_enum" NOT NULL DEFAULT 'open',
      "last_reply_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "last_reply_by" varchar(20) NOT NULL DEFAULT 'user',
      "unread_user_count" integer NOT NULL DEFAULT 0,
      "unread_admin_count" integer NOT NULL DEFAULT 1,
      CONSTRAINT "PK_tickets" PRIMARY KEY ("id")
    )`);

    await q.query(`ALTER TABLE "tickets" DROP CONSTRAINT IF EXISTS "FK_tickets_user"`);
    await q.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_tickets_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`);

    await q.query(`ALTER TABLE "tickets" DROP CONSTRAINT IF EXISTS "FK_tickets_order"`);
    await q.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_tickets_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL`);

    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_tickets_tracking_code" ON "tickets" ("tracking_code") WHERE "deleted_at" IS NULL`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_tickets_user_id" ON "tickets" ("user_id")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_tickets_order_id" ON "tickets" ("order_id")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_tickets_status" ON "tickets" ("status")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_tickets_department" ON "tickets" ("department")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_tickets_last_reply_at" ON "tickets" ("last_reply_at" DESC)`);

    // 3. Create ticket_messages table
    await q.query(`CREATE TABLE IF NOT EXISTS "ticket_messages" (
      "id" SERIAL NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "ticket_id" integer NOT NULL,
      "sender_id" integer NOT NULL,
      "sender_role" "ticket_sender_role_enum" NOT NULL DEFAULT 'user',
      "message" text NOT NULL,
      "attachments" jsonb,
      "is_internal_note" boolean NOT NULL DEFAULT false,
      CONSTRAINT "PK_ticket_messages" PRIMARY KEY ("id")
    )`);

    await q.query(`ALTER TABLE "ticket_messages" DROP CONSTRAINT IF EXISTS "FK_ticket_messages_ticket"`);
    await q.query(`ALTER TABLE "ticket_messages" ADD CONSTRAINT "FK_ticket_messages_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE`);

    await q.query(`ALTER TABLE "ticket_messages" DROP CONSTRAINT IF EXISTS "FK_ticket_messages_sender"`);
    await q.query(`ALTER TABLE "ticket_messages" ADD CONSTRAINT "FK_ticket_messages_sender" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL`);

    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_ticket_messages_ticket_id" ON "ticket_messages" ("ticket_id")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_ticket_messages_sender_id" ON "ticket_messages" ("sender_id")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_ticket_messages_created_at" ON "ticket_messages" ("created_at" ASC)`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "ticket_messages"`);
    await q.query(`DROP TABLE IF EXISTS "tickets"`);
    await q.query(`DROP TYPE IF EXISTS "ticket_sender_role_enum"`);
    await q.query(`DROP TYPE IF EXISTS "ticket_status_enum"`);
    await q.query(`DROP TYPE IF EXISTS "ticket_priority_enum"`);
    await q.query(`DROP TYPE IF EXISTS "ticket_department_enum"`);
  }
}
