// ~/types/order.ts
// ── بر اساس انتیتی‌های بکند ──────────────────

export interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  variant?: any;
  product?: {
    id: number;
    title: string;
    thumbnail?: string;
  };
}

export interface ShippingInfo {
  first_name: string;
  last_name: string;
  phone: string;
  address: any;
  city: string;
  postalCode: string;
}

export interface PaymentInfo {
  method?: string;
}

export interface Promotion {
  id: number;
  code: string;
}

export interface Order {
  id: number;
  orderCode?: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  status: "pending" | "paid" | "shipped" | "cancelled";
  paymentRefId?: string;
  shippingCost: number;
  subtotal: number;
  discount: number;
  finalTotal: number;
  promotion?: Promotion;
  shippedAt?: string | Date;
  postalBarcode?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
