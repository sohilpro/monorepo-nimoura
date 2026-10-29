// src/modules/products/entities/bundle-items.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from './products.entity';
import { ProductVariants } from './product-variants.entity';

@Entity('bundle_items')
export class BundleItems extends CustomBaseEntity {
  // پکی که این آیتم متعلق به آن است
  @ManyToOne(() => Products, (product) => product.bundleItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bundle_id' })
  bundle!: Products;

  // محصول اصلی داخل پک
  @ManyToOne(() => Products, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'product_id' })
  product!: Products;

  // در صورتی که آیتم انتخابی یک واریانت مشخص باشد (اختیاری)
  @ManyToOne(() => ProductVariants, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'variant_id' })
  variant?: ProductVariants;

  // تعداد این آیتم داخل هر پک (مثلاً ۳ عدد چسب قطره‌ای)
  @Column('int', { default: 1 })
  quantity!: number;
}
