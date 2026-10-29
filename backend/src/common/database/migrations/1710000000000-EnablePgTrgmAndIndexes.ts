import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePgTrgmAndIndexes1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ۱. فعال‌سازی اکستنشن ترایگرام
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    // ۲. ایندکس‌های محصولات
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON products USING gin (title gin_trgm_ops);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_products_eng_title_trgm ON products USING gin ("englishTitle" gin_trgm_ops);`,
    );

    // ۳. ایندکس دسته‌بندی‌ها
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_categories_name_trgm ON categories USING gin (name gin_trgm_ops);`,
    );

    // ۴. ایندکس برندها (فارسی و انگلیسی)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_brands_name_trgm ON brands USING gin (name gin_trgm_ops);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_brands_slug_trgm ON brands USING gin (slug gin_trgm_ops);`,
    );

    // ۵. ایندکس ساب‌برندها (Sub-Brands)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_sub_brands_name_trgm ON sub_brands USING gin (name gin_trgm_ops);`,
    );
    // اگر ستون englishName یا slug در sub_brands دارید:
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_sub_brands_slug_trgm ON sub_brands USING gin (slug gin_trgm_ops);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sub_brands_slug_trgm;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sub_brands_name_trgm;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_brands_slug_trgm;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_brands_name_trgm;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_categories_name_trgm;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_eng_title_trgm;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_title_trgm;`);
  }
}