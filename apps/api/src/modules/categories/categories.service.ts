import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateSlug } from 'src/common/utils/slug.helper';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Categories } from './entities/categories.entity';
import {
  buildPagination,
  buildSearchWhereClause,
} from 'src/common/utils/pagination.helper';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoryRepo: Repository<Categories>,
  ) {}

  async findAll(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const search = (query.search || '').trim();
    const sortOrder =
      String(query.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const allowedSortFields = ['id', 'name', 'createdAt', 'updatedAt'];
    const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : 'id';

    const searchableFields = ['name'];
    const where = search ? buildSearchWhereClause(search, searchableFields) : {};

    const [data, total] = await this.categoryRepo.findAndCount({
      relations: { parent: true, children: true },
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { [sortBy]: sortOrder },
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
      relations: { parent: true, children: true },
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');
    return category;
  }

  async getCategoryTree(): Promise<any[]> {
    const rawCategories = await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.children', 'children')
      .getMany();

    const map = new Map<number, any>();
    const roots: any[] = [];

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

  // Admin
  async create(dto: CreateCategoryDto) {
    const slug = dto.slug?.trim() ? generateSlug(dto.slug) : generateSlug(dto.name);
    const category = this.categoryRepo.create({
      name: dto.name.trim(),
      slug,
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
      if (!dto.slug) {
        category.slug = generateSlug(dto.name);
      }
    }

    if (dto.slug !== undefined) {
      category.slug = generateSlug(dto.slug);
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

  async getCategoryTreeWithProducts(): Promise<any[]> {
    const rawCategories = await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.children', 'children')
      .leftJoinAndSelect('category.products', 'products')
      .getMany();

    const map = new Map<number, any>();
    const roots: any[] = [];

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
