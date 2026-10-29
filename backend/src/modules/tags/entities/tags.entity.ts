import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Entity('tags')
@Unique(['type', 'value'])
export class Tags extends CustomBaseEntity {
  @Index()
  @Column({ length: 64 })
  type!: string;

  @Index()
  @Column({ length: 128 })
  value!: string;
}
