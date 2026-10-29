// cart-item.entity.ts
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { ProductVariants } from 'src/modules/products/entities/product-variants.entity';

@Entity('cart_item')
export class CartItem extends CustomBaseEntity {
  @ManyToOne(() => Cart, (cart) => cart.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'cartId' })
  cart!: Cart;

  @ManyToOne(() => Products, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product!: Products;

  @ManyToOne(() => ProductVariants, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'variantId' })
  variant?: ProductVariants | null;

  @Column('int', { default: 1 })
  quantity!: number;

  // قیمت واحد موثر (اعم از عادی، تخفیف‌دار یا عمده بر اساس پله)
  @Column('int', { default: 0 })
  unitPrice!: number;

  // جمع کل این ردیف: quantity * unitPrice
  @Column('int', { default: 0 })
  totalPrice!: number;
}