import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { generateSlug } from 'src/common/utils/slug.helper';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Categories } from './entities/categories.entity';
import {
  buildSearchWhereClause,
  ListQuery,
  parseListQuery,
} from 'src/common/utils/pagination.helper';

export interface CategoryTreeNode {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  products?: Array<{ id: number; name: string }>;
  children: CategoryTreeNode[];
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoryRepo: Repository<Categories>,
  ) {}

  async findAll(query: ListQuery) {
    const { page, limit, search, sortOrder, sortBy } = parseListQuery(query, [
      'id',
      'name',
      'createdAt',
      'updatedAt',
    ]);

    const searchableFields = ['name'];
    const where = search
      ? buildSearchWhereClause(search, searchableFields)
      : {};

    const [data, total] = await this.categoryRepo.findAndCount({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        parent: { id: true, name: true, slug: true },
        children: { id: true, name: true, slug: true },
      },
      relations: { parent: true, children: true },
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { [sortBy]: sortOrder },
      loadEagerRelations: false,
    });

    const totalPages = Math.ceil(total / limit);
    return {
      items: data,
      categories: data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: number): Promise<Categories> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        seoTitle: true,
        seoDescription: true,
        seoText: true,
        createdAt: true,
        updatedAt: true,
        parent: { id: true, name: true, slug: true },
        children: { id: true, name: true, slug: true },
      },
      relations: { parent: true, children: true },
      loadEagerRelations: false,
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');
    return category;
  }

  async findByIdentifier(identifier: number | string): Promise<Categories> {
    const raw = String(identifier).trim();
    if (/^\d+$/.test(raw)) {
      return this.findOne(Number(raw));
    }

    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw);
    } catch {
      decoded = raw;
    }

    const candidates = Array.from(
      new Set([decoded, generateSlug(decoded)].filter(Boolean)),
    );

    let category: Categories | null = null;
    for (const candidate of candidates) {
      category = await this.categoryRepo.findOne({
        where: { slug: candidate },
        select: {
          id: true,
          name: true,
          slug: true,
          seoTitle: true,
          seoDescription: true,
          seoText: true,
          createdAt: true,
          updatedAt: true,
          parent: {
            id: true,
            name: true,
            slug: true,
            parent: { id: true, name: true, slug: true },
          },
          children: { id: true, name: true, slug: true },
        },
        relations: { parent: { parent: true }, children: true },
        loadEagerRelations: false,
      });
      if (category) break;
    }
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');
    return category;
  }

  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    const rawCategories = await this.categoryRepo
      .createQueryBuilder('category')
      .select(['category.id', 'category.name', 'category.slug', 'parent.id'])
      .leftJoin('category.parent', 'parent')
      .getMany();

    const map = new Map<number, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    for (const cat of rawCategories) {
      const item = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parent?.id || null,
        children: [],
      };
      map.set(cat.id, item);
    }

    for (const cat of rawCategories) {
      const current = map.get(cat.id);
      if (!current) continue;
      if (current.parentId) {
        const parent = map.get(current.parentId);
        if (parent) {
          parent.children.push(current);
        } else {
          roots.push(current);
        }
      } else {
        roots.push(current);
      }
    }

    return roots;
  }

  private async resolveUniqueSlug(
    raw: string,
    excludeId?: number,
  ): Promise<string> {
    const base = generateSlug(raw) || 'category';
    let candidate = base;
    let suffix = 2;

    while (true) {
      const existing = await this.categoryRepo.findOne({
        where: excludeId
          ? { slug: candidate, id: Not(excludeId) }
          : { slug: candidate },
        select: { id: true },
        loadEagerRelations: false,
      });
      if (!existing) return candidate;
      candidate = `${base}-${suffix++}`;
    }
  }

  // Admin
  async create(dto: CreateCategoryDto) {
    const slugSource = dto.slug?.trim() ? dto.slug : dto.name;
    const slug = await this.resolveUniqueSlug(slugSource);
    const category = this.categoryRepo.create({
      name: dto.name.trim(),
      slug,
      seoTitle: dto.seoTitle?.trim() || null,
      seoDescription: dto.seoDescription?.trim() || null,
      seoText: dto.seoText?.trim() || null,
    });

    if (dto.parentId) {
      const parent = await this.categoryRepo.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) throw new NotFoundException('دسته‌بندی والد پیدا نشد');
      category.parent = parent;
    }

    const savedCategory = await this.categoryRepo.save(category);
    const fullCategory = await this.categoryRepo.findOne({
      where: { id: savedCategory.id },
      relations: { parent: true, children: true },
    });

    return {
      message: 'دسته‌بندی با موفقیت ایجاد شد.',
      category: fullCategory,
    };
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (dto.parentId === id) {
      throw new BadRequestException('دسته نمی‌تواند زیرمجموعه خودش باشد.');
    }

    if (dto.name !== undefined) {
      category.name = dto.name.trim();
      if (!category.slug && dto.slug === undefined) {
        category.slug = await this.resolveUniqueSlug(category.name, id);
      }
    }

    if (dto.slug !== undefined) {
      const slugSource = dto.slug.trim() || category.name;
      category.slug = await this.resolveUniqueSlug(slugSource, id);
    }

    if (dto.seoTitle !== undefined) {
      category.seoTitle = dto.seoTitle?.trim() || null;
    }

    if (dto.seoDescription !== undefined) {
      category.seoDescription = dto.seoDescription?.trim() || null;
    }

    if (dto.seoText !== undefined) {
      category.seoText = dto.seoText?.trim() || null;
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === null || dto.parentId === 0) {
        category.parent = null;
      } else {
        const parent = await this.categoryRepo.findOne({
          where: { id: dto.parentId },
        });
        if (!parent) throw new NotFoundException('دسته والد پیدا نشد');
        category.parent = parent;
      }
    }

    await this.categoryRepo.save(category);
    return {
      message: 'دسته‌بندی با موفقیت ویرایش شد.',
      category,
    };
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.categoryRepo.remove(category);

    return {
      message: 'دسته‌بندی با موفقیت حذف شد.',
    };
  }

  async getCategoryTreeWithProducts(): Promise<CategoryTreeNode[]> {
    const rawCategories = await this.categoryRepo
      .createQueryBuilder('category')
      .select([
        'category.id',
        'category.name',
        'category.slug',
        'parent.id',
        'products.id',
        'products.title',
      ])
      .leftJoin('category.parent', 'parent')
      .leftJoin('category.products', 'products')
      .getMany();

    const map = new Map<number, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    for (const cat of rawCategories) {
      const item = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parent?.id || null,
        products: (cat.products || []).map((p) => ({
          id: p.id,
          name: p.title,
        })),
        children: [],
      };
      map.set(cat.id, item);
    }

    for (const cat of rawCategories) {
      const current = map.get(cat.id);
      if (!current) continue;
      if (current.parentId) {
        const parent = map.get(current.parentId);
        if (parent) {
          parent.children.push(current);
        } else {
          roots.push(current);
        }
      } else {
        roots.push(current);
      }
    }

    return roots;
  }
}
