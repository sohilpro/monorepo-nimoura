import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { LoyaltyWithdrawalStatus } from '../enums/loyalty-withdrawal-status.enum';

@Entity('loyalty_withdrawals')
@Index(['userId', 'createdAt'])
export class LoyaltyWithdrawal extends CustomBaseEntity {
  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Users;

  @Column({ type: 'bigint' })
  amount!: number;

  @Column({ name: 'iban', type: 'varchar', length: 34 })
  iban!: string;

  @Column({ name: 'card_number', type: 'varchar', length: 24, nullable: true })
  cardNumber?: string;

  @Column({ name: 'account_holder_name', type: 'varchar', length: 150 })
  accountHolderName!: string;

  @Column({
    type: 'enum',
    enum: LoyaltyWithdrawalStatus,
    default: LoyaltyWithdrawalStatus.PENDING,
  })
  status!: LoyaltyWithdrawalStatus;

  @Column({ name: 'admin_note', type: 'varchar', length: 500, nullable: true })
  adminNote?: string;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt?: Date;

  @Column({ name: 'processed_by_admin_id', type: 'int', nullable: true })
  processedByAdminId?: number;
}
