import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SHOWCASE_CONFIG_SUGGESTIONS } from '@nimoura/shared-types';
import { ShowcaseConfig } from './entities/showcase-config.entity';
import {
  CreateShowcaseConfigDto,
  UpdateShowcaseConfigDto,
} from './dtos/showcase-config.dto';

@Injectable()
export class ShowcaseConfigsService implements OnModuleInit {
  private readonly logger = new Logger(ShowcaseConfigsService.name);

  constructor(
    @InjectRepository(ShowcaseConfig)
    private readonly repo: Repository<ShowcaseConfig>,
  ) {}

  /** ویترینهای پیشفرض را به صورت idempotent میسازد تا صفحه اصلی خوری نباشد */
  async onModuleInit(): Promise<void> {
    try {
      await this.repo
        .createQueryBuilder()
        .insert()
        .into(ShowcaseConfig)
        .values(
          SHOWCASE_CONFIG_SUGGESTIONS.map((s) => ({
            key: s.key,
            name: s.name,
            title: s.title,
            highlight: s.highlight,
            subtitle: s.subtitle,
            badgeText: s.badgeText,
            variant: s.variant,
            limit: s.limit,
            showHeader: true,
            isActive: true,
            sortOrder: 0,
            items: [],
            centerItem: null,
          })),
        )
        .orIgnore()
        .execute();
    } catch (error: unknown) {
      this.logger.warn(
        `امکان ایجاد ویترینهای پیشفرض: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async create(dto: CreateShowcaseConfigDto): Promise<ShowcaseConfig> {
    const exists = await this.repo.findOne({ where: { key: dto.key } });
    if (exists) {
      throw new ConflictException(`ویترینی باکلید "${dto.key}" از قبل وجود دارد`);
    }
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<ShowcaseConfig[]> {
    return this.repo.find({ order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findOne(id: number): Promise<ShowcaseConfig> {
    const config = await this.repo.findOne({ where: { id } });
    if (!config) throw new NotFoundException('ویترین یافت نشد');
    return config;
  }

  /** خواندن عمومی بر اساس کلید؛ فقط ویترینهای فعال برگردانده میشوند */
  async findByKey(key: string): Promise<ShowcaseConfig> {
    const config = await this.repo.findOne({
      where: { key, isActive: true },
      order: { id: 'ASC' },
    });
    if (!config) throw new NotFoundException('ویترین یافت نشد');
    return config;
  }

  async update(
    id: number,
    dto: UpdateShowcaseConfigDto,
  ): Promise<ShowcaseConfig> {
    const config = await this.findOne(id);
    if (dto.key && dto.key !== config.key) {
      const duplicate = await this.repo.findOne({ where: { key: dto.key } });
      if (duplicate) {
        throw new ConflictException(`ویترینی باکلید "${dto.key}" از قبل وجود دارد`);
      }
    }
    Object.assign(config, dto);
    return this.repo.save(config);
  }

  async remove(id: number): Promise<void> {
    const config = await this.findOne(id);
    await this.repo.remove(config);
  }
}
