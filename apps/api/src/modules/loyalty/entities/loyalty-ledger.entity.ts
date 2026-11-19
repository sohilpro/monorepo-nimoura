import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { LoyaltyLedgerType } from '../enums/loyalty-ledger-type.enum';

@Entity('loyalty_ledger')
@Index(['userId', 'createdAt'])
export class LoyaltyLedger extends CustomBaseEntity {
  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Users;

  @Column({ type: 'bigint' })
  amount!: number;

  @Column({ type: 'enum', enum: LoyaltyLedgerType })
  type!: LoyaltyLedgerType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ name: 'order_id', nullable: true })
  orderId?: number;

  @Column({ name: 'idempotency_key', length: 180 })
  idempotencyKey!: string;
}
