import { Column, Entity, Index } from 'typeorm';
import { MediaOwnerType } from '../enums/media-owner-type.enum';
import { CustomBaseEntity } from 'src/common/database/base.entity';

/**
 * جدول واحد برای همه فایل‌های سایت (عکس/ویدیو).
 * به جای ساختن جدول جدا برای هر بخش (product_images, brand_logos, ...)
 * از یک جدول polymorphic استفاده می‌کنیم: ownerType + ownerId مشخص می‌کند
 * این فایل متعلق به کدام رکورد از کدام بخش است.
 */
@Entity('media')
@Index(['ownerType', 'ownerId'])
export class Media extends CustomBaseEntity {
  @Column({ type: 'enum', enum: MediaOwnerType })
  ownerType: MediaOwnerType;

  // شناسه رکورد مالک: id محصول، id برند، id کامنت، id مقاله و ...
  @Index('idx_media_owner_id')
  @Column({ type: 'varchar' })
  ownerId: string;

  // برای مواردی که چند عکس با ترتیب خاص دارند (گالری محصول، عکس‌های داخل مقاله)
  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'varchar' })
  originalName: string;

  // نام یکتای فایل روی هاست (uuid + پسوند)
  @Column({ type: 'varchar' })
  fileName: string;

  // مسیر کامل فایل روی سرور FTP (برای حذف بعدی لازم است)
  @Column({ type: 'varchar' })
  ftpPath: string;

  // آدرس عمومی قابل نمایش برای فرانت‌اند
  @Index('idx_media_public_url')
  @Column({ type: 'varchar' })
  publicUrl: string;

  @Column({ type: 'varchar' })
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number;
}
