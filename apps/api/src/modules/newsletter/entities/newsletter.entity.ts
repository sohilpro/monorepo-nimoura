import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('newsletter')
@Index(['email'], {
  unique: true,
  where: 'deleted_at IS NULL AND email IS NOT NULL',
})
@Index(['mobile'], {
  unique: true,
  where: 'deleted_at IS NULL AND mobile IS NOT NULL',
})
@Index(['isActive', 'createdAt'])
export class Newsletter extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobile?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 50, default: 'footer' })
  source!: string;

  @Column({ name: 'last_notified_at', type: 'timestamptz', nullable: true })
  lastNotifiedAt?: Date | null;

  @Column({ name: 'campaign_count', type: 'int', default: 0 })
  campaignCount!: number;
}
