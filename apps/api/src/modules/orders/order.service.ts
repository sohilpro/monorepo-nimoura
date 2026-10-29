import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'crypto';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  EntityTarget,
  FindOptionsRelations,
  In,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PaginationQueryDto } from 'src/modules/products/dtos/product-query.dto';
import { Products } from 'src/modules/products/entities/products.entity';
import { ProductVariants } from 'src/modules/products/entities/product-variants.entity';
import { Addresses } from 'src/modules/users/addresses/entities/addresses.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { Promotions } from 'src/modules/promotions/entities/promotion.entity';
import { PromotionUsages } from 'src/modules/promotions/entities/promotion-usages.entity';
import {
  PAID_STATUSES,
  PENDING_ORDER_TTL_MS,
  STOCK_FIELD,
} from './constants/order.constant';
import {
  OrderLine,
  RequestedItem,
  calcTotals,
  lineKey,
  resolveTierPrice,
  toLines,
  toRequestedItem,
} from './utils/order-lines.util';
import { CreateOrderDto } from './dtos/create-order.dto';
import { ShippingInfoDto } from './dtos/shipping-info.dto';
import { OrderItems } from './entities/order-items.entity';
import { Orders } from './entities/orders.entity';
import { PaymentInfo } from './entities/payment-info.entity';
import { ShippingInfo } from './entities/shipping-info.entity';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';

export type StockMode = 'reserve' | 'release';

export interface ResolveLinesOptions {
  existing?: OrderItems[];
  enforceAvailability?: boolean;
}

const ORDER_RELATIONS: FindOptionsRelations<Orders> = {
  items: { product: true, variant: true },
  shippingInfo: { address: true },
  paymentInfo: true,
};

