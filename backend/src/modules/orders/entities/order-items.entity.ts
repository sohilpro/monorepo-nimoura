import { Column, Entity, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { ProductVariants } from 'src/modules/products/entities/product-variants.entity';
import { Orders } from './orders.entity';

@Entity('order_items')
export class OrderItems extends CustomBaseEntity {
  @ManyToOne(() => Orders, (order) => order.items, { onDelete: 'CASCADE' })
  order!: Orders;

  @ManyToOne(() => Products, { eager: true })
  product!: Products;

  @ManyToOne(() => ProductVariants, { nullable: true, eager: true })
  variant?: ProductVariants | null;

  @Column()
  quantity!: number;

  /** قیمت واحد در لحظه‌ی ثبت سفارش (snapshot) */
  @Column('int')
  unitPrice!: number;
}