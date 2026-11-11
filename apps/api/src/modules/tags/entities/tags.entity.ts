import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { TagGroups } from './tag-groups.entity';

@Entity('tags')
@Unique('UQ_tags_group_slug', ['groupId', 'slug'])
@Unique('UQ_tags_group_name', ['groupId', 'name'])
export class Tags extends CustomBaseEntity {
  @Index('IDX_tags_group')
  @Column({ type: 'int' })
  groupId!: number;

  @ManyToOne(() => TagGroups, (group) => group.tags, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'groupId' })
  group!: TagGroups;

  @Index()
  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'varchar', length: 160 })
  slug!: string;

  /** Optional accent color (#RRGGBB) used for badges in the storefront. */
  @Column({ type: 'varchar', length: 7, nullable: true })
  color?: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
