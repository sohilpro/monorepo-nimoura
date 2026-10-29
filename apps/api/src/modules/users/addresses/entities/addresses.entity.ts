import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '../../entities/users.entity';

@Entity('addresses')
export class Addresses extends CustomBaseEntity {
  @Column({ length: 100 })
  title!: string;

  @Column({ length: 10 })
  postal_code!: string;

  @Column({ length: 100 })
  state!: string;

  @Column({ length: 100 })
  city!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column()
  userId!: number;

  @ManyToOne(() => Users, (user) => user.addresses, {
    onDelete: 'CASCADE',
  })
  user!: Users;
}
