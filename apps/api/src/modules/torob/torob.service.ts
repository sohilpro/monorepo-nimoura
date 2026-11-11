import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orders, OrderStatus } from 'src/modules/orders/entities/orders.entity';

// ترب مبلغ را به «تومان» می‌خواهد. اگر قیمت‌های دیتابیس ریال است 10 بگذارید.
const PRICE_DIVISOR = 1;

// ⚠️ ADAPT: آدرس صفحه‌ی محصول در Nuxt. باید دقیقاً همان آدرسی باشد که در فید/سایتمپ ترب دارید.
const productPath = (p: { id: number; slug?: string }) =>
  `/product/${p.slug ?? p.id}`;

const toToman = (v: number | string | null | undefined): number =>
  Math.round(Number(v ?? 0) / PRICE_DIVISOR);

// ISO با 6 رقم اعشار و Z (مثل نمونه‌ی ترب)
const toIso = (d: Date): string =>
  d.toISOString().replace(/\.(\d{3})Z$/, '.$1000Z');

function normalizePhone(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  let d = raw
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632))
    .replace(/\D/g, '');
  if (d.startsWith('0098')) d = d.slice(4);
  else if (d.startsWith('98')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  return /^9\d{9}$/.test(d) ? `0${d}` : undefined;
}

@Injectable()
export class TorobService {
  constructor(
    @InjectRepository(Orders) private readonly orders: Repository<Orders>,
    private readonly config: ConfigService,
  ) {}

  /** فقط آرایه‌ی سفارش‌ها را برمی‌گرداند؛ پوشش { success, data } در کنترلر است */
  async listOrders(purchaseTimestampGt: string, limit: number) {
    if (Number.isNaN(Date.parse(purchaseTimestampGt))) {
      throw new BadRequestException('Invalid purchase_timestamp_gt');
    }

    // رشته‌ی خام مستقیم به Postgres داده می‌شود تا میکروثانیه‌ی ورودی حفظ شود.
    const rows = await this.orders
      .createQueryBuilder('o')
      .select([
        'o.id',
        'o.status',
        'o.shippingCost',
        'o.finalTotal',
        'o.torobClid',
        'o.purchasedAt',
        'o.updatedAt',
        'item.id',
        'item.quantity',
        'item.unitPrice',
        'product.id',
        'product.slug',
        'shipping.id',
        'shipping.phone',
        'payment.id',
        'payment.method',
        'user.id',
        'user.mobile',
      ])
      .leftJoin('o.items', 'item')
      .leftJoin('item.product', 'product')
      .leftJoin('o.shippingInfo', 'shipping')
      .leftJoin('o.paymentInfo', 'payment')
      .leftJoin('o.user', 'user')
      .where('o.torobClid IS NOT NULL')
      .andWhere('o.purchasedAt IS NOT NULL')
      .andWhere('o.purchasedAt > CAST(:gt AS timestamptz)', {
        gt: purchaseTimestampGt,
      })
      .orderBy('o.purchasedAt', 'ASC')
      .addOrderBy('o.id', 'ASC')
      .take(limit)
      .getMany();

    return rows.map((o) => this.toTorobOrder(o));
  }

  private toTorobOrder(o: Orders) {
    const siteUrl = this.config.get<string>('SITE_URL')!.replace(/\/$/, '');

    const purchased = o.purchasedAt!;
    const updatedRaw: Date | undefined = o.updatedAt; // از CustomBaseEntity
    const updated =
      updatedRaw && updatedRaw > purchased ? updatedRaw : purchased;

    const shipping = toToman(o.shippingCost);
    // finalTotal = subtotal - discount + shippingCost  =>  این مقدار = subtotal - discount
    const orderValue = toToman(o.finalTotal) - shipping;

    const phone =
      normalizePhone(o.shippingInfo?.phone) ?? normalizePhone(o.user?.mobile);
    const psp = o.paymentInfo?.method as string | undefined;

    return {
      purchase_timestamp: toIso(purchased),
      last_updated_timestamp: toIso(updated),
      torob_clid: o.torobClid!,
      status: o.status === OrderStatus.CANCELLED ? 'cancelled' : 'completed',
      ...(psp ? { psp } : {}),
      order_value: orderValue,
      shipping_amount: shipping,
      ...(phone ? { phone_number: phone } : {}),
      products: (o.items ?? [])
        .filter((it) => !!it.product)
        .map((it) => ({
          product_url: `${siteUrl}${productPath(it.product)}`,
          product_price: toToman(it.unitPrice), // قیمت واحد نهایی (بعد از تخفیف/قیمت پله‌ای)
          quantity: Number(it.quantity),
        })),
    };
  }
}
