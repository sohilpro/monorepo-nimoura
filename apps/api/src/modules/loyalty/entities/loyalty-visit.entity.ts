import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';

@Entity('loyalty_visits')
@Unique(['userId', 'calendarDate'])
@Index(['userId', 'weekKey'])
export class LoyaltyVisit extends CustomBaseEntity {
  @Column({ name: 'user_id' }) userId!: number;
  @ManyToOne(() => Users, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user!: Users;
  @Column({ name: 'calendar_date', type: 'date' }) calendarDate!: string;
  @Column({ name: 'week_key', length: 20 }) weekKey!: string;
}
