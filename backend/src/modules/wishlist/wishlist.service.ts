import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Products } from '../products/entities/products.entity';

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
      relations: { product: true },
      order: { createdAt: 'DESC' },
    });

    return {
      items: items.map((i) => i.product),
      total: items.length,
    };
  }

  async count(userId: number): Promise<number> {
    return this.wishlistRepo.count({ where: { user: { id: userId } } });
  }

  async add(userId: number, productId: number) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('محصول یافت نشد.');

    const existing = await this.wishlistRepo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    if (existing) {
      throw new ConflictException(
        'این محصول قبلاً به علاقه‌مندی‌ها اضافه شده است.',
      );
    }

    const wishlistItem = this.wishlistRepo.create({
      user: { id: userId } as any,
      product: { id: productId } as any,
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
    });

    if (existing) {
      await this.wishlistRepo.remove(existing);
      return { message: 'محصول از علاقه‌مندی‌ها حذف شد.', inWishlist: false };
    }

    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('محصول یافت نشد.');

    const wishlistItem = this.wishlistRepo.create({
      user: { id: userId } as any,
      product: { id: productId } as any,
    });
    await this.wishlistRepo.save(wishlistItem);

    return { message: 'محصول به علاقه‌مندی‌ها اضافه شد.', inWishlist: true };
  }
}
