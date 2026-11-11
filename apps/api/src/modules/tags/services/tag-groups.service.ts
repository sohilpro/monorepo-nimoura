import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagGroups } from '../entities/tag-groups.entity';
import { CreateTagGroupDto, UpdateTagGroupDto } from '../dtos/tag-group.dto';
import { buildSlug, normalizeName, uniqueSlug } from '../utils/tag-normalizer';

@Injectable()
export class TagGroupsService {
  constructor(
    @InjectRepository(TagGroups) private readonly repo: Repository<TagGroups>,
  ) {}

  /** All groups for the admin panel, with the number of tags in each. */
  async listForAdmin() {
    const [groups, counts] = await Promise.all([
      this.repo.find({
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          description: true,
          sortOrder: true,
          isActive: true,
          isFilterable: true,
        },
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
      this.repo.manager.query(
        `SELECT "groupId", COUNT(*) AS count FROM "tags" WHERE "deleted_at" IS NULL GROUP BY "groupId"`,
      ) as Promise<Array<{ groupId: number; count: string }>>,
    ]);
    const byGroup = new Map(
      counts.map((c) => [Number(c.groupId), Number(c.count)]),
    );
    return groups.map((g) => ({ ...g, tagCount: byGroup.get(g.id) ?? 0 }));
  }

  /** Active groups with their active tags, ready for the product form and storefront. */
  async listPublic(
    options: { onlyFilterable?: boolean; includeEmpty?: boolean } = {},
  ) {
    const qb = this.repo
      .createQueryBuilder('g')
      .select([
        'g.id',
        'g.name',
        'g.slug',
        'g.icon',
        'g.description',
        'g.sortOrder',
        'g.isActive',
        'g.isFilterable',
        't.id',
        't.groupId',
        't.name',
        't.slug',
        't.color',
        't.sortOrder',
        't.isActive',
      ])
      .leftJoin('g.tags', 't', 't.isActive = true AND t.deleted_at IS NULL')
      .where('g.isActive = true')
      .orderBy('g.sortOrder', 'ASC')
      .addOrderBy('g.id', 'ASC')
      .addOrderBy('t.sortOrder', 'ASC')
      .addOrderBy('t.name', 'ASC');

    if (options.onlyFilterable) qb.andWhere('g.isFilterable = true');

    const groups = await qb.getMany();
    return options.includeEmpty
      ? groups
      : groups.filter((g) => (g.tags?.length ?? 0) > 0);
  }

  async findOneOrFail(id: number): Promise<TagGroups> {
    const group = await this.repo.findOne({ where: { id } });
    if (!group) throw new NotFoundException('گروه تگ یافت نشد.');
    return group;
  }

  async create(dto: CreateTagGroupDto): Promise<TagGroups> {
    const name = normalizeName(dto.name);
    const slug = await this.resolveSlug(dto.slug ?? buildSlug(name));

    if (await this.repo.findOne({ where: { name } })) {
      throw new ConflictException('گروهی با این نام وجود دارد.');
    }

    const last = await this.repo
      .createQueryBuilder('g')
      .select('COALESCE(MAX(g.sortOrder), 0)', 'max')
      .getRawOne<{ max: string }>();

    return this.repo.save(
      this.repo.create({
        name,
        slug,
        icon: dto.icon ?? null,
        description: dto.description ?? null,
        sortOrder: dto.sortOrder ?? Number(last?.max ?? 0) + 10,
        isActive: dto.isActive ?? true,
        isFilterable: dto.isFilterable ?? true,
      }),
    );
  }

  async update(id: number, dto: UpdateTagGroupDto): Promise<TagGroups> {
    const group = await this.findOneOrFail(id);

    if (dto.name !== undefined) {
      const name = normalizeName(dto.name);
      const clash = await this.repo.findOne({ where: { name } });
      if (clash && clash.id !== id)
        throw new ConflictException('گروهی با این نام وجود دارد.');
      group.name = name;
    }
    if (dto.slug !== undefined && dto.slug !== group.slug) {
      group.slug = await this.resolveSlug(dto.slug, id);
    }
    if (dto.icon !== undefined) group.icon = dto.icon || null;
    if (dto.description !== undefined)
      group.description = dto.description || null;
    if (dto.sortOrder !== undefined) group.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) group.isActive = dto.isActive;
    if (dto.isFilterable !== undefined) group.isFilterable = dto.isFilterable;

    return this.repo.save(group);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    const group = await this.findOneOrFail(id);
    const tagCount = await this.repo
      .createQueryBuilder('g')
      .leftJoin('g.tags', 't')
      .where('g.id = :id', { id })
      .select('COUNT(t.id)', 'count')
      .getRawOne<{ count: string }>();

    if (Number(tagCount?.count ?? 0) > 0) {
      throw new ConflictException(
        'این گروه هنوز تگ دارد. ابتدا تگ‌های آن را حذف یا به گروه دیگری منتقل کنید.',
      );
    }

    await this.repo.delete(group.id);
    return { deleted: true };
  }

  async reorder(ids: number[]): Promise<{ updated: number }> {
    await this.repo.manager.transaction(async (m) => {
      for (const [index, id] of ids.entries()) {
        await m.update(TagGroups, id, { sortOrder: (index + 1) * 10 });
      }
    });
    return { updated: ids.length };
  }

  private async resolveSlug(base: string, ignoreId?: number): Promise<string> {
    const rows = await this.repo
      .createQueryBuilder('g')
      .select(['g.id', 'g.slug'])
      .where('g.slug LIKE :like', { like: `${base}%` })
      .getMany();
    const taken = new Set(
      rows.filter((r) => r.id !== ignoreId).map((r) => r.slug),
    );
    return uniqueSlug(base, taken);
  }
}
