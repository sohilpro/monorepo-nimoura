import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
  OneToMany,
} from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from './products.entity';
import { AttributeValues } from './attribute-values.entity';
import { ProductPriceTiers } from './product-price-tiers.entity';

@Entity('product_variants')
export class ProductVariants extends CustomBaseEntity {
  @ManyToOne(() => Products, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  product!: Products;

  @Index()
  @Column({ unique: true })
  sku!: string; // کد انبارداری منحصر به فرد هر واریانت

  @Column('int')
  price!: number; // قیمت اصلی

  @Column('int', { default: 0 })
  priceDiscount!: number; // قیمت با تخفیف

  @Column('float', { default: 0 })
  percentageDiscount!: number; // درصد تخفیف

  @Column('int', { default: 0 })
  stock!: number; // موجودی انبار

  @Column({ default: true })
  isAvailable!: boolean; // وضعیت فعال/غیرفعال

  @Column('jsonb', { default: () => "'[]'" })
  images!: string[]; // تصویر اختصاصی این واریانت

  // رابطه چند به چند با مقادیر ویژگی‌ها (مثلاً اتصال همزمان به "500ml" و "شفاف")
  @ManyToMany(
    () => AttributeValues,
    (attributeValue) => attributeValue.variants,
    {
      eager: true,
    },
  )
  @JoinTable({
    name: 'variant_attribute_values',
    joinColumn: { name: 'variant_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'attribute_value_id',
      referencedColumnName: 'id',
    },
  })
  attributeValues!: AttributeValues[];

  @OneToMany(() => ProductPriceTiers, (t) => t.variant, { cascade: true })
  priceTiers?: ProductPriceTiers[];
}
