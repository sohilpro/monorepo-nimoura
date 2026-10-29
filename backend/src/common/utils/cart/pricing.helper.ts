// src/modules/cart/utils/pricing.helper.ts
import { Products } from 'src/modules/products/entities/products.entity';
import { ProductVariants } from 'src/modules/products/entities/product-variants.entity';

export function resolveEffectiveUnitPrice(
  quantity: number,
  product: Products,
  variant?: ProductVariants | null,
): number {
  const targetEntity = variant || product;

  // قیمت پایه تکی: اولویت با قیمت تخفیف‌دار و در غیر این صورت قیمت اصلی
  const basePrice =
    targetEntity.priceDiscount && targetEntity.priceDiscount > 0
      ? targetEntity.priceDiscount
      : targetEntity.price;

  const tiers = targetEntity.priceTiers || [];

  if (tiers.length === 0) {
    return basePrice;
  }

  // پیدا کردن بالاترین پله‌ای که تعداد درخواستی به آن رسیده است
  const qualifiedTiers = tiers
    .filter((tier) => quantity >= tier.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity);

  if (qualifiedTiers.length > 0) {
    return qualifiedTiers[0].price;
  }

  return basePrice;
}