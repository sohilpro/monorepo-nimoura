import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { CartItem } from './cart-item.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';

@Entity('cart')
export class Cart extends CustomBaseEntity {
  @Index()
  @Column({ type: 'uuid', nullable: true })
  guestId!: string | null;

  @Index('idx_cart_user')
  @ManyToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user!: Users | null;

  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
  })
  items!: CartItem[];

  @Column({ default: false })
  isPromotional?: boolean;
}
