// cart-item.entity.ts
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { ProductVariants } from 'src/modules/products/entities/product-variants.entity';

@Entity('cart_item')
export class CartItem extends CustomBaseEntity {
  @Index('idx_cart_item_cart')
  @ManyToOne(() => Cart, (cart) => cart.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'cartId' })
  cart!: Cart;

  @Index('idx_cart_item_product')
  @ManyToOne(() => Products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product!: Products;

  @Index('idx_cart_item_variant')
  @ManyToOne(() => ProductVariants, {
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
