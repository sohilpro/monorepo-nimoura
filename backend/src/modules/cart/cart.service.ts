import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Products } from '../products/entities/products.entity';
import { ProductVariants } from '../products/entities/product-variants.entity';
import { SyncCartDto } from './dtos/sync-cart.dto';
import { ProductPriceTiers } from '../products/entities/product-price-tiers.entity';

export interface ValidateCartItemDto {
  productId: number;
  quantity: number;
  clientPrice: number;
  variantId?: number | null;
}

export interface PriceValidationDetail {
  productId: number;
  title: string;
  oldPrice: number;
  currentPrice: number;
  isPriceChanged: boolean;
  variantId: number | null;
  quantity?: number; // اضافه شد
  totalPrice?: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private itemRepo: Repository<CartItem>,

    @InjectRepository(Products)
    private productRepo: Repository<Products>,

    @InjectRepository(ProductVariants)
    private variantRepo: Repository<ProductVariants>,
  ) {}

  /**
   * متد کمکی محاسبه قیمت واحد موثر (تکی، تخفیف‌دار یا عمده پلکانی)
   */
  private calculateUnitPrice(
    quantity: number,
    product: Products,
    variant?: ProductVariants | null,
  ): number {
    const target = variant || product;

    // ۱. قیمت پایه تکی با تضمین خروجی عددی (اولویت با تخفیف تکی)
    const price = Number(target.price || 0);
    const priceDiscount = Number(target.priceDiscount || 0);

    const basePrice = priceDiscount > 0 ? priceDiscount : price;

    const tiers: ProductPriceTiers[] = target.priceTiers || [];

    if (!tiers || tiers.length === 0) {
      return basePrice;
    }

    // ۲. فیلتر پله‌هایی که تعداد به حدنصاب آن‌ها رسیده و انتخاب بالاترین پله
    const matchedTiers = tiers
      .filter((tier) => Number(quantity) >= Number(tier.minQuantity))
      .sort((a, b) => Number(b.minQuantity) - Number(a.minQuantity));

    if (matchedTiers.length > 0) {
      return Number(matchedTiers[0].price);
    }

    return basePrice;
  }

  async getCartByUser(userId: number): Promise<any> {
    let cart = await this.cartRepo
      .createQueryBuilder('cart')
      .leftJoin('cart.user', 'user')
      .leftJoinAndSelect('cart.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('product.priceTiers', 'prodTiers')
      .leftJoinAndSelect('item.variant', 'variant')
      .leftJoinAndSelect('variant.priceTiers', 'varTiers')
      .leftJoinAndSelect('variant.attributeValues', 'attrValue')
      .leftJoinAndSelect('attrValue.attribute', 'attr')
      .where('user.id = :userId', { userId })
      .orderBy('item.createdAt', 'ASC')
      .addOrderBy('item.id', 'ASC')
      .getOne();

    if (!cart) {
      cart = this.cartRepo.create({
        user: { id: userId } as any,
        items: [],
      });
      await this.cartRepo.save(cart);
    }

    // محاسبه مجموع ارقام سبد
    const totalItemsCount =
      cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const totalPrice =
      cart.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;

    return {
      ...cart,
      totalItemsCount,
      totalPrice, // مبلغ کل نهایی سبد با احتساب پله‌های عمده
    };
  }

  async addItemToCart(
    userId: number,
    productId: number,
    quantity: number,
    variantId?: number | null,
  ): Promise<CartItem> {
    if (quantity <= 0) {
      throw new BadRequestException('تعداد درخواستی باید بزرگتر از صفر باشد.');
    }

    // ۱. دریافت یا ایجاد سبد خرید کاربر
    let cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: {
        items: {
          product: true,
          variant: true,
        },
      },
    });

    if (!cart) {
      cart = this.cartRepo.create({ user: { id: userId }, items: [] });
      await this.cartRepo.save(cart);
    }

    // ۲. بارگذاری محصول به همراه پله‌های قیمتی و واریانت‌ها
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: {
        priceTiers: true,
        variants: {
          priceTiers: true,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('محصول مورد نظر یافت نشد.');
    }

    // ۳. بررسی و انتخاب واریانت در صورت وجود
    let variantEntity: ProductVariants | null = null;

    if (variantId) {
      variantEntity = await this.variantRepo.findOne({
        where: { id: variantId },
        relations: { product: true, priceTiers: true },
      });

      if (!variantEntity) {
        throw new NotFoundException('تنوع انتخاب‌شده یافت نشد.');
      }

      if (variantEntity.product?.id !== productId) {
        throw new BadRequestException(
          'این تنوع متعلق به محصول انتخاب‌شده نیست.',
        );
      }

      if (!variantEntity.isAvailable) {
        throw new BadRequestException('این تنوع در حال حاضر غیرفعال است.');
      }
    } else {
      if (product.variants && product.variants.length > 0) {
        throw new BadRequestException(
          'لطفاً یکی از تنوع‌های محصول را انتخاب کنید.',
        );
      }
    }

    // ۴. بررسی وجود آیتم مشابه در سبد خرید
    const existingItem = cart.items.find((item) => {
      if (item.product.id !== productId) return false;

      const itemVariantId = item.variant?.id ?? null;
      const targetVariantId = variantEntity?.id ?? null;

      return itemVariantId === targetVariantId;
    });

    const targetStock = variantEntity
      ? variantEntity.stock
      : ((product as any).stock ?? 0);

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    // ۵. بررسی موجودی انبار
    if (targetStock < newQuantity) {
      throw new BadRequestException(
        `موجودی کافی نیست. حداکثر تعداد قابل سفارش: ${targetStock}`,
      );
    }

    // ۶. محاسبه قیمت واحد عمده/تکی متناسب با تعداد نهایی
    const unitPrice = this.calculateUnitPrice(
      newQuantity,
      product,
      variantEntity,
    );
    const totalPrice = unitPrice * newQuantity;

    // ۷. ذخیره آیتم
    if (existingItem) {
      existingItem.quantity = newQuantity;
      existingItem.unitPrice = unitPrice;
      existingItem.totalPrice = totalPrice;
      return await this.itemRepo.save(existingItem);
    }

    const newItem = this.itemRepo.create({
      cart,
      product,
      variant: variantEntity || undefined,
      quantity: newQuantity,
      unitPrice,
      totalPrice,
    });

    return await this.itemRepo.save(newItem);
  }

  async updateQuantity(
    userId: number,
    productId: number,
    quantity: number,
    variant?: number | { id?: number; sku?: string; label?: string } | null,
  ): Promise<any> {
    const targetVariantId =
      typeof variant === 'number'
        ? variant
        : variant && typeof variant === 'object' && variant.id
          ? variant.id
          : null;

    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: {
        items: {
          product: { priceTiers: true },
          variant: { priceTiers: true },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('سبد خرید پیدا نشد.');
    }

    const targetItem = cart.items.find((item) => {
      if (item.product.id !== productId) return false;

      const itemVariantId = item.variant?.id ?? null;
      return itemVariantId === targetVariantId;
    });

    if (!targetItem) {
      throw new NotFoundException('آیتم مورد نظر در سبد خرید یافت نشد.');
    }

    // حذف آیتم در صورت صفر شدن تعداد
    if (quantity <= 0) {
      await this.itemRepo.remove(targetItem);
      return {
        message: 'آیتم از سبد خرید حذف شد.',
        deletedItemId: targetItem.id,
      };
    }

    // بررسی موجودی انبار
    const maxStock = targetItem.variant
      ? targetItem.variant.stock
      : ((targetItem.product as any).stock ?? 0);

    if (quantity > maxStock) {
      throw new BadRequestException(
        `تعداد انتخابی بیشتر از موجودی انبار است. حداکثر موجودی: ${maxStock}`,
      );
    }

    // باز‌محاسبه قیمت واحد به ازای تعداد جدید بر اساس پله‌ها
    const unitPrice = this.calculateUnitPrice(
      quantity,
      targetItem.product,
      targetItem.variant,
    );

    targetItem.quantity = quantity;
    targetItem.unitPrice = unitPrice;
    targetItem.totalPrice = unitPrice * quantity;

    return await this.itemRepo.save(targetItem);
  }

  async removeItem(
    userId: number,
    productId: number,
    variantId?: number | null,
  ): Promise<any> {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: {
        items: {
          product: true,
          variant: true,
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('سبد خرید پیدا نشد.');
    }

    const targetVariantId = variantId ? Number(variantId) : null;

    const itemIndex = cart.items.findIndex((item) => {
      if (item.product.id !== productId) return false;

      const itemVariantId = item.variant?.id ?? null;
      return itemVariantId === targetVariantId;
    });

    if (itemIndex === -1) {
      throw new NotFoundException('آیتم در سبد خرید یافت نشد.');
    }

    const itemToRemove = cart.items[itemIndex];
    await this.itemRepo.remove(itemToRemove);

    return {
      message: 'آیتم با موفقیت از سبد خرید حذف شد.',
      removedItemId: itemToRemove.id,
    };
  }

  async syncCart(userId: number, dto: SyncCartDto): Promise<any> {
    const { guestId, items } = dto;

    let userCart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: {
        items: {
          product: { priceTiers: true },
          variant: { priceTiers: true },
        },
      },
    });

    if (!userCart) {
      userCart = this.cartRepo.create({
        user: { id: userId },
        items: [],
      });
      userCart = await this.cartRepo.save(userCart);
    }

    if (!items || items.length === 0) {
      await this.cleanupGuestCart(guestId);
      return {
        message: 'سبد خرید همگام‌سازی شد',
        items: userCart.items || [],
      };
    }

    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    const products = await this.productRepo.find({
      where: { id: In(productIds) },
      relations: {
        priceTiers: true,
        variants: {
          priceTiers: true,
        },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // مپ تجمیع اقلام با پذیرش null یا undefined برای variant
    const combinedItemsMap = new Map<
      string,
      { product: Products; variant?: ProductVariants | null; quantity: number }
    >();

    for (const existingItem of userCart.items || []) {
      const key = `${existingItem.product.id}_${existingItem.variant?.id ?? 'simple'}`;
      combinedItemsMap.set(key, {
        product: existingItem.product,
        variant: existingItem.variant ?? null,
        quantity: Number(existingItem.quantity || 1),
      });
    }

    // اضافه کردن اقلام مهمان به مپ
    for (const itemDto of items) {
      const product = productMap.get(itemDto.productId);
      if (!product) continue;

      let variantEntity: ProductVariants | undefined = undefined;
      const targetVariantId = itemDto.variantId ?? itemDto.variant?.id;

      if (targetVariantId) {
        variantEntity = product.variants?.find((v) => v.id === targetVariantId);
        if (!variantEntity || !variantEntity.isAvailable) continue;
      } else if (product.type === 'variant' && product.variants?.length) {
        continue;
      }

      const itemKey = `${product.id}_${variantEntity?.id ?? 'simple'}`;
      const qty = Math.max(Number(itemDto.quantity) || 1, 1);

      if (combinedItemsMap.has(itemKey)) {
        combinedItemsMap.get(itemKey)!.quantity += qty;
      } else {
        combinedItemsMap.set(itemKey, {
          product,
          variant: variantEntity,
          quantity: qty,
        });
      }
    }

    // حذف رکوردهای قبلی سبد کاربر و ذخیره رکوردهای تجمیع‌شده جدید با قیمت پلکانی قطعی
    if (userCart.items?.length) {
      await this.itemRepo.remove(userCart.items);
    }

    const finalCartItems: CartItem[] = [];

    for (const entry of combinedItemsMap.values()) {
      const unitPrice = this.calculateUnitPrice(
        entry.quantity,
        entry.product,
        entry.variant,
      );

      const cartItem = this.itemRepo.create({
        cart: userCart,
        product: entry.product,
        variant: entry.variant,
        quantity: entry.quantity,
        unitPrice,
        totalPrice: unitPrice * entry.quantity,
      });

      finalCartItems.push(cartItem);
    }

    if (finalCartItems.length > 0) {
      await this.itemRepo.save(finalCartItems);
    }

    await this.cleanupGuestCart(guestId);

    userCart.guestId = null as any;
    userCart.items = finalCartItems;
    await this.cartRepo.save(userCart);

    return {
      message: 'سبد خرید شما با موفقیت همگام‌سازی شد.',
      items: finalCartItems,
    };
  }

  private async cleanupGuestCart(guestId?: string): Promise<void> {
    if (!guestId) return;

    const guestCart = await this.cartRepo.findOne({
      where: { guestId },
      relations: { items: true },
    });

    if (guestCart) {
      if (guestCart.items?.length) {
        await this.itemRepo.remove(guestCart.items);
      }
      await this.cartRepo.remove(guestCart);
    }
  }

  async validateCartPrices(items: ValidateCartItemDto[]): Promise<{
    pricesChanged: boolean;
    details: PriceValidationDetail[];
  }> {
    if (!items || !items.length) {
      return {
        pricesChanged: false,
        details: [],
      };
    }

    const productIds = Array.from(new Set(items.map((item) => item.productId)));

    const products = await this.productRepo.find({
      where: { id: In(productIds) },
      relations: {
        priceTiers: true,
        variants: {
          priceTiers: true,
        },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const result: PriceValidationDetail[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new NotFoundException(
          `محصول با شناسه ${item.productId} پیدا نشد.`,
        );
      }

      if (!product.isAvailable) {
        throw new BadRequestException(
          `محصول «${product.title}» در حال حاضر غیرفعال یا ناموجود است.`,
        );
      }

      let selectedVariant: ProductVariants | null = null;
      const targetVariantId = item.variantId ?? (item as any).variant?.id;

      if (targetVariantId) {
        const variantEntity = product.variants?.find(
          (v) => v.id === targetVariantId,
        );

        if (!variantEntity) {
          throw new BadRequestException(
            `تنوع با شناسه ${targetVariantId} برای محصول «${product.title}» معتبر نیست.`,
          );
        }

        if (!variantEntity.isAvailable) {
          throw new BadRequestException(
            `تنوع انتخاب‌شده برای محصول «${product.title}» غیرفعال است.`,
          );
        }

        selectedVariant = variantEntity;
      } else if (product.type === 'variant' && product.variants?.length) {
        throw new BadRequestException(
          `محصول «${product.title}» دارای تنوع است؛ لطفاً تنوع موردنظر را انتخاب کنید.`,
        );
      }

      const qty = Math.max(Number(item.quantity) || 1, 1);

      // محاسبه قیمت واحد رسمی و جاری بر اساس تعداد و پلکان عمده
      const currentPrice = this.calculateUnitPrice(
        qty,
        product,
        selectedVariant,
      );

      const clientPrice = Number(item.clientPrice || 0);
      const isPriceChanged = Math.abs(currentPrice - clientPrice) > 0.001;

      result.push({
        productId: product.id,
        title: product.title,
        oldPrice: clientPrice,
        currentPrice,
        quantity: qty,
        totalPrice: currentPrice * qty,
        isPriceChanged,
        variantId: selectedVariant?.id ?? null,
      });
    }

    return {
      pricesChanged: result.some((item) => item.isPriceChanged),
      details: result,
    };
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: { items: true },
    });
    if (!cart) return;
    await this.itemRepo.remove(cart.items);
  }
}
