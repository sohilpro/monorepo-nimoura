import { Column, Entity, Index, OneToMany } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Addresses } from '../addresses/entities/addresses.entity';
import { Orders } from 'src/modules/orders/entities/orders.entity';
import { Comments } from 'src/modules/comments/entities/comments.entity';
import { UserRole } from 'src/common/auth/jwt.types';

@Entity('users')
export class Users extends CustomBaseEntity {
  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ nullable: true, unique: true })
  @Index()
  mobile!: string;

  @Column({ type: 'boolean', default: false })
  verify_mobile!: boolean;

  @Column({ nullable: true, unique: true })
  email!: string;

  @Column({ type: 'boolean', default: false })
  verify_email!: boolean;

  @Column({ nullable: true })
  password!: string;

  @Column({ unique: true, nullable: true })
  identity_card!: string;

  @OneToMany(() => Addresses, (address) => address.user)
  addresses!: Addresses[];

  @OneToMany(() => Comments, (comment) => comment.user)
  comments!: Comments[];

  @OneToMany(() => Orders, (order) => order.user)
  orders!: Orders[];
}
