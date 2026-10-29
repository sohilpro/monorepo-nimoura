import { Column, Entity, ManyToOne } from 'typeorm';
import { Promotions } from './promotion.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';

@Entity('promotio_usages')
export class PromotionUsages extends CustomBaseEntity {
  @ManyToOne(() => Promotions)
  promotion!: Promotions;

  @ManyToOne(() => Users)
  user!: Users;

  @Column({ default: 0 })
  usedCount!: number;
}
