import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ZarinPalCheckout from 'zarinpal-checkout';
import { CartService } from '../cart/cart.service';
import { OrderService } from '../orders/order.service';
import { Orders } from '../orders/entities/orders.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { PaymentMethod } from '../orders/enums/payment-method.enum';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { VerifyPaymentDto } from './dtos/verify-payment.dto';
import { Payments } from './entities/payments.entity';
import { PaymentStatus } from './enum/status-payment.enum';
import { SmsService } from './sms.service';
import { PAID_STATUSES } from '../orders/constants/order.constant';

/** کدهای زرین‌پال: ۱۰۰ = موفق، ۱۰۱ = قبلاً وریفای شده */
const ZARINPAL_OK_CODES = [100, 101];

const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : String(e);

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly merchantId = process.env.ZARINPAL_MERCHANT_ID;

  constructor(
    @InjectRepository(Payments)
    private readonly paymentRepo: Repository<Payments>,
    private readonly ordersService: OrderService,
    private readonly cartService: CartService,
    private readonly smsService: SmsService,
  ) {}

  private get gateway() {
    return ZarinPalCheckout.create(this.merchantId as string, false);
  }

  private get callbackUrl() {
    return `${process.env.APP_URL}/payment/result`;
  }

  private static readonly TOROB_TX = /^ORD-(?:NM|VC)-(\d+)(?:-\d+)?$/;

  // ===========================================================================
  // درخواست پرداخت
  // ===========================================================================

  /**
   * ساخت تراکنش در درگاه. سفارش باید متعلق به کاربر، «در انتظار» و در مهلت ۳۰ دقیقه باشد
   * (همه در OrderService بررسی می‌شود) و مبلغ همیشه از دیتابیس خوانده می‌شود.
   */
  async requestPayment(dto: Pick<CreatePaymentDto, 'orderId'>, userId: number) {
    const order = await this.ordersService.getPayableOrder(dto.orderId, userId);
    const amount = Number(order.finalTotal);

    const email = order.user?.email;
    const response: any = await this.gateway.PaymentRequest({
      Amount: amount,
      CallbackURL: this.callbackUrl,
      Description: `خرید از فروشگاه - سفارش ${order.orderCode}`,
      Mobile: this.contactPhone(order),
      ...(email ? { Email: email } : {}),
    });

    if (response.status !== 100 || !response.authority) {
      throw new BadRequestException('خطا در برقراری ارتباط با درگاه بانکی');
    }

    await this.paymentRepo.save(
      this.paymentRepo.create({
        orderId: order.id,
        amount,
        status: PaymentStatus.INITIATED,
        authority: response.authority,
      }),
    );

    return {
      success: true,
      authority: response.authority as string,
      url: response.url as string, // آدرس انتقال به درگاه
    };
  }

  /** تلاش مجدد برای پرداخت؛ همان requestPayment (قوانین مهلت و وضعیت یکسان است) */
  async retryOrderPayment(orderId: number, userId: number) {
    const { success, url } = await this.requestPayment({ orderId }, userId);
    return { success, paymentUrl: url };
  }

  // ===========================================================================
  // بازگشت از درگاه
  // ===========================================================================

  async verifyPayment(query: VerifyPaymentDto, internalKey?: string) {
    // پرداخت ترب‌پی: Nuxt خودش با ترب verify/settle کرده و نتیجه رو گزارش می‌ده
    const torobOrderId = PaymentService.TOROB_TX.exec(query.Authority)?.[1];
    if (torobOrderId) {
      return this.verifyTorobReport(query, Number(torobOrderId), internalKey);
    }

    const payment: any = await this.paymentRepo.findOne({
      where: { authority: query.Authority },
    });
    if (!payment) throw new NotFoundException('اطلاعات تراکنش یافت نشد');

    if (payment.status === PaymentStatus.SUCCESS) {
      return {
        success: true,
        message: 'این سفارش قبلاً با موفقیت پرداخت شده است',
        refId: payment.refId,
      };
    }

    // انصراف کاربر یا خطا از سمت درگاه.
    // سفارش «در انتظار» می‌ماند تا کاربر در مهلت ۳۰ دقیقه دوباره تلاش کند؛
    // در صورت عدم پرداخت، cron سفارش را لغو و موجودی را آزاد می‌کند.
    if (query.Status !== 'OK') {
      await this.markPaymentFailed(payment);
      return {
        success: false,
        message: 'پرداخت توسط کاربر لغو شد یا با خطا مواجه گردید',
      };
    }

    // ── پیش از وریفای (کسر قطعی وجه) سفارش را بررسی می‌کنیم.
    // وجهِ وریفای‌نشده توسط زرین‌پال خودکار به کاربر برمی‌گردد.
    const order = await this.ordersService
      .getOrderForPayment(payment.orderId)
      .catch(() => null);
    const blocker = this.verifyBlocker(order, payment);
    if (blocker) {
      await this.markPaymentFailed(payment);
      return { success: false, message: blocker };
    }

    let response: any;
    try {
      response = await this.gateway.PaymentVerification({
        Amount: payment.amount,
        Authority: payment.authority,
      });
    } catch (err) {
      this.logger.error(`خطا در ارتباط با زرین‌پال: ${errorMessage(err)}`);
      return {
        success: false,
        message: 'خطا در برقراری ارتباط با درگاه پرداخت بانکی',
      };
    }

    if (!ZARINPAL_OK_CODES.includes(response?.status)) {
      await this.markPaymentFailed(payment);
      return {
        success: false,
        message: 'تایید پرداخت از سوی بانک ناموفق بود',
        code: response?.status,
      };
    }

    // ── از این‌جا وجه کسر شده است
    payment.status = PaymentStatus.SUCCESS;
    payment.refId = String(response.refId);
    payment.verifiedAt = new Date();
    await this.paymentRepo.save(payment);

    this.logger.log(
      `[VERIFY] authority=${payment.authority}, orderId=${payment.orderId}, paymentStatus=${payment.status}`,
    );

    const completed = await this.completeOrder(payment.orderId, payment.refId);
    if (!completed) {
      return {
        success: false,
        message:
          'پرداخت شما دریافت شد اما ثبت نهایی سفارش با مشکل مواجه شد. لطفاً با پشتیبانی تماس بگیرید.',
        refId: payment.refId,
      };
    }

    this.logger.log(
      `[VERIFY] orderId=${payment.orderId}, completed=${completed}`,
    );

    this.runSideEffects(order!);

    return {
      success: true,
      message: 'پرداخت با موفقیت انجام شد',
      refId: payment.refId,
      orderCode: order!.orderCode,
    };
  }

  // ===========================================================================
  // ابزارهای داخلی
  // ===========================================================================
  private async verifyTorobReport(
    query: VerifyPaymentDto,
    orderId: number,
    internalKey?: string,
  ) {
    if (!internalKey || internalKey !== process.env.INTERNAL_API_KEY) {
      throw new ForbiddenException('دسترسی غیرمجاز');
    }

    const order: any = await this.ordersService
      .getOrderForPayment(orderId)
      .catch(() => null);
    if (!order) throw new NotFoundException('سفارش یافت نشد');

    // ردیف Payment برای ترب موقع اولین گزارش ساخته می‌شه (Authority = transactionId یکتا)
    let payment: any = await this.paymentRepo.findOne({
      where: { authority: query.Authority },
    });
    if (!payment) {
      payment = await this.paymentRepo.save(
        this.paymentRepo.create({
          orderId,
          amount: order.finalTotal, // ⚠️ همون فیلد مبلغی که برای زرین‌پال ذخیره می‌کنی
          authority: query.Authority,
          status: PaymentStatus.INITIATED, // ⚠️ اسم enum رو با خودت تطبیق بده
          gateway: 'torobpay', // ⚠️ اگه ستون gateway نداری حذفش کن
        } as any),
      );
    }

    // ایدمپوتنسی: رفرش صفحه یا گزارش تکراری
    if (payment.status === PaymentStatus.SUCCESS) {
      return {
        success: true,
        message: 'این سفارش قبلاً با موفقیت پرداخت شده است',
        refId: payment.refId,
        orderCode: order.orderCode,
      };
    }

    // انصراف یا شکست
    if (query.Status !== 'OK') {
      await this.markPaymentFailed(payment);
      return {
        success: false,
        message: 'پرداخت توسط کاربر لغو شد یا با خطا مواجه گردید',
      };
    }

    // ── از این‌جا وجه قطعی است (ترب verify شده)
    payment.status = PaymentStatus.SUCCESS;
    payment.refId = query.Authority;
    payment.verifiedAt = new Date();
    await this.paymentRepo.save(payment);

    const completed = await this.completeOrder(payment.orderId, payment.refId);
    if (!completed) {
      return {
        success: false,
        message:
          'پرداخت شما دریافت شد اما ثبت نهایی سفارش با مشکل مواجه شد. لطفاً با پشتیبانی تماس بگیرید.',
        refId: payment.refId,
      };
    }

    this.runSideEffects(order);

    return {
      success: true,
      message: 'پرداخت با موفقیت انجام شد',
      refId: payment.refId,
      orderCode: order.orderCode,
    };
  }

  /** اگر دلیلی برای وریفای‌نکردن وجود داشته باشد پیام آن، وگرنه null */
  private verifyBlocker(
    order: Orders | null,
    payment: Payments,
  ): string | null {
    if (!order) return 'سفارش مربوط به این پرداخت یافت نشد';
    if (PAID_STATUSES.has(order.status))
      return 'این سفارش قبلاً پرداخت شده است';
    if (order.status !== OrderStatus.PENDING) {
      return 'مهلت پرداخت این سفارش به پایان رسیده است؛ لطفاً سفارش جدید ثبت کنید';
    }
    if (Number(order.finalTotal) !== Number(payment.amount)) {
      return 'مبلغ سفارش پس از شروع پرداخت تغییر کرده است؛ لطفاً دوباره پرداخت کنید';
    }
    return null;
  }

  /** تغییر وضعیت سفارش به پرداخت‌شده؛ در برابر فراخوانی هم‌زمان (رفرش کاربر) idempotent است */
  private async completeOrder(
    orderId: number,
    refId: string,
  ): Promise<boolean> {
    try {
      await this.ordersService.markAsPaid(
        orderId,
        refId,
        PaymentMethod.ZARINPAL,
      );
      return true;
    } catch (err) {
      const fresh = await this.ordersService
        .getOrderForPayment(orderId)
        .catch(() => null);
      if (fresh && PAID_STATUSES.has(fresh.status)) return true;

      this.logger.error(
        `پرداخت ${refId} تأیید شد اما سفارش ${orderId} پرداخت‌شده نشد (نیازمند بررسی/بازگشت وجه): ${errorMessage(err)}`,
      );
      return false;
    }
  }

  private async markPaymentFailed(payment: Payments) {
    payment.status = PaymentStatus.FAILED;
    await this.paymentRepo.save(payment).catch((err) => {
      this.logger.error(
        `خطا در ذخیره وضعیت ناموفق پرداخت: ${errorMessage(err)}`,
      );
    });
  }

  /** پاک‌سازی سبد و پیامک؛ خطای آن‌ها هیچ‌وقت نباید تأیید خرید را مختل کند */
  private runSideEffects(order: Orders) {
    const userId = order.user?.id;
    if (userId) {
      this.cartService.clearCart(userId).catch((err) => {
        this.logger.warn(
          `خطا در پاک‌سازی سبد کاربر ${userId}: ${errorMessage(err)}`,
        );
      });
    }

    const phone = this.contactPhone(order);
    if (phone && order.orderCode) {
      this.smsService
        .sendOrderViaMeliSms(phone, order.orderCode)
        .catch((err) => {
          this.logger.warn(
            `خطا در ارسال پیامک به ${phone}: ${errorMessage(err)}`,
          );
        });
    }
  }

  private contactPhone(order: Orders): string | undefined {
    return order.shippingInfo?.phone || order.user?.mobile || undefined;
  }
}
