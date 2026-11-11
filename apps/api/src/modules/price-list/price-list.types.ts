export interface PriceListRow {
  key: string;
  productId: number;
  slug: string;
  title: string;
  variantLabel: string | null; // مثلا «۲ سانتی‌متر»
  sku: string;
  brandId: number | null;
  brand: string;
  categoryId: number | null;
  category: string;
  price: number; // قیمت اصلی
  finalPrice: number; // قیمت نهایی خرده‌فروشی (بعد از تخفیف)
  discountPercent: number; // محاسبه‌شده، نه از ستون percentageDiscount
  inStock: boolean;
  tiers: { minQuantity: number; price: number }[]; // قیمت عمده
}

export interface PriceListResponse {
  rows: PriceListRow[];
  meta: { total: number; lastUpdated: Date | null };
}
