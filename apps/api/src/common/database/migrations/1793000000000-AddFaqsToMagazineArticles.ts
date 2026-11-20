import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFaqsToMagazineArticles1793000000000 implements MigrationInterface {
  name = 'AddFaqsToMagazineArticles1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "magazine_articles" ADD COLUMN IF NOT EXISTS "faqs" jsonb;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "magazine_articles" DROP COLUMN IF EXISTS "faqs";`,
    );
  }
}
