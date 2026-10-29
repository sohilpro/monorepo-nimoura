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
    const {
      page = 1,
      limit = 10,
      search = '',
      sortOrder = 'DESC',
      sortBy = 'id',
    } = query;
    const searchableFields = ['name'];
    const where = buildSearchWhereClause(search, searchableFields);

    const [data, total] = await this.categoryRepo.findAndCount({
      relations: { parent: true, children: true },
      where,
      take: +limit,
      skip: (+page - 1) * +limit,
      order: { [sortBy]: sortOrder.toUpperCase() },
    });
    return buildPagination([data, total], page, limit, 'categories');
  }

  async findOne(id: number): Promise<Categories> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { parent: true, children: true },
    });
    if (!category) throw new NotFoundException('Category not found');
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
        // products: (cat.products || []).map((p) => ({
        //   id: p.id,
        //   name: p.title,
        // })),
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
    const category = this.categoryRepo.create({
      name: dto.name,
      slug: generateSlug(dto.name),
    });

    if (dto.parentId) {
      const parent = await this.categoryRepo.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
      category.parent = parent!;
    }

    const savedCategory = await this.categoryRepo.save(category);
    const categoryCreate = this.categoryRepo.findOne({
      where: { id: savedCategory.id },
      relations: { parent: true, children: true, products: true },
    }) as Promise<Categories>;

    return {
      message: 'دسته بندی با موفقیت ایجاد شد.',
      ctegory: categoryCreate,
    };
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (dto.parentId === id) {
      throw new BadRequestException('دسته نمی‌تواند زیرمجموعه خودش باشد.');
    }

    if (dto.name !== undefined) {
      category.name = dto.name;
      category.slug = generateSlug(dto.name as any);
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
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
      message: 'دسته بندی اپدیت شد.',
    };
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    if (!category) throw new NotFoundException('دسته بندی پیدا نشد');
    await this.categoryRepo.remove(category);

    return {
      message: 'دسته بندی حذف شد.',
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
