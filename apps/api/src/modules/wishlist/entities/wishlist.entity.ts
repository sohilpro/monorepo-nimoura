import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { Entity, Index, ManyToOne, Unique } from 'typeorm';

@Entity('wishlist')
@Unique(['user', 'product']) // یک کاربر نمی‌تونه یک محصول رو دوبار به علاقه‌مندی اضافه کنه
@Index('idx_wishlist_user_created', ['user', 'createdAt'])
export class Wishlist extends CustomBaseEntity {
  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  user!: Users;

  @Index('idx_wishlist_product')
  @ManyToOne(() => Products, { onDelete: 'CASCADE' })
  product!: Products;
}
