import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { Promotions } from 'src/modules/promotions/entities/promotion.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderItems } from './order-items.entity';
import { PaymentInfo } from './payment-info.entity';
import { ShippingInfo } from './shipping-info.entity';

// برای سازگاری با importهای قبلی (مثلاً ماژول پرداخت) از همین مسیر هم در دسترس است
export { OrderStatus };

@Entity('orders')
export class Orders extends CustomBaseEntity {
  @Index()
  @Column({ nullable: true })
  orderCode!: string;

  /** برای سفارش تلفنیِ ثبت‌شده توسط ادمین ممکن است خالی باشد */
  @ManyToOne(() => Users, { nullable: true })
  user?: Users | null;

  @OneToMany(() => OrderItems, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItems[];

  @OneToOne(() => ShippingInfo, { cascade: true, nullable: true })
  @JoinColumn({ name: 'shippingInfoId' })
  shippingInfo?: ShippingInfo;

  @OneToOne(() => PaymentInfo, { cascade: true, nullable: true })
  @JoinColumn({ name: 'paymentInfoId' })
  paymentInfo?: PaymentInfo;

  @Index()
  @Column({ default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ type: 'varchar', nullable: true })
  paymentRefId?: string | null;

  @Column('int', { default: 0 })
  shippingCost!: number;

  @Column('int')
  subtotal!: number;

  @Column('int', { default: 0 })
  discount!: number;

  @ManyToOne(() => Promotions, { nullable: true })
  promotion?: Promotions;

  @Column('int')
  finalTotal!: number;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  postalBarcode?: string | null;

  // ───── Torob ─────
  /** شناسه کلیک ترب که هنگام ثبت سفارش از کوکی/فرانت گرفته می‌شود */
  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  torobClid?: string | null;

  /** لحظه‌ی اولین تأیید پرداخت (فقط یک بار ست می‌شود). مبنای purchase_timestamp ترب */
  @Column({ type: 'timestamptz', precision: 6, nullable: true })
  purchasedAt?: Date | null;
}