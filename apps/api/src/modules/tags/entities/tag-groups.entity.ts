import { Column, Entity, Index, OneToMany } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Tags } from './tags.entity';

/** A family of tags, e.g. "نوع پوست" or "جنس مو". Admins can create any group they need. */
@Entity('tag_groups')
export class TagGroups extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Index('UQ_tag_groups_slug', { unique: true })
  @Column({ type: 'varchar', length: 64 })
  slug!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  icon?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  /** When false the group is only used for labeling and never shown in storefront filters. */
  @Column({ type: 'boolean', default: true })
  isFilterable!: boolean;

  @OneToMany(() => Tags, (tag) => tag.group)
  tags?: Tags[];
}
