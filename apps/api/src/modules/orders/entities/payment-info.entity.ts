import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { PaymentMethod } from '../enums/payment-method.enum';

@Entity('payment_info')
export class PaymentInfo extends CustomBaseEntity {
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.ZARINPAL,
  })
  method!: PaymentMethod;

  @Column({ type: 'varchar', nullable: true })
  trackingCode?: string | null;

  @Column({ default: false })
  isPaid!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date | null;
}
