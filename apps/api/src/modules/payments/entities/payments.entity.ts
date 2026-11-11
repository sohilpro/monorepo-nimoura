import { Entity, Column, Index } from 'typeorm';
import { PaymentStatus } from '../enum/status-payment.enum';
import { CustomBaseEntity } from 'src/common/database/base.entity';

@Entity('payments')
export class Payments extends CustomBaseEntity {
  @Index('idx_payments_order')
  @Column()
  orderId!: number;

  @Column()
  amount!: number;

  @Index('idx_payments_authority')
  @Column()
  authority!: string;

  @Column({ nullable: true })
  refId?: string;

  @Index('idx_payments_status')
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.INITIATED,
  })
  status!: PaymentStatus;

  @Column({ nullable: true })
  verifiedAt?: Date;
}
