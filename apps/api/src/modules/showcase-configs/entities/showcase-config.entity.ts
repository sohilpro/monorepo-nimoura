import { Column, Entity, Index } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';

/**
 * تنظیمات ویترین دستهبندیها که از پنل ادمین مدیریت میشود.
 * هر ردیف با کلید منحصربهفرد خود قابل استفاده در هر بخش از سایت است
 * (مثلاً home-grid، home-circle، category-sidebar و ...).
 */
@Entity('showcase_configs')
export class ShowcaseConfig extends CustomBaseEntity {
  @Index({ unique: true })
  @Column({ length: 100 })
  key!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  highlight?: string | null;

  @Column({ type: 'text', nullable: true })
  subtitle?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  badgeText?: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  allLink?: string | null;

  @Column({ length: 30, default: 'grid' })
  variant!: string;

  @Column({ type: 'int', default: 6 })
  limit!: number;

  @Column({ name: 'show_header', default: true })
  showHeader!: boolean;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  /** آیتم مرکز ویترین دایرهای */
  @Column({ name: 'center_item', type: 'jsonb', nullable: true })
  centerItem?: Record<string, any> | null;

  /** آیتمهای حلقه/گرید به ترتیب نمایش */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  items!: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;
}
