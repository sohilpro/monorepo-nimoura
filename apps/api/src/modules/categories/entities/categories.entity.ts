import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { Entity, Column, OneToMany, ManyToOne, Index } from 'typeorm';

@Entity('categories')
export class Categories extends CustomBaseEntity {
  @Column()
  name!: string;

  @Index()
  @Column({ nullable: true })
  slug!: string;

  @Index('idx_categories_parent')
  @ManyToOne(() => Categories, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent!: Categories | null;

  @OneToMany(() => Categories, (category) => category.parent)
  children!: Categories[];

  @OneToMany(() => Products, (product) => product.category)
  products!: Products[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  seoTitle?: string | null;

  @Column({ type: 'text', nullable: true })
  seoDescription?: string | null;

  @Column({ type: 'text', nullable: true })
  seoText?: string | null;
}
