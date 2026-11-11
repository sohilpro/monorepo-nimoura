import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderService } from '../order.service';

/** سفارش‌های «در انتظار» که در مهلت مقرر پرداخت نشده‌اند را لغو و موجودی را آزاد می‌کند */
@Injectable()
export class PendingOrdersExpiryTask {
  private readonly logger = new Logger(PendingOrdersExpiryTask.name);

  constructor(private readonly orderService: OrderService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handle() {
    const cancelled = await this.orderService.cancelExpiredPendingOrders();
    if (cancelled) {
      this.logger.log(
        `${cancelled} سفارش پرداخت‌نشده لغو و موجودی آن‌ها آزاد شد`,
      );
    }
  }
}
