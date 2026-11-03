import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  DeepPartial,
  EntityManager,
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Users } from 'src/modules/users/entities/users.entity';
import { Addresses } from 'src/modules/users/addresses/entities/addresses.entity';
import {
  ADMIN_VISIBLE_USER_FIELDS,
  ALLOWED_TRANSITIONS,
  FINANCIAL_EDITABLE_STATUSES,
  PAID_STATUSES,
  STATUS_LABEL,
} from './constants/order.constant';
import {
  calcTotals,
  diffLines,
  linesDiffer,
  pickDefined,
  toLines,
} from './utils/order-lines.util';
import { AdminOrderQueryDto } from './dtos/admin-order-query.dto';
import {
  AdminPaymentInfoDto,
  AdminShippingInfoDto,
  CreateOrderAdminDto,
  UpdateAdminShippingInfoDto,
  UpdateOrderAdminDto,
} from './dtos/admin-order.dto';
import { Orders } from './entities/orders.entity';
import { OrderItems } from './entities/order-items.entity';
import { PaymentInfo } from './entities/payment-info.entity';
import { ShippingInfo } from './entities/shipping-info.entity';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { OrderService } from './order.service';

const ORDER_RELATIONS_WITH_OWNER: FindOptionsRelations<Orders> = {
  items: { product: true, variant: true },
  shippingInfo: { address: true },
  paymentInfo: true,
  user: true,
  promotion: true,
};

@Injectable()
export class OrdersAdminService {
  private readonly logger = new Logger(OrdersAdminService.name);

  constructor(
    @InjectRepository(Orders)
    private readonly orderRepo: Repository<Orders>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly orderService: OrderService,
  ) {}

  /**
   * دریافت لیست تمام سفارش‌ها با فیلتر، جستجو و صفحه‌بندی
   */
  async findAllOrdersAdmin(query: AdminOrderQueryDto) {
    const { page, limit, status, search, userId, dateFrom, dateTo } = query;

    const base: FindOptionsWhere<Orders> = {};
    if (status) base.status = status;
    if (userId) base.user = { id: userId };

    if (dateFrom && dateTo) {
      base.createdAt = Between(new Date(dateFrom), this.endOfDayIfDateOnly(dateTo));
    } else if (dateFrom) {
      base.createdAt = MoreThanOrEqual(new Date(dateFrom));
    } else if (dateTo) {
      base.createdAt = LessThanOrEqual(this.endOfDayIfDateOnly(dateTo));
    }

    let where: FindOptionsWhere<Orders> | FindOptionsWhere<Orders>[] = base;
    const term = search?.trim();
    if (term) {
      const like = ILike(`%${term.replace(/[\\%_]/g, '\\$&')}%`);
      where = [
        { ...base, orderCode: like },
        { ...base, shippingInfo: { phone: like } },
        { ...base, shippingInfo: { first_name: like } },
        { ...base, shippingInfo: { last_name: like } },
      ];
    }

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      relations: { shippingInfo: true, paymentInfo: true, items: { product: true, variant: true } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      orders: items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
      meta: { total, page, limit, totalPages },
    };
  }

  /**
   * دریافت جزئیات کامل سفارش با شناسه
   */
  async getOrderById(id: number): Promise<Orders> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ORDER_RELATIONS_WITH_OWNER,
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');

