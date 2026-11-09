import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Tags } from '../entities/tags.entity';

/**
 * Adds "product has these tags" conditions to a product query.
 *
 * Semantics (same as most online shops): tags of the SAME group are OR-ed
 * (oily OR dry skin), tags of DIFFERENT groups are AND-ed.
 */
@Injectable()
export class TagFilterService {
  constructor(@InjectRepository(Tags) private readonly repo: Repository<Tags>) {}

  async apply<T extends object>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    tagIds: number[],
    options: { excludeGroupId?: number } = {},
  ): Promise<void> {
    if (!tagIds.length) return;

    const tags = await this.repo.find({
      where: { id: In(tagIds), isActive: true },
      select: { id: true, groupId: true },
      loadEagerRelations: false,
    });

    const byGroup = new Map<number, number[]>();
    for (const tag of tags) {
      if (tag.groupId === options.excludeGroupId) continue;
      byGroup.set(tag.groupId, [...(byGroup.get(tag.groupId) ?? []), tag.id]);
    }

    for (const [groupId, ids] of byGroup) {
      const param = `tagIds_${groupId}`;
      qb.andWhere(
        `EXISTS (SELECT 1 FROM "product_tag" pt_${groupId}
                 WHERE pt_${groupId}."product_id" = ${alias}.id
                   AND pt_${groupId}."tag_id" IN (:...${param}))`,
        { [param]: ids },
      );
    }
  }
}
