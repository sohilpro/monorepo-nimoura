import { OrderStatus } from '../enums/order-status.enum';

/** نام ستون موجودی در Products و ProductVariants — در صورت تفاوت اینجا عوض کنید */
export const STOCK_FIELD = 'stock';

/** سفارش «در انتظار» بعد از این مدت (بدون پرداخت) لغو و موجودی آزاد می‌شود */
export const PENDING_ORDER_TTL_MS = 30 * 60 * 1000;

export const MAX_PAGE_SIZE = 100;

/**
 * فیلدهایی از Users که در جزئیات سفارشِ پنل ادمین برگردانده می‌شود.
 * (برای جلوگیری از نشت فیلدهای حساس مثل رمز عبور؛ مطابق ستون‌های واقعی Users تنظیم کنید)
 */
export const ADMIN_VISIBLE_USER_FIELDS = [
  'id',
  'name',
  'first_name',
  'last_name',
  'phone',
  'mobile',
  'email',
] as const;

export const STATUS_LABEL: Readonly<Record<OrderStatus, string>> = {
  [OrderStatus.PENDING]: 'در انتظار',
  [OrderStatus.PAID]: 'پرداخت شده',
  [OrderStatus.PROCESSING]: 'در حال پردازش',
  [OrderStatus.SHIPPED]: 'ارسال شده',
  [OrderStatus.DELIVERED]: 'تحویل داده شده',
  [OrderStatus.CANCELLED]: 'لغو شده',
};

/** وضعیت‌هایی که پرداخت انجام‌شده فرض می‌شوند */
export const PAID_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
]);

/** وضعیت‌هایی که ویرایش اقلام و مبالغ در آن‌ها مجاز است */
export const FINANCIAL_EDITABLE_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.PENDING,
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
]);

/** ماشین حالت سفارش (بازگشایی سفارش لغوشده فقط به «در انتظار») */
export const ALLOWED_TRANSITIONS: Readonly<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [OrderStatus.PENDING],
};