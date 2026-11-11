import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Products } from '../products/entities/products.entity';
import {
  buildProductBadges,
  getDiscountPercent,
  getStockStatus,
} from '../products/utils/product-badges';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepo: Repository<Wishlist>,
    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,
  ) {}

  async getUserWishlist(userId: number) {
    const items = await this.wishlistRepo.find({
      where: { user: { id: userId } },
      select: {
        id: true,
        product: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          price: true,
          priceDiscount: true,
          percentageDiscount: true,
          stock: true,
          isAvailable: true,
          isAmazingOffer: true,
          lowStockThreshold: true,
          type: true,
          averageRating: true,
          ratingsCount: true,
          createdAt: true,
        },
      },
      relations: { product: true },
      order: { createdAt: 'DESC' },
      loadEagerRelations: false,
    });

    return {
      items: items.map((i) => ({
        ...i.product,
        discountPercent: getDiscountPercent(i.product),
        stockStatus: getStockStatus(i.product),
        badges: buildProductBadges(i.product),
      })),
      total: items.length,
    };
  }

  async count(userId: number): Promise<number> {
    return this.wishlistRepo.count({ where: { user: { id: userId } } });
  }

  async add(userId: number, productId: number) {
    const productExists = await this.productRepo.existsBy({ id: productId });
    if (!productExists) throw new NotFoundException('محصول یافت نشد.');

    const existing = await this.wishlistRepo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
      select: { id: true },
      loadEagerRelations: false,
    });
    if (existing) {
      throw new ConflictException(
        'این محصول قبلاً به علاقه‌مندی‌ها اضافه شده است.',
      );
    }

    const wishlistItem = this.wishlistRepo.create({
      user: { id: userId },
      product: { id: productId },
    });

    await this.wishlistRepo.save(wishlistItem);

    return { message: 'محصول به علاقه‌مندی‌ها اضافه شد.' };
  }

  async remove(userId: number, productId: number) {
    const result = await this.wishlistRepo.delete({
      user: { id: userId },
      product: { id: productId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('این محصول در لیست علاقه‌مندی‌های شما نیست.');
    }

    return { message: 'محصول از علاقه‌مندی‌ها حذف شد.' };
  }

  // برای دکمه‌ی قلب توی صفحه‌ی محصول: آیا این محصول قبلاً لایک شده؟
  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    const count = await this.wishlistRepo.count({
      where: { user: { id: userId }, product: { id: productId } },
    });
    return count > 0;
  }

  // toggle: هم برای دکمه‌ی قلب کاربردیه (یک کلیک، خودش تشخیص می‌ده اضافه کنه یا حذف)
  async toggle(userId: number, productId: number) {
    const existing = await this.wishlistRepo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
      select: { id: true },
      loadEagerRelations: false,
    });

    if (existing) {
      await this.wishlistRepo.remove(existing);
      return { message: 'محصول از علاقه‌مندی‌ها حذف شد.', inWishlist: false };
    }

    const productExists = await this.productRepo.existsBy({ id: productId });
    if (!productExists) throw new NotFoundException('محصول یافت نشد.');

    const wishlistItem = this.wishlistRepo.create({
      user: { id: userId },
      product: { id: productId },
    });
    await this.wishlistRepo.save(wishlistItem);

    return { message: 'محصول به علاقه‌مندی‌ها اضافه شد.', inWishlist: true };
  }
}
