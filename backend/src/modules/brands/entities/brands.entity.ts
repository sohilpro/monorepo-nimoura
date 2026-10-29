// src/modules/brands/entities/brand.entity.ts
import { Column, Entity, OneToMany, Index } from 'typeorm';
import { SubBrands } from './sub-brands.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from 'src/modules/products/entities/products.entity';

@Entity('brands')
export class Brands extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  slug!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => SubBrands, (subBrand) => subBrand.brand, { cascade: true })
  subBrands!: SubBrands[];

  @OneToMany(() => Products, (product) => product.brand)
  products!: Products[];
}
