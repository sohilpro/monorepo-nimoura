import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities';
import {
  CreateBannerDto,
  UpdateBannerDto,
  QueryBannerDto,
  ReorderBannerDto,
} from './dtos';
import { BannerStatus, BannerDevice } from './enums';
import { PaginatedResult } from './common/paginated-result';
import { MediaOwnerType } from '../media/enums/media-owner-type.enum';
import { MediaStaticService } from '../media/media-static.service';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
    private readonly mediaService: MediaStaticService,
  ) {}

  async create(dto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannerRepo.create({
      ...dto,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
    });

    // ۱. محاسبه خودکار ترتیب نمایش در صورت تعیین نشدن
    if (dto.sortOrder === undefined) {
      const last = await this.bannerRepo.findOne({
        where: { positionId: dto.positionId },
        order: { sortOrder: 'DESC' },
      });
      banner.sortOrder = last ? last.sortOrder + 1 : 0;
    }

    // ۲. ذخیره نهایی بنر در دیتابیس برای دریافت شناسه (id)
    const saved = await this.bannerRepo.save(banner);

    // ۳. انتساب شناسه واقعی بنر به تصاویر آپلود شده (تغییر ownerId از 'temp' به شناسه بنر)
    await this.mediaService.reassignOwner(
      [saved.imageUrl, saved.mobileImageUrl],
      MediaOwnerType.BANNER,
      String(saved.id),
    );

    return saved;
  }

  async findAll(query: QueryBannerDto): Promise<PaginatedResult<Banner>> {
    const {
      positionId,
      status,
      device,
      search,
      page = 1,
      limit = 20,
      sortBy = 'sortOrder',
      sortDir = 'ASC',
    } = query;

    const qb = this.bannerRepo
      .createQueryBuilder('banner')
      .leftJoinAndSelect('banner.position', 'position');

    if (positionId)
      qb.andWhere('banner.positionId = :positionId', { positionId });
    if (status) qb.andWhere('banner.status = :status', { status });
    if (device) qb.andWhere('banner.device = :device', { device });
    if (search)
      qb.andWhere('banner.title ILIKE :search', { search: `%${search}%` });

    qb.orderBy(`banner.${sortBy}`, sortDir)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: number): Promise<Banner> {
    const banner = await this.bannerRepo.findOne({
      where: { id },
      relations: {
        position: true,
      },
    });
    if (!banner) throw new NotFoundException('بنر یافت نشد');
    return banner;
  }

  async update(id: number, dto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findOne(id);
    Object.assign(banner, {
      ...dto,
      startAt: dto.startAt ? new Date(dto.startAt) : banner.startAt,
      endAt: dto.endAt ? new Date(dto.endAt) : banner.endAt,
    });
    return this.bannerRepo.save(banner);
  }

  async remove(id: number): Promise<void> {
    const banner = await this.bannerRepo.findOne({
      where: { id: Number(id) as any },
    });
    if (!banner) {
      throw new NotFoundException('بنر مورد نظر یافت نشد');
    }

    // ۱. حذف فایل‌های فیزیکی و رکوردهای دیتابیس بر اساس آدرس عکس‌های بنر
    await this.mediaService.deleteByUrls([
      banner.imageUrl,
      banner.mobileImageUrl,
    ]);

    // ۲. حذف هر مدیا دیگری که احیاناً با این ownerId ثبت شده بود
    await this.mediaService.deleteByOwner(
      MediaOwnerType.BANNER,
      String(banner.id),
    );

    // ۳. حذف رکورد خود بنر
    await this.bannerRepo.remove(banner);
  }

  async restore(id: number): Promise<Banner> {
    await this.bannerRepo.restore(id);
    return this.findOne(id);
  }

  async reorder(dto: ReorderBannerDto): Promise<void> {
    await this.bannerRepo.manager.transaction(async (manager) => {
      await Promise.all(
        dto.items.map((item) =>
          manager.update(Banner, item.id, { sortOrder: item.sortOrder }),
        ),
      );
    });
  }

  async findActiveForPosition(
  positionKey: string,
  device: BannerDevice = BannerDevice.ALL,
): Promise<Banner[]> {
  const now = new Date();

  // 🧪 لاگ ۱: بررسی دقیق ورودی‌های دریافتی و تاریخ سرور
  console.log('=== [DEBUG BANNERS START] ===');
  console.log('1. Incoming Params:', {
    positionKey,
    device,
    now: now.toISOString(),
  });

 // اصلاح لاگ شماره ۲
const rawPosition = await this.bannerRepo.manager.query(
  `SELECT id, "key", "is_active" FROM banner_positions WHERE "key" = $1`,
  [positionKey],
);
console.log('2. Position in DB check:', rawPosition);

  // 🧪 لاگ ۳: تعداد بنرهای مرتبط بدون اعمال شرط تاریخ و دستگاه
  const rawBannersCount = await this.bannerRepo
    .createQueryBuilder('banner')
    .innerJoin('banner.position', 'position')
    .where('position.key = :positionKey', { positionKey })
    .getCount();
  console.log('3. Total Raw Banners for position:', rawBannersCount);

  const qb = this.bannerRepo
    .createQueryBuilder('banner')
    .innerJoinAndSelect('banner.position', 'position') // اضافه شدن innerJoinAndSelect جهت اطمینان
    .where('position.key = :positionKey', { positionKey })
    .andWhere('position.isActive = true')
    .andWhere('banner.status = :status', { status: BannerStatus.ACTIVE })
    .andWhere('(banner.startAt IS NULL OR banner.startAt <= :now)', { now })
    .andWhere('(banner.endAt IS NULL OR banner.endAt >= :now)', { now });

  if (device !== BannerDevice.ALL) {
    qb.andWhere('(banner.device = :device OR banner.device = :all)', {
      device,
      all: BannerDevice.ALL,
    });
  }

  qb.orderBy('banner.sortOrder', 'ASC');

  // 🧪 لاگ ۴: چاپ دستور SQL و پارامترهای واقعی ارسال‌شده به دیتابیس
  console.log('4. Executed SQL:', qb.getSql());
  console.log('4. SQL Parameters:', qb.getParameters());

  const result = await qb.getMany();

  // 🧪 لاگ ۵: خروجی نهایی
  console.log('5. Final Result Count:', result.length);
  console.log('=== [DEBUG BANNERS END] ===');

  return result;
}

  // اگر متدهای ثبت کلیک/ویو را می‌خواهید، مستقیم ثبت می‌شوند
  async incrementView(id: number): Promise<void> {
    await this.bannerRepo.increment({ id }, 'views', 1);
  }

  async incrementClick(id: number): Promise<void> {
    await this.bannerRepo.increment({ id }, 'clicks', 1);
  }

  async expireOutdatedBanners(): Promise<number> {
    const result = await this.bannerRepo
      .createQueryBuilder()
      .update(Banner)
      .set({ status: BannerStatus.EXPIRED })
      .where('status = :status', { status: BannerStatus.ACTIVE })
      .andWhere('endAt IS NOT NULL AND endAt < :now', { now: new Date() })
      .execute();
    return result.affected ?? 0;
  }
}
