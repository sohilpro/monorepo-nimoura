// product-price-tiers.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index, Check } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from './products.entity';
import { ProductVariants } from './product-variants.entity';

@Entity('product_price_tiers')
@Check(
  `("productId" IS NOT NULL AND "variantId" IS NULL) OR ("productId" IS NULL AND "variantId" IS NOT NULL)`,
)
@Index('uq_tier_product_qty', ['product', 'minQuantity'], {
  unique: true,
  where: '"productId" IS NOT NULL',
})
@Index('uq_tier_variant_qty', ['variant', 'minQuantity'], {
  unique: true,
  where: '"variantId" IS NOT NULL',
})
export class ProductPriceTiers extends CustomBaseEntity {
  @ManyToOne(() => Products, (p) => p.priceTiers, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product?: Products | null;

  @ManyToOne(() => ProductVariants, (v) => v.priceTiers, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variantId' })
  variant?: ProductVariants | null;

  @Column('int')
  minQuantity!: number; // مثلا 6 یا 12

  @Column('int')
  price!: number; // قیمت واحد نهایی در این پله
}
