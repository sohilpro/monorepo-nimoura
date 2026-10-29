import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('otp')
export class OtpEntity extends CustomBaseEntity {
  @Column({ length: 6 })
  code!: string;

  @Column({ type: 'timestamp with time zone' })
  expires!: Date;

  @Index()
  @Column({ type: 'varchar', length: 150 })
  username!: string;
}
