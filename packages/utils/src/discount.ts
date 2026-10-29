export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number,
): number {
  if (!originalPrice || originalPrice <= 0) return 0;
  if (!discountedPrice || discountedPrice >= originalPrice) return 0;

  const percentage = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage)));
}

export function calculateDiscountAmount(
  originalPrice: number,
  discountedPrice: number,
): number {
  if (!originalPrice || !discountedPrice) return 0;
  return Math.max(0, originalPrice - discountedPrice);
}
