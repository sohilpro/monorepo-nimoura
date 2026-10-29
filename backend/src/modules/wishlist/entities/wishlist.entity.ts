import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import {
  Entity,
  ManyToOne,
  Unique,
} from 'typeorm';

@Entity('wishlist')
@Unique(['user', 'product']) // یک کاربر نمی‌تونه یک محصول رو دوبار به علاقه‌مندی اضافه کنه
export class Wishlist extends CustomBaseEntity {
  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  user!: Users;

  @ManyToOne(() => Products, { eager: true, onDelete: 'CASCADE' })
  product!: Products;
}
