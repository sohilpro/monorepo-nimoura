import { describe, it, expect, vi } from 'vitest';
import { OrderService } from '../../../src/modules/orders/order.service';
import { OrdersAdminService } from '../../../src/modules/orders/orders-admin.service';
import { TorobService } from '../../../src/modules/torob/torob.service';
import { OrderStatus } from '../../../src/modules/orders/enums/order-status.enum';
import { PaymentMethod } from '../../../src/modules/orders/enums/payment-method.enum';

function createMockQb(result: {
  getMany?: any[];
  getManyAndCount?: [any[], number];
  getOne?: any;
}) {
  const qb: any = {
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    addOrderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getMany: vi.fn().mockResolvedValue(result.getMany ?? []),
    getManyAndCount: vi
      .fn()
      .mockResolvedValue(result.getManyAndCount ?? [[], 0]),
    getOne: vi.fn().mockResolvedValue(result.getOne ?? null),
  };
  return qb;
}

describe('Orders & Torob Service Projections', () => {
  it('OrderService.getUserOrderById should strip sensitive user fields and heavy product columns', async () => {
    const rawOrder = {
      id: 101,
      orderCode: 'NM-2611123456',
      status: OrderStatus.PAID,
      shippingCost: 0,
      subtotal: 250000,
      discount: 0,
      finalTotal: 250000,
      paymentRefId: 'REF-1',
      postalBarcode: null,
      shippedAt: null,
      createdAt: new Date('2026-11-01T10:00:00Z'),
      updatedAt: new Date('2026-11-01T10:05:00Z'),
      user: {
        id: 5,
        first_name: 'نگار',
        last_name: 'موسوی',
        mobile: '09123456789',
        email: 'negar@example.com',
      },
      shippingInfo: {
        id: 1,
        first_name: 'نگار',
        last_name: 'موسوی',
        phone: '09123456789',
        note: null,
        address: {
          id: 2,
          title: 'خانه',
          state: 'تهران',
          city: 'تهران',
          address: 'ونک',
          postal_code: '1234567890',
        },
      },
      paymentInfo: {
        id: 3,
        method: PaymentMethod.ZARINPAL,
        trackingCode: 'TRK-1',
        isPaid: true,
        paidAt: new Date('2026-11-01T10:05:00Z'),
      },
      items: [
        {
          id: 10,
          quantity: 2,
          unitPrice: 125000,
          product: {
            id: 20,
            title: 'رژ لب',
            slug: 'lipstick',
            thumbnail: '/a.webp',
            sku: 'SKU-1',
          },
          variant: {
            id: 30,
            sku: 'VAR-1',
            attributeValues: [
              {
                id: 1,
                value: 'رزگلد',
                colorHex: '#B76E79',
                attribute: { id: 1, name: 'رنگ', kind: 'color' },
              },
            ],
          },
        },
      ],
    };

    const orderRepo = {
      findOne: vi.fn().mockResolvedValue(rawOrder),
    } as any;

    const service = new OrderService(orderRepo, {} as any);
    const result: any = await service.getUserOrderById(101, 5);

    expect(orderRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        loadEagerRelations: false,
      }),
    );
    expect(result.user).not.toHaveProperty('password');
    expect(result.user).not.toHaveProperty('identity_card');
    expect(result.user).not.toHaveProperty('deletedAt');
    expect(result.items[0].product).not.toHaveProperty('introduce');
    expect(result.items[0].product).not.toHaveProperty('howToUse');
    expect(result.items[0].variant.alt).toBe('رزگلد');
  });

  it('OrderService.getUserOrders should use explicit select without heavy product fields', async () => {
    const orderRepo = {
      findAndCount: vi.fn().mockResolvedValue([[], 0]),
    } as any;
    const service = new OrderService(orderRepo, {} as any);
    await service.getUserOrders(5, { page: 1, limit: 10 });

    const opts = orderRepo.findAndCount.mock.calls[0][0];
    expect(opts.loadEagerRelations).toBe(false);
    expect(opts.select.items.product).toEqual({
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      sku: true,
    });
  });

  it('OrdersAdminService.findAllOrdersAdmin should select compact order and item fields', async () => {
    const orderRepo = {
      findAndCount: vi.fn().mockResolvedValue([[], 0]),
    } as any;
    const service = new OrdersAdminService(orderRepo, {} as any, {} as any);
    await service.findAllOrdersAdmin({ page: 1, limit: 10 });

    const opts = orderRepo.findAndCount.mock.calls[0][0];
    expect(opts.loadEagerRelations).toBe(false);
    expect(opts.select.items.product).toEqual({
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      sku: true,
    });
  });

  it('TorobService.listOrders should explicitly select only needed columns and map Torob shape', async () => {
    const mockOrder = {
      id: 77,
      status: OrderStatus.PAID,
      shippingCost: 35000,
      finalTotal: 235000,
      torobClid: 'clid_abc',
      purchasedAt: new Date('2026-11-01T12:00:00.123Z'),
      updatedAt: new Date('2026-11-01T12:00:00.123Z'),
      shippingInfo: { phone: '09123456789' },
      paymentInfo: { method: PaymentMethod.ZARINPAL },
      user: { mobile: '09123456789' },
      items: [
        {
          quantity: 2,
          unitPrice: 100000,
          product: { id: 5, slug: 'mascara' },
        },
      ],
    };

    const qb = createMockQb({ getMany: [mockOrder] });
    const orderRepo = {
      createQueryBuilder: vi.fn().mockReturnValue(qb),
    } as any;
    const config = {
      get: vi.fn().mockReturnValue('https://nimoura.shop'),
    } as any;

    const service = new TorobService(orderRepo, config);
    const rows = await service.listOrders('2026-10-01T00:00:00Z', 50);

    expect(qb.select).toHaveBeenCalled();
    expect(rows).toEqual([
      {
        purchase_timestamp: '2026-11-01T12:00:00.123000Z',
        last_updated_timestamp: '2026-11-01T12:00:00.123000Z',
        torob_clid: 'clid_abc',
        status: 'completed',
        psp: PaymentMethod.ZARINPAL,
        order_value: 200000,
        shipping_amount: 35000,
        phone_number: '09123456789',
        products: [
          {
            product_url: 'https://nimoura.shop/product/mascara',
            product_price: 100000,
            quantity: 2,
          },
        ],
      },
    ]);
  });
});
