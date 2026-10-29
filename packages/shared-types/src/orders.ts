import { OrderStatus, PaymentMethod } from './enums';

export interface OrderItemProductSummary {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
}

export interface OrderItemVariantSummary {
  id: number;
  title?: string;
  sku?: string;
  colorName?: string;
  colorHex?: string;
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
  province?: string;
  postalCode: string;
  recipientName?: string;
  recipientPhone?: string;
}

export interface ShippingInfo {
  first_name: string;
  last_name: string;
  phone: string;
  address: string | ShippingAddress;
  city: string;
  postalCode: string;
}

export interface PaymentInfo {
  method?: PaymentMethod | string;
  refId?: string;
  cardPan?: string;
  paidAt?: string | Date;
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

export interface CreateOrderDto {
  shippingAddressId?: number;
  shippingInfo?: ShippingInfo;
  paymentMethod: PaymentMethod;
  promotionCode?: string;
  note?: string;
}
