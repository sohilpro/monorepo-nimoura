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
      relations: { children: true },
      order: { sortOrder: 'ASC' },
    });
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { slug },
      relations: { children: true },
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد');
    return category;
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoryRepo.delete(id);
    if (!result.affected) throw new NotFoundException('دسته‌بندی یافت نشد');
  }
}
