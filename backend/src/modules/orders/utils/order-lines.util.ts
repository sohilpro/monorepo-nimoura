import { BadRequestException } from '@nestjs/common';
import { Products } from 'src/modules/products/entities/products.entity';
import { ProductVariants } from 'src/modules/products/entities/product-variants.entity';
import { OrderItemDto } from '../dtos/create-order.dto';
import { OrderItems } from '../entities/order-items.entity';

/** یک سطر نرمال‌شده‌ی سفارش (مستقل از DTO و Entity) */
export interface OrderLine {
  productId: number;
  variantId: number | null;
  quantity: number;
  unitPrice: number;
  title: string;
}

/** آیتم درخواستی (از فروشگاه یا پنل ادمین) پیش از اعتبارسنجی */
export interface RequestedItem {
  productId: number;
  variantId?: number | null;
  quantity: number;
  /** فقط ادمین می‌تواند قیمت را دستی تعیین کند */
  unitPrice?: number;
}

export const lineKey = (l: Pick<OrderLine, 'productId' | 'variantId'>) =>
  `${l.productId}:${l.variantId ?? 0}`;

export function pickDefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

/** آیتم فروشگاه (variantId یا variant قدیمی) را به RequestedItem نرمال می‌کند */
export function toRequestedItem(dto: OrderItemDto): RequestedItem {
  return {
    productId: dto.productId,
    quantity: dto.quantity,
    variantId: dto.variantId ?? dto.variant ?? null,
  };
}

export function toLines(items: OrderItems[]): OrderLine[] {
  return items.map((i) => ({
    productId: i.product.id,
    variantId: i.variant?.id ?? null,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    title: i.product.title,
  }));
}

/** قیمت واحد با احتساب تخفیف و پله‌های قیمتیِ تعداد */
export function resolveTierPrice(
  quantity: number,
  source: Products | ProductVariants,
): number {
  const basePrice =
    source.priceDiscount && source.priceDiscount > 0
      ? Number(source.priceDiscount)
      : Number(source.price);

  const bestTier = (source.priceTiers ?? [])
    .filter((t) => quantity >= t.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  return Math.round(bestTier ? Number(bestTier.price) : basePrice);
}

export function linesDiffer(a: OrderLine[], b: OrderLine[]): boolean {
  if (a.length !== b.length) return true;
  const byKey = new Map(a.map((l) => [lineKey(l), l]));
  return b.some((l) => {
    const old = byKey.get(lineKey(l));
    return !old || old.quantity !== l.quantity || old.unitPrice !== l.unitPrice;
  });
}

/** اختلاف تعدادها؛ مبنای رزرو/آزادسازی موجودی هنگام ویرایش */
export function diffLines(oldLines: OrderLine[], newLines: OrderLine[]) {
  const oldMap = new Map(oldLines.map((l) => [lineKey(l), l]));
  const newMap = new Map(newLines.map((l) => [lineKey(l), l]));
  const reserve: OrderLine[] = [];
  const release: OrderLine[] = [];

  for (const [key, line] of newMap) {
    const delta = line.quantity - (oldMap.get(key)?.quantity ?? 0);
    if (delta > 0) reserve.push({ ...line, quantity: delta });
    if (delta < 0) release.push({ ...line, quantity: -delta });
  }
  for (const [key, line] of oldMap) {
    if (!newMap.has(key)) release.push(line);
  }
  return { reserve, release };
}

export function calcTotals(
  lines: OrderLine[],
  shippingCost: number,
  discount: number,
) {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  if (discount > subtotal + shippingCost) {
    throw new BadRequestException('تخفیف نمی‌تواند بیشتر از مبلغ سفارش باشد');
  }
  return { subtotal, finalTotal: subtotal + shippingCost - discount };
}