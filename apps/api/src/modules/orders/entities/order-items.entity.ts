import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { ProductVariants } from 'src/modules/products/entities/product-variants.entity';
import { Orders } from './orders.entity';

@Entity('order_items')
export class OrderItems extends CustomBaseEntity {
  @Index('idx_order_items_order')
  @ManyToOne(() => Orders, (order) => order.items, { onDelete: 'CASCADE' })
  order!: Orders;

  @Index('idx_order_items_product')
  @ManyToOne(() => Products)
  product!: Products;

  @Index('idx_order_items_variant')
  @ManyToOne(() => ProductVariants, { nullable: true })
  variant?: ProductVariants | null;

  @Column()
  quantity!: number;

  /** قیمت واحد در لحظه‌ی ثبت سفارش (snapshot) */
  @Column('int')
  unitPrice!: number;
}
