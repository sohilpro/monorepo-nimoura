import { ProductPriceTiers } from "src/modules/products/entities/product-price-tiers.entity";


export function calculateEffectiveUnitPrice(
  quantity: number,
  basePrice: number, // قیمت اصلی یا قیمت با تخفیف تکی (priceDiscount یا price)
  priceTiers?: ProductPriceTiers[],
): number {
  if (!priceTiers || priceTiers.length === 0) {
    return basePrice;
  }

  // فیلتر پله‌هایی که تعداد درخواستی به حد نصاب آن‌ها رسیده و سورت نزولی
  const matchedTiers = priceTiers
    .filter((tier) => quantity >= tier.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity);

  // اگر حداقل به اولین پله رسیده باشد، بالاترین پله منطبق اعمال می‌شود
  if (matchedTiers.length > 0) {
    return matchedTiers[0].price;
  }

  return basePrice;
}