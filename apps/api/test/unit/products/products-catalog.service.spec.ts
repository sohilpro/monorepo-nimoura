import { describe, it, expect, vi } from 'vitest';
import { ProductsService } from '../../../src/modules/products/products.service';
import { CategoryService } from '../../../src/modules/categories/categories.service';
import { BrandsService } from '../../../src/modules/brands/brands.service';

describe('Products, Categories & Brands Service Projections', () => {
  function makeQb(rows: any[] = [], total = 0) {
    const qb: any = {
      select: vi.fn().mockReturnThis(),
      addSelect: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue(rows),
      getManyAndCount: vi.fn().mockResolvedValue([rows, total]),
      getRawAndEntities: vi.fn().mockResolvedValue({ entities: rows, raw: [] }),
    };
    return qb;
  }

  it('ProductsService.findAllActive should select only card fields (no introduce/howToUse/shortDescription/specifications)', async () => {
    const productQb = makeQb([], 0);
    const productRepo = { createQueryBuilder: vi.fn().mockReturnValue(productQb) } as any;
    const listingFilters = { apply: vi.fn().mockResolvedValue(undefined) } as any;

    const service = new ProductsService(
      productRepo,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      listingFilters,
      {} as any,
    );

    const res = await service.findAllActive({ page: 1, limit: 12 });

    expect(productQb.select).toHaveBeenCalled();
    const selectedCols = productQb.select.mock.calls[0][0] as string[];
    expect(selectedCols).not.toContain('p.introduce');
    expect(selectedCols).not.toContain('p.howToUse');
    expect(selectedCols).not.toContain('p.shortDescription');
    expect(selectedCols).not.toContain('p.specifications');
    expect(res.meta).toEqual({ total: 0, page: 1, limit: 12, totalPages: 0 });
  });

  it('ProductsService.findAllForAdmin should select only table/export columns without heavy HTML fields', async () => {
    const productQb = makeQb([], 0);
    const productRepo = { createQueryBuilder: vi.fn().mockReturnValue(productQb) } as any;

    const service = new ProductsService(
      productRepo,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.findAllForAdmin({ page: 1, limit: 10 });

    expect(productQb.select).toHaveBeenCalled();
    const selectedCols = productQb.select.mock.calls[0][0] as string[];
    expect(selectedCols).not.toContain('p.introduce');
    expect(selectedCols).not.toContain('p.howToUse');
    expect(selectedCols).not.toContain('p.shortDescription');
    expect(selectedCols).not.toContain('p.specifications');
    expect(selectedCols).not.toContain('c.seoText');
    expect(selectedCols).not.toContain('b.description');
  });

  it('CategoryService.getCategoryTree should select minimal tree fields without redundant children join', async () => {
    const rawCats = [
      { id: 1, name: 'آرایشی', slug: 'makeup', parent: null },
      { id: 2, name: 'رژ لب', slug: 'lipstick', parent: { id: 1 } },
    ];
    const qb = makeQb(rawCats);
    const categoryRepo = { createQueryBuilder: vi.fn().mockReturnValue(qb) } as any;

    const service = new CategoryService(categoryRepo);
    const tree = await service.getCategoryTree();

    expect(qb.select).toHaveBeenCalled();
    expect(qb.leftJoinAndSelect).not.toHaveBeenCalledWith('category.children', expect.anything());
    expect(tree).toEqual([
      {
        id: 1,
        name: 'آرایشی',
        slug: 'makeup',
        parentId: null,
        children: [
          {
            id: 2,
            name: 'رژ لب',
            slug: 'lipstick',
            parentId: 1,
            children: [],
          },
        ],
      },
    ]);
  });

  it('BrandsService.findAll should use explicit select excluding deletedAt and heavy description', async () => {
    const brandRepo = {
      findAndCount: vi.fn().mockResolvedValue([[], 0]),
    } as any;

    const service = new BrandsService(brandRepo, {} as any, {} as any, {} as any);
    await service.findAll({ page: 1, limit: 10 });

    const opts = brandRepo.findAndCount.mock.calls[0][0];
    expect(opts.loadEagerRelations).toBe(false);
    expect(opts.select).toBeDefined();
    expect(opts.select.deletedAt).toBeUndefined();
    expect(opts.select.description).toBeUndefined();
  });
});
