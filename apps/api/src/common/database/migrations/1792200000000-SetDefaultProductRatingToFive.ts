import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetDefaultProductRatingToFive1792200000000
  implements MigrationInterface
{
  name = 'SetDefaultProductRatingToFive1792200000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "products" ALTER COLUMN "averageRating" SET DEFAULT 5`,
    );

    await q.query(
      `UPDATE "products" SET "averageRating" = 5 WHERE "ratingsCount" = 0 OR "averageRating" <= 0.5`,
    );
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "products" ALTER COLUMN "averageRating" SET DEFAULT 0.5`,
    );
  }
}
