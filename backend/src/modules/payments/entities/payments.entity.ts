import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentStatus } from '../enum/status-payment.enum';
import { CustomBaseEntity } from 'src/common/database/base.entity';

@Entity('payments')
export class Payments extends CustomBaseEntity {
  @Column()
  orderId!: number;

  @Column()
  amount!: number;

  @Column()
  authority!: string;

  @Column({ nullable: true })
  refId?: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.INITIATED,
  })
  status!: PaymentStatus;

  @Column({ nullable: true })
  verifiedAt?: Date;
}
