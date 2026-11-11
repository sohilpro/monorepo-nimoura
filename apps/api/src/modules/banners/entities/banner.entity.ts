import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BannerPosition } from './banner-position.entity';
import { BannerStatus, BannerDevice, LinkTarget } from '../enums';
import { CustomBaseEntity } from 'src/common/database/base.entity';

@Entity('banners')
@Index(['positionId', 'status', 'sortOrder'])
@Index('idx_banners_status_end_at', ['status', 'endAt'])
export class Banner extends CustomBaseEntity {
  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  /** تصویر اختصاصی برای موبایل، اختیاری - اگر نباشد از imageUrl استفاده می‌شود */
  @Column({ name: 'mobile_image_url', nullable: true })
  mobileImageUrl?: string;

  @Column({ nullable: true })
  link?: string;

  @Column({
    name: 'link_target',
    type: 'enum',
    enum: LinkTarget,
    default: LinkTarget.SELF,
  })
  linkTarget: LinkTarget;

  @Column({ name: 'position_id' })
  positionId: number;

  @ManyToOne(() => BannerPosition, (position) => position.banners, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'position_id' })
  position: BannerPosition;

  @Column({ type: 'enum', enum: BannerDevice, default: BannerDevice.ALL })
  device: BannerDevice;

  @Column({ type: 'enum', enum: BannerStatus, default: BannerStatus.DRAFT })
  status: BannerStatus;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'start_at', type: 'timestamptz', nullable: true })
  startAt?: Date;

  @Column({ name: 'end_at', type: 'timestamptz', nullable: true })
  endAt?: Date;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  clicks: number;

  /**
   * فیلد کاملا انعطاف‌پذیر برای داده‌های اضافه‌ی هر پروژه
   * مثل: altText، ctaText، badgeColor، htmlContent سفارشی، rel نوفالو و ...
   * بدون نیاز به migration جدید در هر پروژه.
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
