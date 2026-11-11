import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Promotions } from './promotion.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';

@Entity('promotio_usages')
@Index('idx_promotion_usages_promo_user', ['promotion', 'user'])
export class PromotionUsages extends CustomBaseEntity {
  @ManyToOne(() => Promotions)
  promotion!: Promotions;

  @ManyToOne(() => Users)
  user!: Users;

  @Column({ default: 0 })
  usedCount!: number;
}
