import { describe, it, expect } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { ProductResponseDto } from 'src/modules/products/dtos/product-response.dto';
import {
  buildProductBadges,
  getDiscountPercent,
  getStockStatus,
} from 'src/modules/products/utils/product-badges';
import { parseIdList } from 'src/modules/tags/utils/parse-id-list';
import {
  normalizeName,
  uniqueSlug,
} from 'src/modules/tags/utils/tag-normalizer';

const NOW = new Date('2026-11-08T12:00:00Z');
const types = (p: Parameters<typeof buildProductBadges>[0]) =>
  buildProductBadges(p, NOW).map((b) => b.type);

describe('getStockStatus', () => {
  it('detects out of stock, low stock and in stock', () => {
    expect(getStockStatus({ stock: 0 })).toBe('out_of_stock');
    expect(getStockStatus({ stock: 10, isAvailable: false })).toBe(
      'out_of_stock',
    );
    expect(getStockStatus({ stock: 5 })).toBe('low_stock'); // default threshold is 5
    expect(getStockStatus({ stock: 6 })).toBe('in_stock');
  });

  it('respects a custom threshold and allows disabling it', () => {
    expect(getStockStatus({ stock: 20, lowStockThreshold: 20 })).toBe(
      'low_stock',
    );
    expect(getStockStatus({ stock: 1, lowStockThreshold: 0 })).toBe('in_stock');
  });
});

describe('buildProductBadges', () => {
  it('shows the remaining count in Persian digits', () => {
    const [badge] = buildProductBadges({ stock: 3 }, NOW);
    expect(badge).toMatchObject({
      type: 'low_stock',
      value: 3,
      label: 'تنها ۳ عدد در انبار باقی مانده',
    });
  });

  it('orders badges by importance', () => {
    expect(
      types({
        stock: 2,
        price: 100,
        priceDiscount: 80,
        isAmazingOffer: true,
        createdAt: '2026-11-05',
        type: 'bundle',
      }),
    ).toEqual(['low_stock', 'discount', 'amazing_offer', 'new', 'bundle']);
  });

  it('marks only recent products as new', () => {
    expect(types({ stock: 50, createdAt: '2026-11-01' })).toContain('new');
    expect(types({ stock: 50, createdAt: '2026-09-01' })).not.toContain('new');
  });

  it('ignores invalid discounts', () => {
    expect(getDiscountPercent({ price: 100, priceDiscount: 100 })).toBe(0);
    expect(getDiscountPercent({ price: 100, priceDiscount: 150 })).toBe(0);
    expect(getDiscountPercent({ price: 200, priceDiscount: 150 })).toBe(25);
  });
});

describe('tag utils', () => {
  it('parses id lists from query strings', () => {
    expect(parseIdList('3, 15,22,3')).toEqual([3, 15, 22]);
    expect(parseIdList(['4', 'x', '-1', '0', '7'])).toEqual([4, 7]);
    expect(parseIdList(undefined)).toEqual([]);
  });

  it('normalizes names and builds unique slugs', () => {
    expect(normalizeName('  پوست   چرب ')).toBe('پوست چرب');
    expect(uniqueSlug('oily', new Set(['oily', 'oily-2']))).toBe('oily-3');
    expect(uniqueSlug('dry', new Set(['oily']))).toBe('dry');
  });
});

describe('ProductResponseDto serialization', () => {
  it('exposes computed discountPercent even with excludeExtraneousValues', () => {
    const dto = plainToInstance(
      ProductResponseDto,
      {
        id: 1,
        title: 'Test Product',
        slug: 'test-product',
        sku: 'TEST-1',
        type: 'simple',
        price: 500000,
        priceDiscount: 400000,
        percentageDiscount: 0,
        stock: 10,
        isAvailable: true,
        isAmazingOffer: false,
        variants: [
          {
            id: 10,
            sku: 'TEST-1-V1',
            price: 200000,
            priceDiscount: 150000,
            percentageDiscount: 25,
            stock: 5,
            isAvailable: true,
            images: [],
            attributeValues: [],
          },
        ],
      },
      { excludeExtraneousValues: true },
    );

    expect(dto.discountPercent).toBe(20);
    expect(dto.variants[0]?.discountPercent).toBe(25);
  });

  it('returns 0 discountPercent when product has no valid discount', () => {
    const dto = plainToInstance(
      ProductResponseDto,
      {
        id: 2,
        title: 'No Discount',
        slug: 'no-discount',
        sku: 'TEST-2',
        type: 'simple',
        price: 300000,
        priceDiscount: 0,
        percentageDiscount: 0,
        stock: 5,
        isAvailable: true,
        isAmazingOffer: false,
      },
      { excludeExtraneousValues: true },
    );

    expect(dto.discountPercent).toBe(0);
  });
});
