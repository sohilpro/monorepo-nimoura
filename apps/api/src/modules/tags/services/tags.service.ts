import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Tags } from '../entities/tags.entity';
import { TagGroups } from '../entities/tag-groups.entity';
import {
  BulkCreateTagsDto,
  CreateTagDto,
  ListTagsQueryDto,
  MergeTagsDto,
  UpdateTagDto,
} from '../dtos/tag.dto';
import { buildSlug, normalizeName, uniqueSlug } from '../utils/tag-normalizer';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tags) private readonly repo: Repository<Tags>,
    @InjectRepository(TagGroups) private readonly groupRepo: Repository<TagGroups>,
  ) {}

  /** Paginated list for the admin panel, including how many products use each tag. */
  async list(qs: ListTagsQueryDto) {
    const { groupId, q, isActive, page = 1, limit = 50 } = qs;

    const where: Record<string, unknown> = {};
    if (groupId) where.groupId = groupId;
    if (isActive !== undefined) where.isActive = isActive;
    if (q?.trim()) where.name = ILike(`%${q.trim()}%`);

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { groupId: 'ASC', sortOrder: 'ASC', name: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const counts = await this.productCounts(items.map((t) => t.id));
    return {
      items: items.map((t) => ({ ...t, productCount: counts.get(t.id) ?? 0 })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Active tags by id; throws when any id is unknown so a product never silently loses a tag. */
  async findActiveByIdsOrFail(ids: number[]): Promise<Tags[]> {
    const unique = [...new Set(ids)];
    if (!unique.length) return [];
    const tags = await this.repo.find({ where: { id: In(unique), isActive: true } });
    if (tags.length !== unique.length) {
      const found = new Set(tags.map((t) => t.id));
      const missing = unique.filter((id) => !found.has(id));
      throw new BadRequestException(`تگ‌های نامعتبر یا غیرفعال: ${missing.join('، ')}`);
    }
    return tags;
  }

  async create(dto: CreateTagDto): Promise<Tags> {
    const group = await this.requireGroup(dto.groupId);
    const name = normalizeName(dto.name);
    if (!name) throw new BadRequestException('نام تگ نمی‌تواند خالی باشد.');

    if (await this.repo.findOne({ where: { groupId: group.id, name } })) {
      throw new ConflictException(`تگ «${name}» در گروه «${group.name}» وجود دارد.`);
    }

    const slug = await this.resolveSlug(group.id, dto.slug ?? buildSlug(name));
    const sortOrder = dto.sortOrder ?? (await this.nextSortOrder(group.id));

    const saved = await this.repo.save(
      this.repo.create({
        groupId: group.id,
        name,
        slug,
        color: dto.color ?? null,
        sortOrder,
        isActive: dto.isActive ?? true,
      }),
    );
    return this.repo.findOneOrFail({ where: { id: saved.id } });
  }

  /** Creates many tags in a group at once; existing names are skipped (idempotent). */
  async createBulk(dto: BulkCreateTagsDto): Promise<Tags[]> {
    const group = await this.requireGroup(dto.groupId);
    const names = [...new Set(dto.names.map(normalizeName).filter(Boolean))];

    const existing = await this.repo.find({ where: { groupId: group.id } });
    const existingNames = new Set(existing.map((t) => t.name));
    const takenSlugs = new Set(existing.map((t) => t.slug));
    let sortOrder = existing.reduce((max, t) => Math.max(max, t.sortOrder), 0);

    const toCreate = names
      .filter((n) => !existingNames.has(n))
      .map((name) => {
        const slug = uniqueSlug(buildSlug(name), takenSlugs);
        takenSlugs.add(slug);
        sortOrder += 10;
        return this.repo.create({ groupId: group.id, name, slug, sortOrder });
      });

    if (toCreate.length) await this.repo.save(toCreate);
    return this.repo.find({
      where: { groupId: group.id, name: In(names) },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateTagDto): Promise<Tags> {
    const tag = await this.findOneOrFail(id);
    const targetGroupId = dto.groupId ?? tag.groupId;
    if (dto.groupId !== undefined) await this.requireGroup(dto.groupId);

    if (dto.name !== undefined || dto.groupId !== undefined) {
      const name = dto.name !== undefined ? normalizeName(dto.name) : tag.name;
      if (!name) throw new BadRequestException('نام تگ نمی‌تواند خالی باشد.');
      const clash = await this.repo.findOne({ where: { groupId: targetGroupId, name } });
      if (clash && clash.id !== id) throw new ConflictException('تگی با این نام در این گروه وجود دارد.');
      tag.name = name;
    }

    if (dto.slug !== undefined || dto.groupId !== undefined) {
      const base = dto.slug ?? tag.slug;
      tag.slug = await this.resolveSlug(targetGroupId, base, id);
    }

    tag.groupId = targetGroupId;
    if (dto.color !== undefined) tag.color = dto.color || null;
    if (dto.sortOrder !== undefined) tag.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) tag.isActive = dto.isActive;

    await this.repo.save(tag);
    return this.findOneOrFail(id);
  }

  /** Hard delete; the product↔tag links are removed in the same transaction. */
  async remove(id: number): Promise<{ deleted: true }> {
    await this.findOneOrFail(id);
    await this.repo.manager.transaction(async (m) => {
      await m.query(`DELETE FROM "product_tag" WHERE "tag_id" = $1`, [id]);
      await m.delete(Tags, id);
    });
    return { deleted: true };
  }

  /** Moves every product of `source` to `target` (same group) and deletes `source`. */
  async merge(dto: MergeTagsDto): Promise<Tags> {
    if (dto.sourceId === dto.targetId) {
      throw new BadRequestException('تگ مبدأ و مقصد نمی‌توانند یکی باشند.');
    }
    const [source, target] = await Promise.all([
      this.findOneOrFail(dto.sourceId),
      this.findOneOrFail(dto.targetId),
    ]);
    if (source.groupId !== target.groupId) {
      throw new BadRequestException('ادغام فقط بین تگ‌های یک گروه ممکن است.');
    }

    await this.repo.manager.transaction(async (m) => {
      await m.query(
        `INSERT INTO "product_tag" ("product_id","tag_id")
         SELECT "product_id", $2 FROM "product_tag" WHERE "tag_id" = $1
         ON CONFLICT DO NOTHING`,
        [source.id, target.id],
      );
      await m.query(`DELETE FROM "product_tag" WHERE "tag_id" = $1`, [source.id]);
      await m.delete(Tags, source.id);
    });
    return this.findOneOrFail(target.id);
  }

  async reorder(ids: number[]): Promise<{ updated: number }> {
    await this.repo.manager.transaction(async (m) => {
      for (const [index, id] of ids.entries()) {
        await m.update(Tags, id, { sortOrder: (index + 1) * 10 });
      }
    });
    return { updated: ids.length };
  }

  private async findOneOrFail(id: number): Promise<Tags> {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('تگ یافت نشد.');
    return tag;
  }

  private async requireGroup(groupId: number): Promise<TagGroups> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new BadRequestException('گروه تگ انتخاب‌شده وجود ندارد.');
    return group;
  }

  private async nextSortOrder(groupId: number): Promise<number> {
    const row = await this.repo
      .createQueryBuilder('t')
      .select('COALESCE(MAX(t.sortOrder), 0)', 'max')
      .where('t.groupId = :groupId', { groupId })
      .getRawOne<{ max: string }>();
    return Number(row?.max ?? 0) + 10;
  }

  private async resolveSlug(groupId: number, base: string, ignoreId?: number): Promise<string> {
    const rows = await this.repo
      .createQueryBuilder('t')
      .select(['t.id', 't.slug'])
      .where('t.groupId = :groupId', { groupId })
      .andWhere('t.slug LIKE :like', { like: `${base}%` })
      .getMany();
    const taken = new Set(rows.filter((r) => r.id !== ignoreId).map((r) => r.slug));
    return uniqueSlug(base, taken);
  }

  private async productCounts(ids: number[]): Promise<Map<number, number>> {
    if (!ids.length) return new Map();
    const rows: Array<{ tag_id: number; count: string }> = await this.repo.query(
      `SELECT "tag_id", COUNT(*) AS count FROM "product_tag" WHERE "tag_id" = ANY($1) GROUP BY "tag_id"`,
      [ids],
    );
    return new Map(rows.map((r) => [Number(r.tag_id), Number(r.count)]));
  }
}
