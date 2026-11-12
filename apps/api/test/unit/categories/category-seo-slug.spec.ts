import { describe, it, expect, vi } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CategoryService } from '../../../src/modules/categories/categories.service';
import { CreateCategoryDto } from '../../../src/modules/categories/dtos/create-category.dto';
import { UpdateCategoryDto } from '../../../src/modules/categories/dtos/update-category.dto';

describe('Category SEO DTOs', () => {
  it('accepts seoTitle, seoDescription and seoText on CreateCategoryDto and UpdateCategoryDto', async () => {
    const createDto = plainToInstance(CreateCategoryDto, {
      name: 'لوازم آرایشی',
      slug: 'لوازم-آرایشی',
      seoTitle: 'خرید لوازم آرایشی اصل | نیمورا',
      seoDescription: 'بهترین محصولات آرایشی با ضمانت اصالت کالا.',
      seoText: '<h1>لوازم آرایشی</h1><p>توضیحات سئو دسته‌بندی</p>',
    });
    expect(await validate(createDto)).toHaveLength(0);

    const updateDto = plainToInstance(UpdateCategoryDto, {
      seoTitle: 'عنوان ویرایش شده',
      seoText: '<h2>تیتر دوم</h2>',
    });
    expect(await validate(updateDto)).toHaveLength(0);
  });
});

describe('CategoryService slug & SEO persistence', () => {
  it('generates unique slug and persists SEO fields on create', async () => {
    const repo = {
      findOne: vi
        .fn()
        .mockResolvedValueOnce({ id: 1 }) // first slug collides
        .mockResolvedValueOnce(null) // -2 is available
        .mockResolvedValueOnce({
          id: 2,
          name: 'لوازم آرایشی',
          slug: 'cosmetics-2',
          seoTitle: 'عنوان سئو',
          seoDescription: 'توضیح متا',
          seoText: '<h1>متن</h1>',
        }),
      create: vi.fn((data) => ({ ...data })),
      save: vi.fn(async (entity) => ({ id: 2, ...entity })),
    } as any;

    const service = new CategoryService(repo);
    const res = await service.create({
      name: 'لوازم آرایشی',
      slug: 'cosmetics',
      seoTitle: ' عنوان سئو ',
      seoDescription: ' توضیح متا ',
      seoText: '<h1>متن</h1>',
    });

    expect(repo.create).toHaveBeenCalledWith({
      name: 'لوازم آرایشی',
      slug: 'cosmetics-2',
      seoTitle: 'عنوان سئو',
      seoDescription: 'توضیح متا',
      seoText: '<h1>متن</h1>',
    });
    expect(res.category?.slug).toBe('cosmetics-2');
  });

  it('finds category by slug in findByIdentifier', async () => {
    const repo = {
      findOne: vi.fn().mockResolvedValueOnce({
        id: 1,
        name: 'لوازم آرایشی',
        slug: 'cosmetics',
        seoText: '<h1>تست</h1>',
      }),
    } as any;

    const service = new CategoryService(repo);
    const cat = await service.findByIdentifier('cosmetics');

    expect(cat.id).toBe(1);
    expect(cat.seoText).toBe('<h1>تست</h1>');
    expect(repo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'cosmetics' },
      }),
    );
  });
});
