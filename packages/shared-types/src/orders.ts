import { OrderStatus, PaymentMethod } from './enums.js';

export interface OrderItemProductSummary {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  sku?: string;
}

export interface OrderItemVariantSummary {
  id: number;
  title?: string;
  sku?: string;
  colorName?: string;
  colorHex?: string;
  value?: string;
  alt?: string;
}

export interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  variant?: OrderItemVariantSummary | null;
  product?: OrderItemProductSummary | null;
}

export interface ShippingAddress {
  id?: number;
  title?: string;
  address: string;
  city: string;
  state?: string;
  province?: string;
  postal_code?: string;
  postalCode?: string;
  recipientName?: string;
  recipientPhone?: string;
}

export interface ShippingInfo {
  first_name: string;
  last_name: string;
  phone: string;
  note?: string;
  address: string | ShippingAddress;
  city?: string;
  postalCode?: string;
}

export interface PaymentInfo {
  method?: PaymentMethod | string;
  refId?: string;
  trackingCode?: string;
  isPaid?: boolean;
  paidAt?: string | Date | null;
  cardPan?: string;
}

export interface PromotionSummary {
  id: number;
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
}

export interface Order {
  id: number;
  orderCode: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  paymentInfo?: PaymentInfo;
  status: OrderStatus;
  paymentRefId?: string;
  shippingCost: number;
  subtotal: number;
  discount: number;
  finalTotal: number;
  promotion?: PromotionSummary | null;
  shippedAt?: string | Date;
  postalBarcode?: string;
  note?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AdminOrderListItem {
  id: number;
  orderCode: string;
  status: OrderStatus;
  paymentRefId?: string | null;
  shippingCost: number;
  subtotal: number;
  discount: number;
  finalTotal: number;
  postalBarcode?: string | null;
  shippingInfo?: ShippingInfo | null;
  paymentInfo?: PaymentInfo | null;
  items?: OrderItem[];
  itemsCount?: number;
  customerName?: string;
  customerPhone?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface OrderRevenueStats {
  orders: number;
  revenue: number;
}

export interface AdminOrderStatistics {
  totalOrders: number;
  byStatus: Record<OrderStatus, number>;
  revenue: {
    allTime: OrderRevenueStats;
    last30Days: OrderRevenueStats;
    today: OrderRevenueStats;
    averageOrderValue: number;
  };
}

export interface CreateOrderDto {
  shippingAddressId?: number;
  shippingInfo?: ShippingInfo;
  paymentMethod: PaymentMethod;
  promotionCode?: string;
  note?: string;
}

export interface AdminOrderItemInput {
  productId: number;
  variantId?: number | null;
  quantity: number;
  unitPrice?: number;
}

export interface UpdateOrderAdminPayload {
  status?: OrderStatus;
  shippingCost?: number;
  discount?: number;
  paymentRefId?: string;
  postalBarcode?: string;
  shippingInfo?: Partial<ShippingInfo>;
  paymentInfo?: Partial<PaymentInfo>;
  items?: AdminOrderItemInput[];
}

export interface CreateOrderAdminPayload {
  userId?: number;
  status?: OrderStatus;
  shippingCost?: number;
  discount?: number;
  postalBarcode?: string;
  paymentRefId?: string;
  items: AdminOrderItemInput[];
  shippingInfo: ShippingInfo;
  paymentInfo?: PaymentInfo;
}
