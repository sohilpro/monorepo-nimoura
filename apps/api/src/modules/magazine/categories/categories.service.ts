import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos/misc.dto';
import { generateSlug, makeSlugUnique } from '../utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    let slug = generateSlug(dto.name);
    if (await this.categoryRepo.findOneBy({ slug }))
      slug = makeSlugUnique(slug);

    const category = this.categoryRepo.create({
      ...dto,
      slug,
      // استفاده از as any برای جلوگیری از خطای TypeScript
      parent: dto.parentId ? ({ id: dto.parentId } as any) : null,
    });
    return this.categoryRepo.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');

    if (dto.name && dto.name !== category.name) {
      let slug = generateSlug(dto.name);
      const exists = await this.categoryRepo.findOneBy({ slug });
      if (exists && exists.id !== id) slug = makeSlugUnique(slug);
      category.slug = slug;
    }

    // بررسی دقیق‌تر برای والد (حالت آپدیت و امکان حذف والد)
    if (dto.parentId !== undefined) {
      category.parent = dto.parentId ? ({ id: dto.parentId } as any) : null;
    }

    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  // فقط دسته‌های اصلی (بدون parent) به همراه زیرمجموعه‌ها، برای منوی مجله
  findTree(): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { parent: IsNull() },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        icon: true,
        sortOrder: true,
        children: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          sortOrder: true,
        },
      },
      relations: { children: true },
      order: { sortOrder: 'ASC' },
      loadEagerRelations: false,
    });
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepo.find({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        icon: true,
        sortOrder: true,
      },
      order: { sortOrder: 'ASC' },
      loadEagerRelations: false,
    });
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        icon: true,
        metaTitle: true,
        metaDescription: true,
        children: {
          id: true,
          name: true,
          slug: true,
          icon: true,
        },
      },
      relations: { children: true },
      loadEagerRelations: false,
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');
    return category;
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoryRepo.delete(id);
    if (!result.affected) throw new NotFoundException('دسته‌بندی یافت نشد');
  }
}
