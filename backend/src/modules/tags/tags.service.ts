// src/tags/tags.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tags } from './entities/tags.entity';
import { CreateTagDto } from './dtos/create-tag.dto';
import { BulkCreateTagsDto } from './dtos/bulk-create-tags.dto';
import { ListTagsQueryDto } from './dtos/list-tags.dto';
import { SuggestQueryDto } from './dtos/suggest.dto';
import {
  ALLOWED_TYPES,
  normalizeType,
  normalizeValue,
  TYPE_LABELS_FA,
} from './constants/tags.constant';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tags) private readonly repo: Repository<Tags>,
    private readonly ds: DataSource,
  ) {}

  private sanitize(dto: CreateTagDto): CreateTagDto {
    const type = normalizeType(dto.type);
    const value = normalizeValue(dto.value);
    if (!type || !value)
      throw new BadRequestException('type/value is empty after normalization');
    if (!ALLOWED_TYPES.includes(type as any))
      throw new BadRequestException('Invalid type');
    return { type, value };
  }

  /** ایجاد یا استفاده از موجود - idempotent */
  async create(dto: CreateTagDto): Promise<Tags> {
    const input = this.sanitize(dto);
    // upsert: DB-agnostic با try/catch
    try {
      const created = this.repo.create(input);
      return await this.repo.save(created);
    } catch (e) {
      // احتمالاً unique violation → موجود را برگردان
      const found = await this.repo.findOne({
        where: { type: input.type, value: input.value },
      });
      if (found) return found;
      throw e;
    }
  }

  /** ایجاد دسته‌ای */
  async createBulk(dto: BulkCreateTagsDto): Promise<Tags[]> {
    const items = dto.items.map((i) => this.sanitize(i));

    // TypeORM 0.3+: upsert
    await this.repo.upsert(items, ['type', 'value']);

    // واکشی همه موارد (idها نیاز داریم)
    return this.repo.find({
      where: items.map((i) => ({ type: i.type, value: i.value })),
      order: { type: 'ASC', value: 'ASC' },
    });
  }

  /** لیست تگ‌ها (اختیاری: فیلتر بر اساس type و q) + صفحه‌بندی */
  async list(qs: ListTagsQueryDto) {
    const { type, q, limit = 50, page = 1 } = qs;

    const where: any = {};
    if (type) where.type = type;
    if (q) where.value = ILike(`%${q.trim()}%`); // Postgres؛ در MySQL → Like

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { type: 'ASC', value: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  /** پیشنهاد مقدار فقط برای یک type (distinct values) */
  async suggest(qs: SuggestQueryDto) {
    const { type, q, limit = 20 } = qs;

    const qb = this.repo
      .createQueryBuilder('t')
      .select('DISTINCT t.value', 'value')
      .where('t.type = :type', { type })
      .orderBy('value', 'ASC')
      .limit(limit);

    if (q?.trim()) {
      // Postgres
      qb.andWhere('t.value ILIKE :q', { q: `%${q.trim()}%` });
      // اگر MySQL: از LIKE استفاده کن
    }

    const rows = await qb.getRawMany<{ value: string }>();
    return { type, values: rows.map((r) => r.value) };
  }

  /** همه تگ‌ها را به‌صورت گروهی {type: [values]} برگردان (برای فرم) */
  async grouped() {
    // توجه: برای دیتای زیاد بهتره از کوئری‌های جداگانه روی هر type استفاده کنی
    const rows = await this.repo
      .createQueryBuilder('t')
      .select(['t.type AS type', 't.value AS value'])
      .orderBy('t.type', 'ASC')
      .addOrderBy('t.value', 'ASC')
      .getRawMany<{ type: string; value: string }>();

    const out: Record<string, string[]> = {};
    for (const row of rows) {
      if (!out[row.type]) out[row.type] = [];
      out[row.type].push(row.value);
    }
    return out;
  }

  /** لیست typeهای مجاز (برای UI) */
  getAllowedTypesLabeled() {
    return ALLOWED_TYPES.map((t) => ({
      type: t,
      label: TYPE_LABELS_FA[t],
    }));
  }

  getAllowedTypes() {
    return [...ALLOWED_TYPES];
  }
}
