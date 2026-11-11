// src/modules/brands/entities/sub-brand.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Brands } from './brands.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';

@Entity('sub_brands')
export class SubBrands extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  slug!: string;

  @Index('idx_sub_brands_brand')
  @Column({ type: 'int' })
  brandId!: number;

  @ManyToOne(() => Brands, (brand) => brand.subBrands, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brandId' })
  brand!: Brands;

  @OneToMany(() => Products, (product) => product.subBrand)
  products!: Products[];
}
