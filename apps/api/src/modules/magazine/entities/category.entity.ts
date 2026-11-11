import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Article } from './articles.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';

@Entity('magazine_categories')
export class Category extends CustomBaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ length: 160, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  @Index('idx_mag_categories_sort')
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle: string;

  @Column({
    name: 'meta_description',
    type: 'varchar',
    length: 320,
    nullable: true,
  })
  metaDescription: string;

  @Index('idx_mag_categories_parent')
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Article, (article) => article.category)
  articles: Article[];
}
