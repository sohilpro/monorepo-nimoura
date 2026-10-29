import { Entity, Column, OneToMany, Index } from 'typeorm';
import { Banner } from './banner.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';

/**
 * "جایگاه" نمایش بنر - مفهومی مستقل از پروژه.
 * مثال: home-hero-slider, checkout-sidebar, blog-inline, app-splash
 * همین جدا بودن Position از Banner باعث می‌شود این ماژول در هر پروژه‌ای
 * با هر تعداد جایگاه دلخواه قابل استفاده مجدد باشد.
 */
@Entity('banner_positions')
export class BannerPosition extends CustomBaseEntity {
  @Index({ unique: true })
  @Column({ length: 100 })
  key: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'recommended_width', type: 'int', nullable: true })
  recommendedWidth?: number;

  @Column({ name: 'recommended_height', type: 'int', nullable: true })
  recommendedHeight?: number;

  /** حداکثر تعداد بنر فعال هم‌زمان در این جایگاه؛ 0 = نامحدود */
  @Column({ name: 'max_items', type: 'int', default: 0 })
  maxItems: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Banner, (banner) => banner.position)
  banners: Banner[];
}
