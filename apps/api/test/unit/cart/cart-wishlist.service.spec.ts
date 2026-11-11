import { describe, it, expect, vi } from 'vitest';
import { CartService } from '../../../src/modules/cart/cart.service';
import { WishlistService } from '../../../src/modules/wishlist/wishlist.service';
import { PromotionsService } from '../../../src/modules/promotions/promotions.service';
import { PromotionType } from '../../../src/modules/promotions/entities/promotion.entity';

describe('Cart, Wishlist & Promotions Service Projections', () => {
  it('CartService.getCartByUser should select minimal product/variant fields without heavy columns', async () => {
    const cartRow = {
      id: 1,
      isPromotional: false,
      items: [
        {
          id: 10,
          quantity: 2,
          unitPrice: 120000,
          totalPrice: 240000,
          product: {
            id: 5,
            title: 'سرم پوست',
            slug: 'serum',
            thumbnail: '/t.webp',
            price: 150000,
            priceDiscount: 120000,
            stock: 8,
            isAvailable: true,
            type: 'simple',
            priceTiers: [],
          },
          variant: null,
        },
      ],
    };

    const qb: any = {
      select: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      getOne: vi.fn().mockResolvedValue(cartRow),
    };

    const cartRepo = { createQueryBuilder: vi.fn().mockReturnValue(qb) } as any;
    const service = new CartService(cartRepo, {} as any, {} as any, {} as any);

    const res = await service.getCartByUser(3);

    expect(qb.select).toHaveBeenCalled();
    expect(res.totalItemsCount).toBe(2);
    expect(res.totalPrice).toBe(240000);
    expect(res.items[0].product).not.toHaveProperty('introduce');
    expect(res.items[0].product).not.toHaveProperty('howToUse');
    expect(res.items[0].product).not.toHaveProperty('specifications');
  });

  it('WishlistService.getUserWishlist should project product card fields and compute badges without eager cascade', async () => {
    const wishlistRows = [
      {
        id: 1,
        product: {
          id: 14,
          title: 'کرم ضد آفتاب',
          slug: 'sunscreen',
          thumbnail: '/sun.webp',
          price: 200000,
          priceDiscount: 150000,
          percentageDiscount: 25,
          stock: 10,
          isAvailable: true,
          isAmazingOffer: true,
          lowStockThreshold: 5,
          type: 'simple',
          averageRating: 4.5,
          ratingsCount: 12,
          createdAt: new Date(),
        },
      },
    ];

    const wishlistRepo = {
      find: vi.fn().mockResolvedValue(wishlistRows),
    } as any;
    const service = new WishlistService(wishlistRepo, {} as any);

    const res = await service.getUserWishlist(8);

    const opts = wishlistRepo.find.mock.calls[0][0];
    expect(opts.loadEagerRelations).toBe(false);
    expect(opts.select.product).not.toHaveProperty('introduce');
    expect(opts.select.product).not.toHaveProperty('howToUse');
    expect(res.total).toBe(1);
    expect(res.items[0]).toMatchObject({
      id: 14,
      title: 'کرم ضد آفتاب',
      discountPercent: 25,
      stockStatus: 'in_stock',
    });
  });

  it('WishlistService.add should check product existence with existsBy instead of full entity fetch', async () => {
    const wishlistRepo = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn((x) => x),
      save: vi.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const productRepo = {
      existsBy: vi.fn().mockResolvedValue(true),
    } as any;

    const service = new WishlistService(wishlistRepo, productRepo);
    const res = await service.add(2, 99);

    expect(productRepo.existsBy).toHaveBeenCalledWith({ id: 99 });
    expect(res).toEqual({ message: 'محصول به علاقه‌مندی‌ها اضافه شد.' });
  });

  it('PromotionsService.findAll should not load products, categories or brands relations', async () => {
    const promoRepo = {
      findAndCount: vi.fn().mockResolvedValue([[], 0]),
    } as any;

    const service = new PromotionsService(
      promoRepo,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.findAll({ page: 1, limit: 10 });

    const opts = promoRepo.findAndCount.mock.calls[0][0];
    expect(opts.relations).toBeUndefined();
    expect(opts.loadEagerRelations).toBe(false);
    expect(opts.select).not.toHaveProperty('deletedAt');
  });

  it('PromotionsService.applyDiscountToCart should verify allowedUsers without loading full user entities', async () => {
    const promo = {
      id: 4,
      promoCode: 'VIP20',
      isActive: true,
      type: PromotionType.PERCENTAGE,
      amount: 20,
      startDate: new Date(Date.now() - 60_000),
      endDate: new Date(Date.now() + 60_000),
      minOrderAmount: 0,
      maxTotalUses: 100,
      totalUsed: 1,
      maxUsesPerUser: 5,
      maxAmount: null,
    };

    const promoQb: any = {
      innerJoin: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      addSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      setParameter: vi.fn().mockReturnThis(),
      getRawOne: vi.fn().mockResolvedValue({ total: '1', matched: '1' }),
    };

    const promoRepo = {
      findOne: vi.fn().mockResolvedValue(promo),
      createQueryBuilder: vi.fn().mockReturnValue(promoQb),
    } as any;
    const usageRepo = {
      findOne: vi.fn().mockResolvedValue({ usedCount: 0 }),
    } as any;

    const service = new PromotionsService(
      promoRepo,
      usageRepo,
      {} as any,
      {} as any,
      {} as any,
    );

    const res = await service.applyDiscountToCart({ promoCode: 'VIP20', cartTotal: 100000 }, 15);
    expect(res.discountAmount).toBe(20000);
    expect(res.finalTotal).toBe(80000);
    expect(promoRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ loadEagerRelations: false }),
    );
  });
});
