import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExploreModule1792900000000 implements MigrationInterface {
  name = 'AddExploreModule1792900000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE IF NOT EXISTS "explore_videos" (
      "id" SERIAL NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP WITH TIME ZONE,
      "title" varchar(255) NOT NULL,
      "description" text,
      "video_url" varchar(500) NOT NULL,
      "poster_url" varchar(500) NOT NULL DEFAULT '',
      "likes_count" integer NOT NULL DEFAULT 0,
      "comments_count" integer NOT NULL DEFAULT 0,
      "views_count" integer NOT NULL DEFAULT 0,
      "is_active" boolean NOT NULL DEFAULT true,
      "sort_order" integer NOT NULL DEFAULT 0,
      "product_id" integer,
      "category_id" integer,
      CONSTRAINT "PK_explore_videos" PRIMARY KEY ("id"),
      CONSTRAINT "FK_explore_videos_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL,
      CONSTRAINT "FK_explore_videos_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL
    )`);

    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_explore_videos_active" ON "explore_videos" ("is_active", "sort_order", "id")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_explore_videos_category" ON "explore_videos" ("category_id")`);

    await q.query(`CREATE TABLE IF NOT EXISTS "explore_video_comments" (
      "id" SERIAL NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP WITH TIME ZONE,
      "text" text NOT NULL,
      "is_approved" boolean NOT NULL DEFAULT true,
      "video_id" integer NOT NULL,
      "user_id" integer NOT NULL,
      CONSTRAINT "PK_explore_video_comments" PRIMARY KEY ("id"),
      CONSTRAINT "FK_explore_video_comments_video" FOREIGN KEY ("video_id") REFERENCES "explore_videos"("id") ON DELETE CASCADE,
      CONSTRAINT "FK_explore_video_comments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    )`);

    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_explore_video_comments_video" ON "explore_video_comments" ("video_id", "is_approved", "id")`);

    await q.query(`CREATE TABLE IF NOT EXISTS "explore_video_likes" (
      "id" SERIAL NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP WITH TIME ZONE,
      "ip" varchar(50),
      "video_id" integer NOT NULL,
      "user_id" integer,
      CONSTRAINT "PK_explore_video_likes" PRIMARY KEY ("id"),
      CONSTRAINT "FK_explore_video_likes_video" FOREIGN KEY ("video_id") REFERENCES "explore_videos"("id") ON DELETE CASCADE,
      CONSTRAINT "FK_explore_video_likes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    )`);

    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_explore_video_likes_video_user" ON "explore_video_likes" ("video_id", "user_id")`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "explore_video_likes"`);
    await q.query(`DROP TABLE IF EXISTS "explore_video_comments"`);
    await q.query(`DROP TABLE IF EXISTS "explore_videos"`);
  }
}
