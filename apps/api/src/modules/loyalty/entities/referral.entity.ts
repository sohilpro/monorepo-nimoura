import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { ReferralStatus } from '../enums/referral-status.enum';

@Entity('referrals')
@Index(['referrerId', 'createdAt'])
@Index(['referredUserId', 'status'])
export class Referral extends CustomBaseEntity {
  @Column({ name: 'referrer_id' })
  referrerId!: number;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referrer_id' })
  referrer!: Users;

  @Column({ name: 'referred_user_id' })
  referredUserId!: number;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referred_user_id' })
  referredUser!: Users;

  @Column({ name: 'referral_code', length: 32 })
  @Index()
  referralCode!: string;

  @Column({ name: 'discount_code', length: 64, nullable: true })
  discountCode?: string;

  @Column({ name: 'promotion_id', nullable: true })
  promotionId?: number;

  @Column({ name: 'order_id', nullable: true })
  orderId?: number;

  @Column({
    type: 'enum',
    enum: ReferralStatus,
    default: ReferralStatus.PENDING,
  })
  status!: ReferralStatus;

  @Column({ name: 'reward_amount', type: 'bigint', default: 50000 })
  rewardAmount!: number;

  @Column({ name: 'discount_amount', type: 'bigint', default: 50000 })
  discountAmount!: number;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;
}
