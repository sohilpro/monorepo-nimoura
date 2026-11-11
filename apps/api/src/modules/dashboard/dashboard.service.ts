import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type {
  DashboardDailyPoint,
  DashboardLowStockItem,
  DashboardPaymentMethodItem,
  DashboardRange,
  DashboardRecentOrder,
  DashboardResponse,
  DashboardStatusItem,
  DashboardTopCategory,
  DashboardTopProduct,
} from '@nimoura/shared-types';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { PaymentMethod } from '../orders/enums/payment-method.enum';
import { PAID_STATUSES } from '../orders/constants/order.constant';

interface RangeWindow {
  range: DashboardRange;
  start: Date | null;
  end: Date;
  prevStart: Date | null;
  prevEnd: Date | null;
  seriesStart: Date;
  bucket: 'hour' | 'day';
}

const TEHRAN_TZ = 'Asia/Tehran';

function tehranDateString(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TEHRAN_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function startOfTehranDay(date: Date): Date {
  return new Date(`${tehranDateString(date)}T00:00:00+03:30`);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

function deltaPercent(current: number, previous: number | null): number | null {
  if (previous === null) return null;
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

@Injectable()
export class DashboardService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  resolveWindow(
    range: DashboardRange = '30d',
    now: Date = new Date(),
  ): RangeWindow {
    const todayStart = startOfTehranDay(now);

    if (range === 'today') {
      return {
        range,
        start: todayStart,
        end: now,
        prevStart: addDays(todayStart, -1),
        prevEnd: todayStart,
        seriesStart: todayStart,
        bucket: 'hour',
      };
    }

    if (range === 'all') {
      return {
        range,
        start: null,
        end: now,
        prevStart: null,
        prevEnd: null,
        seriesStart: addDays(todayStart, -29),
        bucket: 'day',
      };
    }

    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const start = addDays(todayStart, -(days - 1));
    const prevStart = addDays(start, -days);
    return {
      range,
      start,
      end: now,
      prevStart,
      prevEnd: start,
      seriesStart: start,
      bucket: 'day',
    };
  }

  async getOverview(range: DashboardRange = '30d'): Promise<DashboardResponse> {
    const win = this.resolveWindow(range);
    const paidStatuses = [...PAID_STATUSES];

    const [
      revenueAgg,
      ordersAgg,
      customersAgg,
      catalogAgg,
      engagementAgg,
      dailySeries,
      statusRows,
      paymentRows,
      topProductRows,
      topCategoryRows,
      lowStockRows,
      recentOrderRows,
    ] = await Promise.all([
      this.fetchRevenueStats(win, paidStatuses),
      this.fetchOrdersStats(win),
      this.fetchCustomersStats(win),
      this.fetchCatalogStats(),
      this.fetchEngagementStats(),
      this.fetchDailySeries(win, paidStatuses),
      this.fetchOrderStatuses(win),
      this.fetchPaymentMethods(win, paidStatuses),
      this.fetchTopProducts(win, paidStatuses),
      this.fetchTopCategories(win, paidStatuses),
      this.fetchLowStockProducts(),
      this.fetchRecentOrders(),
    ]);

    const totalStatusOrders = statusRows.reduce(
      (sum, row) => sum + Number(row.count),
      0,
    );
    const statusMap = new Map(
      statusRows.map((row) => [
        row.status,
        { count: Number(row.count), totalAmount: Number(row.totalAmount) },
      ]),
    );
    const statusOrder = [
      OrderStatus.DELIVERED,
      OrderStatus.SHIPPED,
      OrderStatus.PROCESSING,
      OrderStatus.PENDING,
      OrderStatus.PAID,
      OrderStatus.CANCELLED,
    ];
    const orderStatuses: DashboardStatusItem[] = statusOrder.map((status) => {
      const entry = statusMap.get(status) ?? { count: 0, totalAmount: 0 };
      return {
        status,
        count: entry.count,
        totalAmount: entry.totalAmount,
        share: totalStatusOrders
          ? Math.round((entry.count / totalStatusOrders) * 1000) / 10
          : 0,
      };
    });

    const totalPaymentRevenue = paymentRows.reduce(
      (sum, r) => sum + Number(r.revenue),
      0,
    );
    const paymentMap = new Map(
      paymentRows.map((r) => [
        r.method,
        { count: Number(r.count), revenue: Number(r.revenue) },
      ]),
    );
    const paymentMethods: DashboardPaymentMethodItem[] = Object.values(
      PaymentMethod,
    ).map((method) => {
      const entry = paymentMap.get(method) ?? { count: 0, revenue: 0 };
      return {
        method,
        count: entry.count,
        revenue: entry.revenue,
        share: totalPaymentRevenue
          ? Math.round((entry.revenue / totalPaymentRevenue) * 1000) / 10
          : 0,
      };
    });

    const topProducts: DashboardTopProduct[] = topProductRows.map((r) => ({
      id: Number(r.id),
      title: r.title,
      sku: r.sku,
      thumbnail: r.thumbnail || null,
      unitsSold: Number(r.unitsSold),
      revenue: Number(r.revenue),
      stock: Number(r.stock),
    }));

    const topCategories: DashboardTopCategory[] = topCategoryRows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      revenue: Number(r.revenue),
      unitsSold: Number(r.unitsSold),
      productsCount: Number(r.productsCount),
    }));

    const lowStockProducts: DashboardLowStockItem[] = lowStockRows.map((r) => ({
      id: Number(r.id),
      title: r.title,
      sku: r.sku,
      stock: Number(r.stock),
      lowStockThreshold: Number(r.lowStockThreshold),
      thumbnail: r.thumbnail || null,
      isAvailable: Boolean(r.isAvailable),
    }));

    const recentOrders: DashboardRecentOrder[] = recentOrderRows.map((r) => ({
      id: Number(r.id),
      orderCode: r.orderCode || `#${r.id}`,
      customerName:
        `${r.first_name || ''} ${r.last_name || ''}`.trim() ||
        r.phone ||
        'مشتری مهمان',
      phone: r.phone || '—',
      status: r.status,
      finalTotal: Number(r.finalTotal),
      itemsCount: Number(r.itemsCount),
      paymentMethod: r.paymentMethod ?? null,
      isPaid: Boolean(r.isPaid),
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : String(r.createdAt),
    }));

    return {
      range,
      generatedAt: new Date().toISOString(),
      kpis: {
        revenue: {
          current: revenueAgg.current,
          previous: revenueAgg.previous,
          deltaPercent: deltaPercent(revenueAgg.current, revenueAgg.previous),
          averageOrderValue: revenueAgg.averageOrderValue,
          allTime: revenueAgg.allTime,
        },
        orders: {
          current: ordersAgg.current,
          previous: ordersAgg.previous,
          deltaPercent: deltaPercent(ordersAgg.current, ordersAgg.previous),
          pendingCount: ordersAgg.pendingCount,
          awaitingDispatchCount: ordersAgg.awaitingDispatchCount,
          torobOrdersCount: ordersAgg.torobOrdersCount,
          totalAllTime: ordersAgg.totalAllTime,
        },
        customers: {
          total: customersAgg.total,
          newInRange: customersAgg.newInRange,
          previousNew: customersAgg.previousNew,
          deltaPercent: deltaPercent(
            customersAgg.newInRange,
            customersAgg.previousNew,
          ),
          verifiedMobile: customersAgg.verifiedMobile,
        },
        catalog: catalogAgg,
        engagement: engagementAgg,
      },
      dailySeries,
      orderStatuses,
      paymentMethods,
      topProducts,
      topCategories,
      lowStockProducts,
      recentOrders,
    };
  }

  private async fetchRevenueStats(
    win: RangeWindow,
    paidStatuses: OrderStatus[],
  ) {
    const rows = (await this.dataSource.query(
      `SELECT
         COALESCE(SUM(CASE WHEN ($1::timestamptz IS NULL OR COALESCE(o."purchasedAt", o.created_at) >= $1) THEN o."finalTotal" ELSE 0 END), 0) AS current_revenue,
         COUNT(CASE WHEN ($1::timestamptz IS NULL OR COALESCE(o."purchasedAt", o.created_at) >= $1) THEN 1 END) AS current_paid_orders,
         COALESCE(SUM(CASE WHEN ($2::timestamptz IS NOT NULL AND COALESCE(o."purchasedAt", o.created_at) >= $2 AND COALESCE(o."purchasedAt", o.created_at) < $3) THEN o."finalTotal" ELSE 0 END), 0) AS prev_revenue,
         COALESCE(SUM(o."finalTotal"), 0) AS all_time_revenue
       FROM "orders" o
       WHERE o.deleted_at IS NULL
         AND o.status = ANY($4)`,
      [win.start, win.prevStart, win.prevEnd, paidStatuses],
    )) as Array<Record<string, string>>;

    const r = rows[0] ?? {};
    const current = Number(r.current_revenue ?? 0);
    const paidCount = Number(r.current_paid_orders ?? 0);
    return {
      current,
      previous: win.prevStart ? Number(r.prev_revenue ?? 0) : null,
      averageOrderValue: paidCount ? Math.round(current / paidCount) : 0,
      allTime: Number(r.all_time_revenue ?? 0),
    };
  }

  private async fetchOrdersStats(win: RangeWindow) {
    const rows = (await this.dataSource.query(
      `SELECT
         COUNT(CASE WHEN ($1::timestamptz IS NULL OR o.created_at >= $1) THEN 1 END) AS current_orders,
         COUNT(CASE WHEN ($2::timestamptz IS NOT NULL AND o.created_at >= $2 AND o.created_at < $3) THEN 1 END) AS prev_orders,
         COUNT(CASE WHEN o.status = 'pending' THEN 1 END) AS pending_count,
         COUNT(CASE WHEN o.status IN ('paid', 'processing') THEN 1 END) AS awaiting_dispatch,
         COUNT(CASE WHEN o."torobClid" IS NOT NULL AND ($1::timestamptz IS NULL OR o.created_at >= $1) THEN 1 END) AS torob_orders,
         COUNT(*) AS total_all_time
       FROM "orders" o
       WHERE o.deleted_at IS NULL`,
      [win.start, win.prevStart, win.prevEnd],
    )) as Array<Record<string, string>>;

    const r = rows[0] ?? {};
    return {
      current: Number(r.current_orders ?? 0),
      previous: win.prevStart ? Number(r.prev_orders ?? 0) : null,
      pendingCount: Number(r.pending_count ?? 0),
      awaitingDispatchCount: Number(r.awaiting_dispatch ?? 0),
      torobOrdersCount: Number(r.torob_orders ?? 0),
      totalAllTime: Number(r.total_all_time ?? 0),
    };
  }

  private async fetchCustomersStats(win: RangeWindow) {
    const rows = (await this.dataSource.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(CASE WHEN ($1::timestamptz IS NULL OR u.created_at >= $1) THEN 1 END) AS new_in_range,
         COUNT(CASE WHEN ($2::timestamptz IS NOT NULL AND u.created_at >= $2 AND u.created_at < $3) THEN 1 END) AS prev_new,
         COUNT(CASE WHEN u.verify_mobile = true THEN 1 END) AS verified_mobile
       FROM "users" u
       WHERE u.deleted_at IS NULL`,
      [win.start, win.prevStart, win.prevEnd],
    )) as Array<Record<string, string>>;

    const r = rows[0] ?? {};
    return {
      total: Number(r.total ?? 0),
      newInRange: Number(r.new_in_range ?? 0),
      previousNew: win.prevStart ? Number(r.prev_new ?? 0) : null,
      verifiedMobile: Number(r.verified_mobile ?? 0),
    };
  }

  private async fetchCatalogStats() {
    const [productRows, taxonomyRows] = await Promise.all([
      this.dataSource.query(
        `SELECT
           COUNT(*) AS total_products,
           COUNT(CASE WHEN p."isAvailable" = true THEN 1 END) AS active_products,
           COUNT(CASE WHEN p."isAvailable" = true AND p.stock > p."lowStockThreshold" THEN 1 END) AS in_stock,
           COUNT(CASE WHEN p."isAvailable" = true AND p.stock > 0 AND p.stock <= p."lowStockThreshold" THEN 1 END) AS low_stock,
           COUNT(CASE WHEN p."isAvailable" = false OR p.stock <= 0 THEN 1 END) AS out_of_stock
         FROM "products" p
         WHERE p.deleted_at IS NULL`,
      ) as Promise<Array<Record<string, string>>>,
      this.dataSource.query(
        `SELECT
           (SELECT COUNT(*) FROM "categories" WHERE deleted_at IS NULL) AS categories_count,
           (SELECT COUNT(*) FROM "brands" WHERE deleted_at IS NULL) AS brands_count,
           (SELECT COUNT(*) FROM "tags" WHERE deleted_at IS NULL AND "isActive" = true) AS tags_count`,
      ) as Promise<Array<Record<string, string>>>,
    ]);

    const p = productRows[0] ?? {};
    const t = taxonomyRows[0] ?? {};
    return {
      totalProducts: Number(p.total_products ?? 0),
      activeProducts: Number(p.active_products ?? 0),
      inStock: Number(p.in_stock ?? 0),
      lowStock: Number(p.low_stock ?? 0),
      outOfStock: Number(p.out_of_stock ?? 0),
      categoriesCount: Number(t.categories_count ?? 0),
      brandsCount: Number(t.brands_count ?? 0),
      tagsCount: Number(t.tags_count ?? 0),
    };
  }

  private async fetchEngagementStats() {
    const rows = (await this.dataSource.query(
      `SELECT
         (SELECT COUNT(*) FROM "comments" WHERE deleted_at IS NULL AND "isApproved" = false AND "isRejected" = false) AS pending_product_comments,
         (SELECT COUNT(*) FROM "comments" WHERE deleted_at IS NULL) AS total_product_comments,
         (SELECT COUNT(*) FROM "magazine_comments" WHERE deleted_at IS NULL AND status = 'pending') AS pending_magazine_comments,
         (SELECT COUNT(*) FROM "magazine_articles" WHERE deleted_at IS NULL AND status = 'published') AS published_articles,
         (SELECT COALESCE(SUM(view_count), 0) FROM "magazine_articles" WHERE deleted_at IS NULL AND status = 'published') AS total_article_views,
         (SELECT COUNT(*) FROM "promotions" WHERE deleted_at IS NULL AND "isActive" = true AND "startDate" <= NOW() AND "endDate" >= NOW()) AS active_promotions,
         (SELECT COALESCE(SUM("totalUsed"), 0) FROM "promotions" WHERE deleted_at IS NULL) AS total_promo_usages,
         (SELECT COUNT(*) FROM "banners" WHERE deleted_at IS NULL AND status = 'active') AS active_banners,
         (SELECT COALESCE(SUM(views), 0) FROM "banners" WHERE deleted_at IS NULL) AS total_banner_views,
         (SELECT COALESCE(SUM(clicks), 0) FROM "banners" WHERE deleted_at IS NULL) AS total_banner_clicks`,
    )) as Array<Record<string, string>>;

    const r = rows[0] ?? {};
    return {
      pendingProductComments: Number(r.pending_product_comments ?? 0),
      totalProductComments: Number(r.total_product_comments ?? 0),
      pendingMagazineComments: Number(r.pending_magazine_comments ?? 0),
      publishedArticles: Number(r.published_articles ?? 0),
      totalArticleViews: Number(r.total_article_views ?? 0),
      activePromotions: Number(r.active_promotions ?? 0),
      totalPromoUsages: Number(r.total_promo_usages ?? 0),
      activeBanners: Number(r.active_banners ?? 0),
      totalBannerViews: Number(r.total_banner_views ?? 0),
      totalBannerClicks: Number(r.total_banner_clicks ?? 0),
    };
  }

  private async fetchDailySeries(
    win: RangeWindow,
    paidStatuses: OrderStatus[],
  ): Promise<DashboardDailyPoint[]> {
    const step = win.bucket === 'hour' ? '1 hour' : '1 day';
    const trunc = win.bucket === 'hour' ? 'hour' : 'day';
    const seriesEnd =
      win.bucket === 'hour'
        ? new Date(win.seriesStart.getTime() + 23 * 3_600_000)
        : startOfTehranDay(win.end);

    const rows = (await this.dataSource.query(
      `WITH buckets AS (
         SELECT generate_series($1::timestamptz, $2::timestamptz, $3::interval) AS bucket
       ),
       rev AS (
         SELECT date_trunc($4, COALESCE(o."purchasedAt", o.created_at) AT TIME ZONE 'Asia/Tehran') AT TIME ZONE 'Asia/Tehran' AS b,
                COALESCE(SUM(o."finalTotal"), 0) AS revenue
         FROM "orders" o
         WHERE o.deleted_at IS NULL
           AND o.status = ANY($5)
           AND COALESCE(o."purchasedAt", o.created_at) >= $1
         GROUP BY 1
       ),
       ord AS (
         SELECT date_trunc($4, o.created_at AT TIME ZONE 'Asia/Tehran') AT TIME ZONE 'Asia/Tehran' AS b,
                COUNT(*) AS orders
         FROM "orders" o
         WHERE o.deleted_at IS NULL
           AND o.created_at >= $1
         GROUP BY 1
       ),
       usr AS (
         SELECT date_trunc($4, u.created_at AT TIME ZONE 'Asia/Tehran') AT TIME ZONE 'Asia/Tehran' AS b,
                COUNT(*) AS new_users
         FROM "users" u
         WHERE u.deleted_at IS NULL
           AND u.created_at >= $1
         GROUP BY 1
       )
       SELECT b.bucket AS date,
              COALESCE(rev.revenue, 0) AS revenue,
              COALESCE(ord.orders, 0) AS orders,
              COALESCE(usr.new_users, 0) AS new_users
       FROM buckets b
       LEFT JOIN rev ON rev.b = b.bucket
       LEFT JOIN ord ON ord.b = b.bucket
       LEFT JOIN usr ON usr.b = b.bucket
       ORDER BY b.bucket ASC`,
      [win.seriesStart, seriesEnd, step, trunc, paidStatuses],
    )) as Array<{
      date: Date | string;
      revenue: string;
      orders: string;
      new_users: string;
    }>;

    return rows.map((r) => ({
      date: r.date instanceof Date ? r.date.toISOString() : String(r.date),
      revenue: Number(r.revenue ?? 0),
      orders: Number(r.orders ?? 0),
      newUsers: Number(r.new_users ?? 0),
    }));
  }

  private async fetchOrderStatuses(win: RangeWindow) {
    return (await this.dataSource.query(
      `SELECT o.status AS status,
              COUNT(*) AS count,
              COALESCE(SUM(o."finalTotal"), 0) AS "totalAmount"
       FROM "orders" o
       WHERE o.deleted_at IS NULL
         AND ($1::timestamptz IS NULL OR o.created_at >= $1)
       GROUP BY o.status`,
      [win.start],
    )) as Array<{ status: OrderStatus; count: string; totalAmount: string }>;
  }

  private async fetchPaymentMethods(
    win: RangeWindow,
    paidStatuses: OrderStatus[],
  ) {
    return (await this.dataSource.query(
      `SELECT p.method AS method,
              COUNT(*) AS count,
              COALESCE(SUM(o."finalTotal"), 0) AS revenue
       FROM "orders" o
       INNER JOIN "payment_info" p ON p.id = o."paymentInfoId" AND p.deleted_at IS NULL
       WHERE o.deleted_at IS NULL
         AND o.status = ANY($2)
         AND ($1::timestamptz IS NULL OR COALESCE(o."purchasedAt", o.created_at) >= $1)
       GROUP BY p.method`,
      [win.start, paidStatuses],
    )) as Array<{ method: PaymentMethod; count: string; revenue: string }>;
  }

  private async fetchTopProducts(
    win: RangeWindow,
    paidStatuses: OrderStatus[],
  ) {
    return (await this.dataSource.query(
      `SELECT pr.id,
              pr.title,
              pr.sku,
              pr.thumbnail,
              pr.stock,
              COALESCE(SUM(oi.quantity), 0) AS "unitsSold",
              COALESCE(SUM(oi.quantity * oi."unitPrice"), 0) AS revenue
       FROM "order_items" oi
       INNER JOIN "orders" o ON o.id = oi."orderId" AND o.deleted_at IS NULL
       INNER JOIN "products" pr ON pr.id = oi."productId" AND pr.deleted_at IS NULL
       WHERE oi.deleted_at IS NULL
         AND o.status = ANY($2)
         AND ($1::timestamptz IS NULL OR COALESCE(o."purchasedAt", o.created_at) >= $1)
       GROUP BY pr.id, pr.title, pr.sku, pr.thumbnail, pr.stock
       ORDER BY revenue DESC, "unitsSold" DESC
       LIMIT 6`,
      [win.start, paidStatuses],
    )) as Array<Record<string, string>>;
  }

  private async fetchTopCategories(
    win: RangeWindow,
    paidStatuses: OrderStatus[],
  ) {
    return (await this.dataSource.query(
      `SELECT c.id,
              c.name,
              COALESCE(SUM(oi.quantity * oi."unitPrice"), 0) AS revenue,
              COALESCE(SUM(oi.quantity), 0) AS "unitsSold",
              COUNT(DISTINCT pr.id) AS "productsCount"
       FROM "categories" c
       INNER JOIN "products" pr ON pr."categoryId" = c.id AND pr.deleted_at IS NULL
       LEFT JOIN "order_items" oi ON oi."productId" = pr.id AND oi.deleted_at IS NULL
       LEFT JOIN "orders" o ON o.id = oi."orderId"
         AND o.deleted_at IS NULL
         AND o.status = ANY($2)
         AND ($1::timestamptz IS NULL OR COALESCE(o."purchasedAt", o.created_at) >= $1)
       WHERE c.deleted_at IS NULL
       GROUP BY c.id, c.name
       HAVING COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN oi.quantity * oi."unitPrice" ELSE 0 END), 0) > 0
           OR COUNT(DISTINCT pr.id) > 0
       ORDER BY revenue DESC, "productsCount" DESC
       LIMIT 6`,
      [win.start, paidStatuses],
    )) as Array<Record<string, string>>;
  }

  private async fetchLowStockProducts() {
    return (await this.dataSource.query(
      `SELECT p.id, p.title, p.sku, p.stock, p."lowStockThreshold", p.thumbnail, p."isAvailable"
       FROM "products" p
       WHERE p.deleted_at IS NULL
         AND (p.stock <= 0 OR p.stock <= p."lowStockThreshold" OR p."isAvailable" = false)
       ORDER BY p.stock ASC, p.id DESC
       LIMIT 6`,
    )) as Array<Record<string, string>>;
  }

  private async fetchRecentOrders() {
    return (await this.dataSource.query(
      `SELECT o.id,
              o."orderCode",
              o.status,
              o."finalTotal",
              o.created_at AS "createdAt",
              si.first_name,
              si.last_name,
              si.phone,
              pi.method AS "paymentMethod",
              COALESCE(pi."isPaid", false) AS "isPaid",
              (SELECT COALESCE(SUM(oi.quantity), 0) FROM "order_items" oi WHERE oi."orderId" = o.id AND oi.deleted_at IS NULL) AS "itemsCount"
       FROM "orders" o
       LEFT JOIN "shipping_info" si ON si.id = o."shippingInfoId" AND si.deleted_at IS NULL
       LEFT JOIN "payment_info" pi ON pi.id = o."paymentInfoId" AND pi.deleted_at IS NULL
       WHERE o.deleted_at IS NULL
       ORDER BY o.created_at DESC
       LIMIT 6`,
    )) as Array<Record<string, any>>;
  }
}
