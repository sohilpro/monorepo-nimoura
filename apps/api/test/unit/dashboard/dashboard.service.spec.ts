import { describe, it, expect, vi } from 'vitest';
import { DashboardService } from '../../../src/modules/dashboard/dashboard.service';
import { OrderStatus } from '../../../src/modules/orders/enums/order-status.enum';
import { PaymentMethod } from '../../../src/modules/orders/enums/payment-method.enum';

describe('DashboardService', () => {
  it('resolveWindow computes Tehran day boundaries and comparison windows', () => {
    const service = new DashboardService({ query: vi.fn() } as any);
    const now = new Date('2026-11-11T10:00:00Z');

    const today = service.resolveWindow('today', now);
    expect(today.bucket).toBe('hour');
    expect(today.start).toEqual(new Date('2026-11-11T00:00:00+03:30'));
    expect(today.prevStart).toEqual(new Date('2026-11-10T00:00:00+03:30'));

    const week = service.resolveWindow('7d', now);
    expect(week.bucket).toBe('day');
    expect(week.end.getTime() - week.start!.getTime()).toBeGreaterThan(
      6 * 86_400_000,
    );

    const all = service.resolveWindow('all', now);
    expect(all.start).toBeNull();
    expect(all.prevStart).toBeNull();
  });

  it('getOverview aggregates KPIs, deltas, and shares safely', async () => {
    const query = vi
      .fn()
      // 1. revenue
      .mockResolvedValueOnce([
        {
          current_revenue: '5000000',
          current_paid_orders: '5',
          prev_revenue: '4000000',
          all_time_revenue: '12000000',
        },
      ])
      // 2. orders
      .mockResolvedValueOnce([
        {
          current_orders: '8',
          prev_orders: '4',
          pending_count: '2',
          awaiting_dispatch: '3',
          torob_orders: '1',
          total_all_time: '20',
        },
      ])
      // 3. customers
      .mockResolvedValueOnce([
        {
          total: '45',
          new_in_range: '6',
          prev_new: '0',
          verified_mobile: '40',
        },
      ])
      // 4a. products
      .mockResolvedValueOnce([
        {
          total_products: '30',
          active_products: '28',
          in_stock: '24',
          low_stock: '3',
          out_of_stock: '3',
        },
      ])
      // 4b. taxonomy
      .mockResolvedValueOnce([
        { categories_count: '8', brands_count: '6', tags_count: '50' },
      ])
      // 5. engagement
      .mockResolvedValueOnce([
        {
          pending_product_comments: '4',
          total_product_comments: '22',
          pending_magazine_comments: '1',
          published_articles: '10',
          total_article_views: '1500',
          active_promotions: '2',
          total_promo_usages: '14',
          active_banners: '3',
          total_banner_views: '800',
          total_banner_clicks: '64',
        },
      ])
      // 6. daily series
      .mockResolvedValueOnce([
        {
          date: '2026-11-10T00:00:00.000Z',
          revenue: '2000000',
          orders: '3',
          new_users: '2',
        },
        {
          date: '2026-11-11T00:00:00.000Z',
          revenue: '3000000',
          orders: '5',
          new_users: '4',
        },
      ])
      // 7. order statuses
      .mockResolvedValueOnce([
        { status: OrderStatus.PAID, count: '3', totalAmount: '3000000' },
        { status: OrderStatus.PENDING, count: '1', totalAmount: '500000' },
      ])
      // 8. payment methods
      .mockResolvedValueOnce([
        { method: PaymentMethod.ZARINPAL, count: '4', revenue: '4000000' },
        { method: PaymentMethod.TOROB_PAY, count: '1', revenue: '1000000' },
      ])
      // 9. top products
      .mockResolvedValueOnce([])
      // 10. top categories
      .mockResolvedValueOnce([])
      // 11. low stock
      .mockResolvedValueOnce([])
      // 12. recent orders
      .mockResolvedValueOnce([]);

    const service = new DashboardService({ query } as any);
    const res = await service.getOverview('30d');

    expect(res.kpis.revenue.deltaPercent).toBe(25);
    expect(res.kpis.revenue.averageOrderValue).toBe(1000000);
    expect(res.kpis.orders.deltaPercent).toBe(100);
    expect(res.kpis.customers.deltaPercent).toBe(100);
    expect(
      res.orderStatuses.find((s) => s.status === OrderStatus.PAID)?.share,
    ).toBe(75);
    expect(
      res.paymentMethods.find((m) => m.method === PaymentMethod.ZARINPAL)
        ?.share,
    ).toBe(80);
    expect(res.dailySeries).toHaveLength(2);
  });
});