    if (order.user) {
      const visible: Record<string, unknown> = {};
      const user = order.user as unknown as Record<string, unknown>;
      for (const field of ADMIN_VISIBLE_USER_FIELDS) {
        if (field in user) visible[field] = user[field];
      }
      order.user = visible as unknown as Users;
    }
    return order;
  }

  /**
   * دریافت آمار فروش کلی و وضعیت سفارش‌ها
   */
  async getOrderStatistics() {
    const paid = [...PAID_STATUSES];
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const revenueSince = async (since?: Date) => {
      const qb = this.orderRepo
        .createQueryBuilder('o')
        .select('COUNT(*)', 'orders')
        .addSelect('COALESCE(SUM(o.finalTotal), 0)', 'revenue')
        .where('o.status IN (:...paid)', { paid });
      if (since) qb.andWhere('o.purchasedAt >= :since', { since });
      const raw = await qb.getRawOne<{ orders: string; revenue: string }>();
      return {
        orders: Number(raw?.orders ?? 0),
        revenue: Number(raw?.revenue ?? 0),
      };
    };

    const [statusRows, allTime, last30Days, today] = await Promise.all([
      this.orderRepo
        .createQueryBuilder('o')
        .select('o.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('o.status')
        .getRawMany<{ status: OrderStatus; count: string }>(),
      revenueSince(),
      revenueSince(thirtyDaysAgo),
      revenueSince(startOfToday),
    ]);

    const byStatus = Object.fromEntries(
      Object.values(OrderStatus).map((s) => [s, 0]),
    ) as Record<OrderStatus, number>;
    for (const row of statusRows) byStatus[row.status] = Number(row.count);

    return {
      totalOrders: Object.values(byStatus).reduce((a, b) => a + b, 0),
      byStatus,
      revenue: {
        allTime,
        last30Days,
        today,
        averageOrderValue: allTime.orders
          ? Math.round(allTime.revenue / allTime.orders)
          : 0,
      },
    };
  }

  /**
   * ثبت سفارش تلفنی / دستی توسط ادمین
   */
  async createOrderAdmin(dto: CreateOrderAdminDto) {
    let status = dto.status ?? OrderStatus.PENDING;
    if (dto.paymentInfo?.isPaid && status === OrderStatus.PENDING) {
      status = OrderStatus.PAID;
    }
    if (status === OrderStatus.CANCELLED) {
      throw new BadRequestException('ثبت سفارش با وضعیت «لغو شده» مجاز نیست');
    }
    if (dto.paymentInfo?.isPaid === false && PAID_STATUSES.has(status)) {
      throw new BadRequestException(
        `سفارش «${STATUS_LABEL[status]}» باید پرداخت‌شده ثبت شود`,
      );
    }

    const orderId = await this.dataSource.transaction(async (em) => {
      const user = dto.userId
        ? await em.findOne(Users, { where: { id: dto.userId } })
        : null;
      if (dto.userId && !user) throw new NotFoundException('کاربر یافت نشد');

      const lines = await this.orderService.resolveLines(em, dto.items);
      await this.orderService.adjustStock(em, lines, 'reserve');

      const shippingCost = dto.shippingCost ?? 0;
      const discount = dto.discount ?? 0;
      const totals = calcTotals(lines, shippingCost, discount);

      const shippingInfo = await this.buildShippingInfo(em, dto.shippingInfo, user);

      const isPaid = PAID_STATUSES.has(status);
      const paymentInfo = em.create(PaymentInfo, {
        method: dto.paymentInfo?.method ?? PaymentMethod.ZARINPAL,
        trackingCode: dto.paymentInfo?.trackingCode?.trim() || null,
        isPaid,
        paidAt: isPaid ? (dto.paymentInfo?.paidAt ?? new Date()) : null,
      });

      const order = em.create(Orders, {
        orderCode: await this.orderService.generateOrderCode(em),
        user,
        status,
        shippingCost,
        discount,
        ...totals,
        paymentRefId: dto.paymentRefId?.trim() || null,
        postalBarcode: dto.postalBarcode?.trim() || null,
        shippingInfo,
        paymentInfo,
        items: lines.map((l) => this.orderService.buildOrderItem(em, l)),
      } as DeepPartial<Orders>);

      if (status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
        order.shippedAt = new Date();
      }
      this.orderService.markPurchased(order);

      return (await em.save(Orders, order)).id;
    });

    return await this.getOrderById(orderId);
  }

  /**
   * ویرایش سفارش توسط ادمین (اقلام، مبالغ، گیرنده، پرداخت، وضعیت)
   */
  async updateOrderAdmin(orderId: number, dto: UpdateOrderAdminDto) {
    await this.dataSource.transaction(async (em) => {
      await this.lockOrder(em, orderId);
      const order = await this.loadOrderForUpdate(em, orderId);
      const prevStatus = order.status;

      // ۱) اقلام و مبالغ
      const shippingCost = dto.shippingCost ?? order.shippingCost;
      const discount = dto.discount ?? order.discount;
      let lines = toLines(order.items);
      let itemsChanged = false;

      if (dto.items) {
        const next = await this.orderService.resolveLines(em, dto.items, {
          existing: order.items,
        });
        itemsChanged = linesDiffer(lines, next);
        if (itemsChanged) {
          this.assertFinancialEditable(prevStatus);
          const { reserve, release } = diffLines(lines, next);
          await this.orderService.adjustStock(em, release, 'release');
          await this.orderService.adjustStock(em, reserve, 'reserve');
          await this.orderService.syncOrderItems(em, order, next);
          order.items = await em.find(OrderItems, {
            where: { order: { id: order.id } },
            relations: { product: true, variant: true },
          });
          lines = next;
        }
      }

      const moneyChanged =
        shippingCost !== order.shippingCost || discount !== order.discount;
      if (moneyChanged) this.assertFinancialEditable(prevStatus);
      if (itemsChanged || moneyChanged) {
        Object.assign(order, {
          shippingCost,
          discount,
          ...calcTotals(lines, shippingCost, discount),
        });
      }

      // ۲) فیلدهای ساده
      if (dto.postalBarcode !== undefined) {
        order.postalBarcode = dto.postalBarcode.trim() || null;
      }
      if (dto.paymentRefId !== undefined) {
        order.paymentRefId = dto.paymentRefId.trim() || null;
      }

      // ۳) گیرنده و آدرس
      if (dto.shippingInfo) {
        await this.patchShippingInfo(em, order, dto.shippingInfo);
      }

      // ۴) پرداخت
      if (dto.paymentInfo) {
        await this.applyPaymentDto(em, order, dto.paymentInfo);
      }

      // ۵) وضعیت
      let nextStatus = dto.status ?? prevStatus;
      if (dto.paymentInfo?.isPaid === true && nextStatus === OrderStatus.PENDING) {
        nextStatus = OrderStatus.PAID;
      }
      if (
        dto.paymentInfo?.isPaid === false &&
        nextStatus !== prevStatus &&
        PAID_STATUSES.has(nextStatus)
      ) {
        throw new BadRequestException(
          `وضعیت «${STATUS_LABEL[nextStatus]}» با پرداخت‌نشده بودن سفارش سازگار نیست`,
        );
      }
      if (nextStatus !== prevStatus) {
        this.assertTransition(prevStatus, nextStatus);
        await this.applyStatusChange(em, order, nextStatus);
      }

      await this.persistOrderState(em, order);
    });

    return {
      message: 'سفارش با موفقیت به‌روزرسانی شد',
      order: await this.getOrderById(orderId),
    };
  }

  /**
   * به‌روزرسانی وضعیت سفارش
   */
  async updateOrderStatus(id: number, status: OrderStatus) {
    return await this.dataSource.transaction(async (em) => {
      await this.lockOrder(em, id);
      const order = await this.loadOrderForUpdate(em, id);

      if (order.status === status) {
        return { message: 'سفارش از قبل در این وضعیت است', status };
      }

      this.assertTransition(order.status, status);
      await this.applyStatusChange(em, order, status);
      await this.persistOrderState(em, order);

      return { message: 'وضعیت سفارش به‌روزرسانی شد', status: order.status };
    });
  }

  /**
   * لغو سفارش توسط ادمین
   */
  async cancelOrderAdmin(id: number) {
    const result = await this.updateOrderStatus(id, OrderStatus.CANCELLED);
    return { ...result, id };
  }

  /**
   * حذف دائمی سفارش
   */
  async deleteOrderAdmin(id: number) {
    try {
      await this.dataSource.transaction(async (em) => {
        await this.lockOrder(em, id);
        const order = await this.loadOrderForUpdate(em, id);

        if (order.purchasedAt) {
          throw new ConflictException(
            'این سفارش به‌عنوان خرید قطعی ثبت شده و قابل حذف نیست؛ فقط می‌توانید آن را لغو کنید',
          );
        }
        if (
          order.status !== OrderStatus.PENDING &&
          order.status !== OrderStatus.CANCELLED
        ) {
          throw new BadRequestException(
            'فقط سفارش‌های «در انتظار» یا «لغو شده» قابل حذف هستند؛ ابتدا سفارش را لغو کنید',
          );
        }

        if (order.status !== OrderStatus.CANCELLED) {
          await this.orderService.adjustStock(em, toLines(order.items), 'release');
        }

        const shippingId = order.shippingInfo?.id;
        const paymentId = order.paymentInfo?.id;

        await em.delete(Orders, id);
        if (shippingId) await em.delete(ShippingInfo, shippingId);
        if (paymentId) await em.delete(PaymentInfo, paymentId);
      });
    } catch (e) {
      const pgCode = (e as { driverError?: { code?: string } })?.driverError?.code;
      if (pgCode === '23503') {
        throw new ConflictException(
          'این سفارش به رکوردهای دیگری وابسته است؛ به‌جای حذف، آن را لغو کنید',
        );
      }
      throw e;
    }
    return { message: 'سفارش حذف شد', id };
  }

  // ===========================================================================
  // هلپرهای ماشین حالت و ذخیره‌سازی
  // ===========================================================================

  private assertTransition(from: OrderStatus, to: OrderStatus) {
    if (!ALLOWED_TRANSITIONS[from].includes(to)) {
      throw new BadRequestException(
        `تغییر وضعیت از «${STATUS_LABEL[from]}» به «${STATUS_LABEL[to]}» مجاز نیست`,
      );
    }
  }

  private assertFinancialEditable(status: OrderStatus) {
    if (!FINANCIAL_EDITABLE_STATUSES.has(status)) {
      throw new BadRequestException(
        'ویرایش اقلام و مبالغ فقط پیش از ارسال سفارش ممکن است',
      );
    }
  }

  private async applyStatusChange(
    em: EntityManager,
    order: Orders,
    next: OrderStatus,
  ) {
    const prev = order.status;
    const lines = toLines(order.items);

    if (prev !== OrderStatus.CANCELLED && next === OrderStatus.CANCELLED) {
      await this.orderService.adjustStock(em, lines, 'release');
    }
    if (prev === OrderStatus.CANCELLED && next !== OrderStatus.CANCELLED) {
      await this.orderService.adjustStock(em, lines, 'reserve');
    }

    order.status = next;

    if (
      (next === OrderStatus.SHIPPED || next === OrderStatus.DELIVERED) &&
      !order.shippedAt
    ) {
      order.shippedAt = new Date();
    }

    if (PAID_STATUSES.has(next)) {
      const payment = await this.ensurePaymentInfo(em, order);
      if (!payment.isPaid) {
        payment.isPaid = true;
        payment.paidAt = payment.paidAt ?? new Date();
      }
    }

    this.orderService.markPurchased(order);
  }

  private async lockOrder(em: EntityManager, id: number) {
    const row = await em
      .createQueryBuilder(Orders, 'o')
      .setLock('pessimistic_write')
      .where('o.id = :id', { id })
      .getOne();
    if (!row) throw new NotFoundException('سفارش یافت نشد');
  }

  private async loadOrderForUpdate(em: EntityManager, id: number) {
    const order = await em.findOne(Orders, {
      where: { id },
      relations: ORDER_RELATIONS_WITH_OWNER,
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');
    return order;
  }

  private async persistOrderState(em: EntityManager, order: Orders) {
    await em.update(Orders, order.id, {
      status: order.status,
      shippingCost: order.shippingCost,
      discount: order.discount,
      subtotal: order.subtotal,
      finalTotal: order.finalTotal,
      shippedAt: order.shippedAt,
      purchasedAt: order.purchasedAt,
      postalBarcode: order.postalBarcode ?? null,
      paymentRefId: order.paymentRefId ?? null,
    });

    if (order.paymentInfo) {
      await em.update(PaymentInfo, order.paymentInfo.id, {
        method: order.paymentInfo.method,
        trackingCode: order.paymentInfo.trackingCode ?? null,
        isPaid: order.paymentInfo.isPaid,
        paidAt: order.paymentInfo.paidAt ?? null,
      });
    }
  }

  private async ensurePaymentInfo(
    em: EntityManager,
    order: Orders,
  ): Promise<PaymentInfo> {
    if (!order.paymentInfo) {
      const created = await em.save(
        em.create(PaymentInfo, {
          method: PaymentMethod.ZARINPAL,
          isPaid: false,
        }),
      );
      await em.update(Orders, order.id, { paymentInfo: { id: created.id } });
      order.paymentInfo = created;
    }
    return order.paymentInfo;
  }

  private async buildShippingInfo(
    em: EntityManager,
    dto: AdminShippingInfoDto,
    user: Users | null,
  ) {
    let address: Addresses;

    if (dto.addressId) {
      const found = await em.findOne(Addresses, {
        where: { id: dto.addressId },
      });
      if (!found) throw new NotFoundException('آدرس یافت نشد');
      address = found;
    } else if (dto.address) {
      address = await em.save(
        em.create(Addresses, {
          ...dto.address,
          title: dto.address.title ?? 'آدرس سفارش',
          ...(user ? { userId: user.id } : {}),
        } as DeepPartial<Addresses>),
      );
    } else {
      throw new BadRequestException('آدرس ارسال الزامی است');
    }

    return em.create(ShippingInfo, {
      first_name: dto.first_name,
      last_name: dto.last_name,
      phone: dto.phone,
      note: dto.note?.trim() || null,
      address,
    });
  }

  private async patchShippingInfo(
    em: EntityManager,
    order: Orders,
    dto: UpdateAdminShippingInfoDto,
  ) {
    if (!order.shippingInfo) {
      throw new BadRequestException('این سفارش اطلاعات ارسال ندارد');
    }
    const { address, ...rest } = dto;

    const shippingPatch = pickDefined(rest);
    if (Object.keys(shippingPatch).length) {
      await em.update(ShippingInfo, order.shippingInfo.id, shippingPatch);
    }
    if (address) {
      const addressPatch = pickDefined(address);
      if (Object.keys(addressPatch).length) {
        await em.update(Addresses, order.shippingInfo.address.id, addressPatch);
      }
    }
  }

  private async applyPaymentDto(
    em: EntityManager,
    order: Orders,
    dto: AdminPaymentInfoDto,
  ) {
    const payment = await this.ensurePaymentInfo(em, order);

    if (
      dto.isPaid === false &&
      payment.isPaid &&
      PAID_STATUSES.has(order.status)
    ) {
      throw new BadRequestException(
        'برای لغو پرداخت، ابتدا وضعیت سفارش را تغییر دهید',
      );
    }

    if (dto.method !== undefined) payment.method = dto.method;
    if (dto.trackingCode !== undefined) {
      payment.trackingCode = dto.trackingCode.trim() || null;
    }
    if (dto.isPaid !== undefined) {
      payment.isPaid = dto.isPaid;
      if (!dto.isPaid) payment.paidAt = null;
    }
    if (payment.isPaid) payment.paidAt = dto.paidAt ?? payment.paidAt ?? new Date();
  }

  private endOfDayIfDateOnly(value: string): Date {
    const date = new Date(value);
    if (value.length <= 10) date.setUTCHours(23, 59, 59, 999);
    return date;
  }
}
