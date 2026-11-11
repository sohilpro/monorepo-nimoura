// src/modules/products/entities/bundle-items.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from './products.entity';
import { ProductVariants } from './product-variants.entity';

@Entity('bundle_items')
export class BundleItems extends CustomBaseEntity {
  // پکی که این آیتم متعلق به آن است
  @Index('idx_bundle_items_bundle')
  @ManyToOne(() => Products, (product) => product.bundleItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bundle_id' })
  bundle!: Products;

  // محصول اصلی داخل پک
  @Index('idx_bundle_items_product')
  @ManyToOne(() => Products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Products;

  // در صورتی که آیتم انتخابی یک واریانت مشخص باشد (اختیاری)
  @Index('idx_bundle_items_variant')
  @ManyToOne(() => ProductVariants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'variant_id' })
  variant?: ProductVariants;

  // تعداد این آیتم داخل هر پک (مثلاً ۳ عدد چسب قطره‌ای)
  @Column('int', { default: 1 })
  quantity!: number;
}
