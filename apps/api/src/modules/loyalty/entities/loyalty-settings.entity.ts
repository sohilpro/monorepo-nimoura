import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';

@Entity('loyalty_settings')
export class LoyaltySettings extends CustomBaseEntity {
  @Column({ default: true }) enabled!: boolean;
  @Column({ name: 'weekly_reward', type: 'bigint', default: 15000 }) weeklyReward!: number;
  @Column({ name: 'cashback_min_order', type: 'bigint', default: 2000000 }) cashbackMinOrder!: number;
  @Column({ name: 'cashback_amount', type: 'bigint', default: 100000 }) cashbackAmount!: number;
  @Column({ name: 'cashback_enabled', default: true }) cashbackEnabled!: boolean;
  @Column({ name: 'auto_redeem', default: true }) autoRedeem!: boolean;
}
