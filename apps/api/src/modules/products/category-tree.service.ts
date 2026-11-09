import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CategoryTreeService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** The category itself plus all of its descendants. */
  async getTreeIds(categoryId: number): Promise<number[]> {
    const rows: { id: number }[] = await this.dataSource.query(
      `WITH RECURSIVE cat_tree AS (
         SELECT id FROM categories WHERE id = $1
         UNION ALL
         SELECT c.id FROM categories c INNER JOIN cat_tree ct ON c."parentId" = ct.id
       )
       SELECT id FROM cat_tree`,
      [categoryId],
    );
    return rows.map((r) => Number(r.id));
  }
}
