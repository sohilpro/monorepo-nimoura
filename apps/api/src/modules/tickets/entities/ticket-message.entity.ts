import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { TicketSenderRole } from '../enums/ticket-sender-role.enum';

export interface TicketAttachmentItem {
  url: string;
  name: string;
  size?: number;
  type?: string;
}

@Entity('ticket_messages')
export class TicketMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'ticket_id' })
  @Index()
  ticketId!: number;

  @ManyToOne(() => Ticket, (ticket) => ticket.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: Ticket;

  @Column({ name: 'sender_id' })
  @Index()
  senderId!: number;

  @ManyToOne(() => Users, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'sender_id' })
  sender?: Users;

  @Column({
    name: 'sender_role',
    type: 'enum',
    enum: TicketSenderRole,
    default: TicketSenderRole.USER,
  })
  senderRole!: TicketSenderRole;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: TicketAttachmentItem[];

  @Column({ name: 'is_internal_note', type: 'boolean', default: false })
  isInternalNote!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
