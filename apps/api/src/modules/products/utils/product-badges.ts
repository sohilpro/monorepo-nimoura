export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type ProductBadgeType =
  | 'out_of_stock'
  | 'low_stock'
  | 'discount'
  | 'amazing_offer'
  | 'new'
  | 'bundle';
export type ProductBadgeTone =
  'danger' | 'warning' | 'success' | 'info' | 'neutral';

export interface ProductBadge {
  type: ProductBadgeType;
  label: string;
  tone: ProductBadgeTone;
  /** Numeric payload, e.g. remaining stock or discount percent. */
  value?: number;
}

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;
export const NEW_PRODUCT_DAYS = 14;

export interface BadgeSource {
  type?: string;
  stock?: number | null;
  isAvailable?: boolean | null;
  lowStockThreshold?: number | null;
  price?: number | null;
  priceDiscount?: number | null;
  isAmazingOffer?: boolean | null;
  createdAt?: Date | string | null;
}

const toFa = (n: number) =>
  String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

export function getDiscountPercent(p: BadgeSource): number {
  const price = Number(p.price) || 0;
  const discount = Number(p.priceDiscount) || 0;
  if (price > 0 && discount > 0 && discount < price) {
    return Math.round(((price - discount) / price) * 100);
  }
  return 0;
}

export function getStockStatus(p: BadgeSource): StockStatus {
  const stock = Number(p.stock) || 0;
  if (p.isAvailable === false || stock <= 0) return 'out_of_stock';
  const threshold = p.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
  return threshold > 0 && stock <= threshold ? 'low_stock' : 'in_stock';
}

/**
 * Automatic storefront badges, derived from product data (nothing is stored).
 * Ordered by importance so the UI can simply show the first one or two.
 */
export function buildProductBadges(
  p: BadgeSource,
  now: Date = new Date(),
): ProductBadge[] {
  const badges: ProductBadge[] = [];
  const status = getStockStatus(p);

  if (status === 'out_of_stock') {
    badges.push({ type: 'out_of_stock', label: 'ناموجود', tone: 'danger' });
  } else if (status === 'low_stock') {
    const stock = Number(p.stock);
    badges.push({
      type: 'low_stock',
      label: `تنها ${toFa(stock)} عدد در انبار باقی مانده`,
      tone: 'warning',
      value: stock,
    });
  }

  const percent = getDiscountPercent(p);
  if (percent > 0) {
    badges.push({
      type: 'discount',
      label: `${toFa(percent)}٪ تخفیف`,
      tone: 'danger',
      value: percent,
    });
  }

  if (p.isAmazingOffer) {
    badges.push({
      type: 'amazing_offer',
      label: 'پیشنهاد شگفت‌انگیز',
      tone: 'warning',
    });
  }

  if (p.createdAt) {
    const ageDays =
      (now.getTime() - new Date(p.createdAt).getTime()) / 86_400_000;
    if (ageDays >= 0 && ageDays <= NEW_PRODUCT_DAYS) {
      badges.push({ type: 'new', label: 'جدید', tone: 'success' });
    }
  }

  if (p.type === 'bundle') {
    badges.push({ type: 'bundle', label: 'پک ویژه', tone: 'info' });
  }

  return badges;
}
