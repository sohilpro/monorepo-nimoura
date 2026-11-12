import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { ProductImages } from './product-images.entity';
import { ProductVariants } from './product-variants.entity';
import { Brands } from 'src/modules/brands/entities/brands.entity';
import { SubBrands } from 'src/modules/brands/entities/sub-brands.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Categories } from 'src/modules/categories/entities/categories.entity';
import { Comments } from 'src/modules/comments/entities/comments.entity';
import { Tags } from 'src/modules/tags/entities/tags.entity';
import { BundleItems } from './bundle-items.entity';
import { ProductPriceTiers } from './product-price-tiers.entity';

@Entity('products')
@Index('idx_products_avail_created', ['isAvailable', 'createdAt'])
@Index('idx_products_avail_price', ['isAvailable', 'price'])
@Index('idx_products_avail_rating', ['isAvailable', 'averageRating'])
@Index('idx_products_avail_amazing', ['isAvailable', 'isAmazingOffer'])
export class Products extends CustomBaseEntity {
  @Index('idx_products_category')
  @ManyToOne(() => Categories, (category) => category.products)
  category!: Categories;

  @Index('idx_products_brand')
  @ManyToOne(() => Brands, (brand) => brand.products)
  brand!: Brands;

  @Index('idx_products_sub_brand')
  @ManyToOne(() => SubBrands, (subBrand) => subBrand.products)
  subBrand?: SubBrands;

  @Column()
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  englishTitle!: string;

  @Index('idx_products_average_rating')
  @Column('float', { default: 5 })
  averageRating!: number;

  @Column('int', { default: 0 })
  recommendUp!: number;
  @Column('int', { default: 0 })
  recommendDown!: number;
  @Column('int', { default: 0 })
  ratingsCount!: number;
  @Column('int', { default: 0 })
  ratingsSum!: number;

  @Index()
  @Column({ default: true })
  isAvailable!: boolean;

  @Index()
  @Column('int')
  price!: number;

  @Column('int', { default: 0 })
  priceDiscount!: number;

  @Column('float', { default: 0 })
  percentageDiscount!: number;

  @Column('text')
  shortDescription!: string;

  @Column('jsonb')
  specifications!: { key: string; value: string }[];

  @Column({ type: 'varchar', nullable: true })
  thumbnail!: string | null;

  @OneToMany(() => ProductImages, (image) => image.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  images!: ProductImages[];

  @Column('text')
  introduce!: string;

  @Column('text')
  howToUse!: string;

  @OneToMany(() => Comments, (comment) => comment.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  comments!: Comments[];

  @Column({ unique: true })
  sku!: string;

  @Index('idx_products_type')
  @Column({
    type: 'enum',
    enum: ['simple', 'variant', 'bundle'],
    default: 'simple',
  })
  type!: 'simple' | 'variant' | 'bundle';

  @OneToMany(() => BundleItems, (item) => item.bundle, {
    cascade: true,
  })
  bundleItems?: BundleItems[];

  @OneToMany(() => ProductVariants, (variant) => variant.product, {
    cascade: true,
  })
  variants?: ProductVariants[];

  @Index('idx_products_stock')
  @Column('int', { default: 0 })
  stock!: number;

  /** Storefront shows "only N left" once stock drops to this number (0 disables the badge). */
  @Column({ type: 'int', default: 5 })
  lowStockThreshold!: number;

  @ManyToMany(() => Tags, {
    eager: false,
    cascade: false,
  })
  @JoinTable({
    name: 'product_tag',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags?: Tags[];

  @Index()
  @Column({ default: false })
  isAmazingOffer?: boolean;

  @OneToMany(() => ProductPriceTiers, (t) => t.product, { cascade: true })
  priceTiers?: ProductPriceTiers[];
}
