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
      .select([
        'banner.id',
        'banner.title',
        'banner.imageUrl',
        'banner.mobileImageUrl',
        'banner.link',
        'banner.linkTarget',
        'banner.positionId',
        'banner.device',
        'banner.status',
        'banner.sortOrder',
        'banner.startAt',
        'banner.endAt',
        'banner.views',
        'banner.clicks',
        'banner.createdAt',
        'position.id',
        'position.key',
        'position.name',
      ])
      .leftJoin('banner.position', 'position');

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
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        mobileImageUrl: true,
        link: true,
        linkTarget: true,
        positionId: true,
        device: true,
        status: true,
        sortOrder: true,
        startAt: true,
        endAt: true,
        views: true,
        clicks: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        position: { id: true, key: true, name: true },
      },
      relations: {
        position: true,
      },
      loadEagerRelations: false,
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
      where: { id: Number(id) },
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

    const qb = this.bannerRepo
      .createQueryBuilder('banner')
      .select([
        'banner.id',
        'banner.title',
        'banner.description',
        'banner.imageUrl',
        'banner.mobileImageUrl',
        'banner.link',
        'banner.linkTarget',
        'banner.device',
        'banner.sortOrder',
        'banner.metadata',
      ])
      .innerJoin('banner.position', 'position')
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

    return await qb.getMany();
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