const ORDER_RELATIONS_WITH_OWNER: FindOptionsRelations<Orders> = {
  ...ORDER_RELATIONS,
  user: true,
  promotion: true,
};

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Orders)
    private readonly orderRepo: Repository<Orders>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ===========================================================================
  // STOREFRONT — سفارش‌های کاربر
  // ===========================================================================

  /**
   * ثبت سفارش در وضعیت «در انتظار».
   * اگر کاربر از قبل سفارش «در انتظار» داشته باشد، همان سفارش بازنویسی می‌شود
   */
  async createOrder(dto: CreateOrderDto, userId: number) {
    return await this.dataSource.transaction(async (em) => {
      const pending = await this.findPendingOrder(em, userId);
      if (pending) {
        await this.adjustStock(em, toLines(pending.items), 'release');
        if (pending.items.length) {
          await em.delete(
            OrderItems,
            pending.items.map((i) => i.id),
          );
        }
      }

      const address = await this.resolveCustomerAddress(
        em,
        dto.shippingInfo,
        userId,
      );
      const lines = await this.resolveLines(
        em,
        dto.items.map(toRequestedItem),
        { enforceAvailability: true },
      );
      await this.adjustStock(em, lines, 'reserve');

      const shippingCost = 0;
      const discount = 0;
      const totals = calcTotals(lines, shippingCost, discount);

      const shippingInfo = Object.assign(
        pending?.shippingInfo ?? em.create(ShippingInfo),
        {
          first_name: dto.shippingInfo.first_name,
          last_name: dto.shippingInfo.last_name,
          phone: dto.shippingInfo.phone,
          note: dto.shippingInfo.note?.trim() || null,
          address,
        },
      );

      const paymentInfo = Object.assign(
        pending?.paymentInfo ?? em.create(PaymentInfo),
        {
          method: dto.paymentInfo.method ?? PaymentMethod.ZARINPAL,
          isPaid: false,
          paidAt: null,
          trackingCode: null,
        },
      );

      const order =
        pending ??
        em.create(Orders, {
          orderCode: await this.generateOrderCode(em),
          user: { id: userId } as Users,
          status: OrderStatus.PENDING,
          torobClid: null,
        });

      Object.assign(order, {
        items: lines.map((l) => this.buildOrderItem(em, l)),
        shippingInfo,
        paymentInfo,
        shippingCost,
        discount,
        ...totals,
      });

      if (dto.torobClid) {
        order.torobClid = dto.torobClid;
      }

      const saved = await em.save(Orders, order);
      return {
        message: 'سفارش ثبت شد و در انتظار پرداخت است',
        orderId: saved.id,
        orderCode: saved.orderCode,
        finalTotal: saved.finalTotal,
      };
    });
  }

  async getUserOrders(userId: number, query: PaginationQueryDto) {
    const { page, limit } = query;
    const [orders, total] = await this.orderRepo.findAndCount({
      where: { user: { id: userId } },
      relations: ORDER_RELATIONS,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserOrderById(id: number, userId: number): Promise<Orders> {
    const order = await this.orderRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ORDER_RELATIONS_WITH_OWNER,
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');
    return order;
  }

  async getPayableOrder(orderId: number, userId: number): Promise<Orders> {
    const order = await this.getUserOrderById(orderId, userId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('این سفارش در انتظار پرداخت نیست');
    }
    if (order.paymentInfo?.isPaid) {
      throw new BadRequestException('این سفارش قبلاً پرداخت شده است');
    }

    const ageMs = Date.now() - new Date(order.createdAt).getTime();
    if (ageMs > PENDING_ORDER_TTL_MS) {
      await this.dataSource.transaction(async (em) => {
        await this.adjustStock(em, toLines(order.items), 'release');
        await em.update(Orders, order.id, { status: OrderStatus.CANCELLED });
      });
      throw new BadRequestException(
        'مهلت پرداخت این سفارش (۳۰ دقیقه) به پایان رسیده است',
      );
    }

    return order;
  }

  async getOrderForPayment(orderId: number): Promise<Orders> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { paymentInfo: true, user: true },
    });
    if (!order) throw new NotFoundException('سفارش یافت نشد');
    return order;
  }

  async markAsPaid(orderId: number, refId: string, method?: PaymentMethod) {
    return await this.dataSource.transaction(async (em) => {
      const order = await em.findOne(Orders, {
        where: { id: orderId },
        relations: { paymentInfo: true, user: true, promotion: true },
      });
      if (!order) throw new NotFoundException('سفارش یافت نشد');

      const payment = await this.ensurePaymentInfo(em, order);
      payment.isPaid = true;
      payment.paidAt = new Date();
      payment.trackingCode = refId;
      if (method) payment.method = method;

      order.status = OrderStatus.PAID;
      order.paymentRefId = refId;
      this.markPurchased(order);

      await this.persistOrderState(em, order);
      await this.recordPromotionUsage(em, order);

      return { message: 'پرداخت با موفقیت ثبت شد', orderId };
    });
  }

  async markAsFailed(orderId: number, method?: PaymentMethod, userId?: number) {
    return await this.dataSource.transaction(async (em) => {
      const where: FindOptionsWhere<Orders> = { id: orderId };
      if (userId) where.user = { id: userId };

      const order = await em.findOne(Orders, {
        where,
        relations: ORDER_RELATIONS,
      });
      if (!order) throw new NotFoundException('سفارش یافت نشد');

      if (order.status !== OrderStatus.PENDING) {
        return { message: 'سفارش در وضعیت پرداخت‌نشده نیست', orderId };
      }

      await this.adjustStock(em, toLines(order.items), 'release');
      order.status = OrderStatus.CANCELLED;

      if (order.paymentInfo && method) {
        order.paymentInfo.method = method;
      }

      await this.persistOrderState(em, order);
      return { message: 'سفارش لغو و موجودی آزاد شد', orderId };
    });
  }

  async markAsFaild(orderId: number, method?: PaymentMethod) {
    return this.markAsFailed(orderId, method);
  }

  async cancelExpiredPendingOrders(): Promise<number> {
    const cutoff = new Date(Date.now() - PENDING_ORDER_TTL_MS);
    const expired = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.id')
      .where('o.status = :status', { status: OrderStatus.PENDING })
      .andWhere('o.createdAt <= :cutoff', { cutoff })
      .getMany();

    if (!expired.length) return 0;

    let cancelled = 0;
    for (const { id } of expired) {
      try {
        await this.markAsFailed(id);
        cancelled++;
      } catch (e) {
        this.logger.error(`لغو سفارش منقضی‌شده ${id} ناموفق بود`, e as Error);
      }
    }
    return cancelled;
  }

  // ===========================================================================
  // هلپرها و لاجیک‌های مشترک با قابلیت استفاده در OrdersAdminService
  // ===========================================================================

  markPurchased(order: Orders) {
    if (PAID_STATUSES.has(order.status) && !order.purchasedAt) {
      order.purchasedAt = order.paymentInfo?.paidAt ?? new Date();
    }
  }

  async generateOrderCode(em: EntityManager): Promise<string> {
    const d = new Date();
    const yymm = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}`;
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = `NM-${yymm}${randomInt(100000, 999999)}`;
      if ((await em.count(Orders, { where: { orderCode: code } })) === 0) {
        return code;
      }
    }
    throw new ConflictException('تولید کد سفارش ناموفق بود؛ دوباره تلاش کنید');
  }

  buildOrderItem(em: EntityManager, line: OrderLine): OrderItems {
    return em.create(OrderItems, {
      product: { id: line.productId } as Products,
      variant: line.variantId ? ({ id: line.variantId } as ProductVariants) : null,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    });
  }

  async resolveLines(
    em: EntityManager,
    items: RequestedItem[],
    { existing = [], enforceAvailability = false }: ResolveLinesOptions = {},
  ): Promise<OrderLine[]> {
    const seen = new Set<string>();
    for (const it of items) {
      const key = lineKey({
        productId: it.productId,
        variantId: it.variantId ?? null,
      });
      if (seen.has(key)) {
        throw new BadRequestException(
          'یک محصول با مشخصات یکسان نباید دو بار در سفارش تکرار شود',
        );
      }
      seen.add(key);
    }

    const priceSnapshot = new Map(
      toLines(existing).map((l) => [lineKey(l), l.unitPrice]),
    );
    const products = await em.find(Products, {
      where: { id: In([...new Set(items.map((i) => i.productId))]) },
      relations: { priceTiers: true, variants: { priceTiers: true } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return items.map((it) => {
      const product = productMap.get(it.productId);
      if (!product) {
        throw new NotFoundException(`محصول با شناسه ${it.productId} یافت نشد`);
      }
      if (enforceAvailability && !product.isAvailable) {
        throw new BadRequestException(
          `محصول «${product.title}» غیرفعال یا ناموجود است`,
        );
      }

      const variantId = it.variantId ?? null;
      let variant: ProductVariants | undefined;
      if (variantId) {
        variant = product.variants?.find((v) => v.id === variantId);
        if (!variant) {
          throw new BadRequestException(
            `تنوع ${variantId} متعلق به محصول «${product.title}» نیست`,
          );
        }
        if (enforceAvailability && !variant.isAvailable) {
          throw new BadRequestException(
            `تنوع انتخاب‌شده برای محصول «${product.title}» غیرفعال است`,
          );
        }
      } else if (product.variants?.length) {
        throw new BadRequestException(
          `محصول «${product.title}» دارای تنوع است؛ انتخاب تنوع الزامی است`,
        );
      }

      const key = lineKey({ productId: product.id, variantId });
      const unitPrice =
        it.unitPrice ??
        priceSnapshot.get(key) ??
        resolveTierPrice(it.quantity, variant ?? product);

      return {
        productId: product.id,
        variantId,
        quantity: it.quantity,
        unitPrice,
        title: product.title,
      };
    });
  }

  async adjustStock(
    em: EntityManager,
    lines: OrderLine[],
    mode: StockMode,
  ) {
    const sorted = [...lines].sort((a, b) =>
      lineKey(a).localeCompare(lineKey(b)),
    );
    const op = mode === 'reserve' ? '-' : '+';

    for (const line of sorted) {
      const target: EntityTarget<ObjectLiteral> = line.variantId
        ? ProductVariants
        : Products;

      const qb = em
        .createQueryBuilder()
        .update(target)
        .set({
          [STOCK_FIELD]: () => `"${STOCK_FIELD}" ${op} :qty`,
        } as QueryDeepPartialEntity<ObjectLiteral>)
        .setParameter('qty', line.quantity)
        .where('id = :id', { id: line.variantId ?? line.productId });
      if (mode === 'reserve') qb.andWhere(`"${STOCK_FIELD}" >= :qty`);

      const res = await qb.execute();
      if (!res.affected) {
        throw new BadRequestException(
          mode === 'reserve'
            ? `موجودی «${line.title}» کافی نیست`
            : `بازگرداندن موجودی «${line.title}» ناموفق بود`,
        );
      }
    }
  }

  async syncOrderItems(
    em: EntityManager,
    order: Orders,
    next: OrderLine[],
  ) {
    const keyOf = (i: OrderItems) =>
      lineKey({ productId: i.product.id, variantId: i.variant?.id ?? null });

    const current = new Map(order.items.map((i) => [keyOf(i), i]));
    const nextKeys = new Set(next.map(lineKey));

    const removed = order.items.filter((i) => !nextKeys.has(keyOf(i)));
    if (removed.length) {
      await em.delete(
        OrderItems,
        removed.map((i) => i.id),
      );
    }

    for (const line of next) {
      const existing = current.get(lineKey(line));
      if (existing) {
        await em.update(OrderItems, existing.id, {
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        });
      } else {
        await em.save(
          OrderItems,
          Object.assign(this.buildOrderItem(em, line), {
            order: { id: order.id } as Orders,
          }),
        );
      }
    }
  }

  private async findPendingOrder(em: EntityManager, userId: number) {
    return await em.findOne(Orders, {
      where: { user: { id: userId }, status: OrderStatus.PENDING },
      relations: ORDER_RELATIONS,
      order: { createdAt: 'DESC' },
    });
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

  private async recordPromotionUsage(em: EntityManager, order: Orders) {
    if (!order.promotion || !order.user) return;
    await em.getRepository(PromotionUsages).increment(
      { user: { id: order.user.id }, promotion: { id: order.promotion.id } },
      'usedCount',
      1,
    );
    await em
      .getRepository(Promotions)
      .increment({ id: order.promotion.id }, 'totalUsed', 1);
  }

  private async resolveCustomerAddress(
    em: EntityManager,
    info: ShippingInfoDto,
    userId: number,
  ): Promise<Addresses> {
    if (info.addressId) {
      const address = await em.findOne(Addresses, {
        where: { id: info.addressId, userId },
      });
      if (!address) throw new NotFoundException('آدرس انتخاب‌شده معتبر نیست');
      return address;
    }
    if (info.address) {
      return await em.save(
        em.create(Addresses, { ...info.address, userId } as DeepPartial<Addresses>),
      );
    }
    throw new BadRequestException(
      'ارسال شناسه آدرس یا اطلاعات آدرس الزامی است',
    );
  }
}
