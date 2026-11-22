import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BANNER_POSITIONS } from '@nimoura/shared-types';
import { BannerPosition } from './entities';
import { CreatePositionDto, UpdatePositionDto } from './dtos';

@Injectable()
export class BannerPositionService implements OnModuleInit {
  private readonly logger = new Logger(BannerPositionService.name);
  constructor(
    @InjectRepository(BannerPosition)
    private readonly positionRepo: Repository<BannerPosition>,
  ) {}

  /**
   * جایگاههای استاندارد فروشگاه را بهصورت idempotent ایجاد میکند.
   * اگر جایگاهی قبلاً توسط ادمین ساخته شده باشد، دستنخورده باقی میماند.
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.positionRepo
        .createQueryBuilder()
        .insert()
        .into(BannerPosition)
        .values(
          BANNER_POSITIONS.map((position) => ({
            key: position.key,
            name: position.name,
            description: position.description,
            recommendedWidth: position.recommendedWidth,
            recommendedHeight: position.recommendedHeight,
            maxItems: position.maxItems ?? 0,
            isActive: true,
          })),
        )
        .orIgnore()
        .execute();
    } catch (error: unknown) {
      // نباید بالا آمدن API را متوقف کند؛ ادمین میتواند جایگاهها را دستی بسازد
      this.logger.warn(
        `امکان ایجاد خودکار جایگاههای بنر: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async create(dto: CreatePositionDto): Promise<BannerPosition> {
    const exists = await this.positionRepo.findOne({ where: { key: dto.key } });
    if (exists) {
      throw new ConflictException(
        `جایگاهی با کلید "${dto.key}" از قبل وجود دارد`,
      );
    }
    const position = this.positionRepo.create(dto);
    return this.positionRepo.save(position);
  }

  findAll(): Promise<BannerPosition[]> {
    return this.positionRepo.find({
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        recommendedWidth: true,
        recommendedHeight: true,
        maxItems: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      order: { createdAt: 'ASC' },
      loadEagerRelations: false,
    });
  }

  async findOne(id: number): Promise<BannerPosition> {
    const position = await this.positionRepo.findOne({
      where: { id },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        recommendedWidth: true,
        recommendedHeight: true,
        maxItems: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      loadEagerRelations: false,
    });
    if (!position) throw new NotFoundException('جایگاه بنر یافت نشد');
    return position;
  }

  async findByKey(key: string): Promise<BannerPosition | null> {
    return this.positionRepo.findOne({ where: { key } });
  }

  async update(id: number, dto: UpdatePositionDto): Promise<BannerPosition> {
    const position = await this.findOne(id);
    Object.assign(position, dto);
    return this.positionRepo.save(position);
  }

  async remove(id: number): Promise<void> {
    const position = await this.findOne(id);
    await this.positionRepo.remove(position);
  }
}
