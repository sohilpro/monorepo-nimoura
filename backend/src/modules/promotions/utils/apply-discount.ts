import { Promotions, PromotionType } from "../entities/promotion.entity";

export function calculateDiscountAmount(
  promotion: Promotions,
  cartTotal: number
): number {
  let discount = 0;

  if (promotion.type === PromotionType.PERCENTAGE) {
    discount = Math.floor((promotion.amount / 100) * cartTotal);
  } else if (promotion.type === PromotionType.FIXED) {
    discount = promotion.amount;
  }

  // اگر maxAmount تعریف شده بود → سقف تخفیف
  if (promotion.maxAmount && discount > promotion.maxAmount) {
    discount = promotion.maxAmount;
  }

  // تخفیف بیشتر از مبلغ سبد خرید نشه
  if (discount > cartTotal) {
    discount = cartTotal;
  }

  return discount;
}
