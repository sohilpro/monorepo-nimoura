import { describe, it, expect, vi } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ProductsService } from '../../../src/modules/products/products.service';
import { ProductFilterQueryDto } from '../../../src/modules/products/dtos/product-query.dto';
import { EFFECTIVE_PRICE_SQL } from '../../../src/modules/products/product-listing-filters.service';

function makeQb(rows: any[] = [], total = 0) {
  const qb: any = {
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    addOrderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getMany: vi.fn().mockResolvedValue(rows),
    getManyAndCount: vi.fn().mockResolvedValue([rows, total]),
  };
  return qb;
}

function makeService(productQb: any, overrides: Record<string, any> = {}) {
  const brandRepo = {
    findOne: vi
      .fn()
      .mockResolvedValue({ id: 7, name: 'Test Brand', slug: 'test-brand' }),
  };
  const subBrandRepo = {
    findOne: vi.fn().mockResolvedValue(null),
  };
  const categoryRepo = {
    findOne: vi
      .fn()
      .mockResolvedValue({ id: 3, name: 'Test Cat', slug: 'test-cat' }),
  };

  const productRepo = {
    createQueryBuilder: vi.fn().mockReturnValue(productQb),
    manager: {
      getRepository: vi.fn((entity: any) => {
        if (entity?.name === 'Brands') return brandRepo;
        if (entity?.name === 'SubBrands') return subBrandRepo;
        if (entity?.name === 'Categories') return categoryRepo;
        return {};
      }),
    },
  } as any;

  const listingFilters = overrides.listingFilters ?? {
    apply: vi.fn().mockResolvedValue(undefined),
  };
  const categoryTree = overrides.categoryTree ?? {
    getTreeIds: vi.fn().mockResolvedValue([3, 4]),
  };

  return {
    service: new ProductsService(
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
      categoryTree,
    ),
    listingFilters,
    categoryTree,
  };
}

describe('ProductFilterQueryDto sort validation', () => {
  it.each(['popular', 'newest', 'cheapest', 'expensive'] as const)(
    'accepts storefront sort "%s"',
    async (sort) => {
      const dto = plainToInstance(ProductFilterQueryDto, { sort });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    },
  );

  it.each(['latest', 'bestseller'])('rejects invalid sort "%s"', async (sort) => {
    const dto = plainToInstance(ProductFilterQueryDto, { sort });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('ProductsService sorting and filtering', () => {
  it('sorts cheapest and expensive by effective discounted price', async () => {
    const qbCheap = makeQb([], 0);
    const { service: sCheap } = makeService(qbCheap);
    await sCheap.findAllActive({ sort: 'cheapest' });

    expect(qbCheap.addSelect).toHaveBeenCalledWith(
      EFFECTIVE_PRICE_SQL,
      'effective_price',
    );
    expect(qbCheap.orderBy).toHaveBeenCalledWith('effective_price', 'ASC');

    const qbExpensive = makeQb([], 0);
    const { service: sExpensive } = makeService(qbExpensive);
    await sExpensive.findAllActive({ sort: 'expensive' });

    expect(qbExpensive.orderBy).toHaveBeenCalledWith('effective_price', 'DESC');
  });

  it('sorts popular by averageRating and ratingsCount', async () => {
    const qb = makeQb([], 0);
    const { service } = makeService(qb);
    await service.findAllActive({ sort: 'popular' });

    expect(qb.orderBy).toHaveBeenCalledWith('p.averageRating', 'DESC');
    expect(qb.addOrderBy).toHaveBeenCalledWith('p.ratingsCount', 'DESC');
  });

  it('applies filters and sort in findByBrand including category tree, tags, onSale and inStock', async () => {
    const qb = makeQb([], 0);
    const { service, listingFilters, categoryTree } = makeService(qb);

    await service.findByBrand('test-brand', {
      sort: 'cheapest',
      categoryId: 3,
      tags: [10, 11],
      onSale: true,
      isAvailable: 'true',
      minPrice: 100000,
      maxPrice: 500000,
    });

    expect(categoryTree.getTreeIds).toHaveBeenCalledWith(3);
    expect(listingFilters.apply).toHaveBeenCalledWith(qb, {
      search: undefined,
      subBrandId: undefined,
      categoryIds: [3, 4],
      minPrice: 100000,
      maxPrice: 500000,
      inStock: true,
      onSale: true,
      tagIds: [10, 11],
    });
    expect(qb.orderBy).toHaveBeenCalledWith('effective_price', 'ASC');
  });

  it('applies filters and explicit sort in findAmazing, defaulting to daily_shuffle when sort is omitted', async () => {
    const qbSorted = makeQb([], 0);
    const { service: sSorted, listingFilters } = makeService(qbSorted);

    await sSorted.findAmazing({
      sort: 'popular',
      onSale: true,
      tags: [5],
    });

    expect(listingFilters.apply).toHaveBeenCalledWith(
      qbSorted,
      expect.objectContaining({
        onSale: true,
        tagIds: [5],
      }),
    );
    expect(qbSorted.orderBy).toHaveBeenCalledWith('p.averageRating', 'DESC');

    const qbDefault = makeQb([], 0);
    const { service: sDefault } = makeService(qbDefault);
    await sDefault.findAmazing({});

    expect(qbDefault.orderBy).toHaveBeenCalledWith('daily_shuffle', 'ASC');
  });
});
