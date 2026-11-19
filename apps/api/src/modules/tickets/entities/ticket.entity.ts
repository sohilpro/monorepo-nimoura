import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { Orders } from 'src/modules/orders/entities/orders.entity';
import { TicketStatus } from '../enums/ticket-status.enum';
import { TicketPriority } from '../enums/ticket-priority.enum';
import { TicketDepartment } from '../enums/ticket-department.enum';
import { TicketSenderRole } from '../enums/ticket-sender-role.enum';
import { TicketMessage } from './ticket-message.entity';

@Entity('tickets')
export class Ticket extends CustomBaseEntity {
  @Column({ name: 'tracking_code', unique: true, length: 32 })
  @Index()
  trackingCode!: string;

  @Column({ name: 'user_id' })
  @Index()
  userId!: number;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Users;

  @Column({ name: 'order_id', nullable: true })
  @Index()
  orderId?: number | null;

  @ManyToOne(() => Orders, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'order_id' })
  order?: Orders | null;

  @Column({ length: 255 })
  title!: string;

  @Column({
    type: 'enum',
    enum: TicketDepartment,
    default: TicketDepartment.GENERAL,
  })
  @Index()
  department!: TicketDepartment;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority!: TicketPriority;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  @Index()
  status!: TicketStatus;

  @Column({
    name: 'last_reply_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Index()
  lastReplyAt!: Date;

  @Column({
    name: 'last_reply_by',
    type: 'varchar',
    length: 20,
    default: TicketSenderRole.USER,
  })
  lastReplyBy!: string;

  @Column({ name: 'unread_user_count', type: 'int', default: 0 })
  unreadUserCount!: number;

  @Column({ name: 'unread_admin_count', type: 'int', default: 1 })
  unreadAdminCount!: number;

  @OneToMany(() => TicketMessage, (message) => message.ticket, {
    cascade: true,
  })
  messages!: TicketMessage[];
}
