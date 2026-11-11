import type { OrderStatus, PaymentMethod } from './enums.js';

export type DashboardRange = 'today' | '7d' | '30d' | '90d' | 'all';

export interface DashboardDailyPoint {
  date: string;
  revenue: number;
  orders: number;
  newUsers: number;
}

export interface DashboardStatusItem {
  status: OrderStatus;
  count: number;
  totalAmount: number;
  share: number;
}

export interface DashboardPaymentMethodItem {
  method: PaymentMethod;
  count: number;
  revenue: number;
  share: number;
}

export interface DashboardTopProduct {
  id: number;
  title: string;
  sku: string;
  thumbnail: string | null;
  unitsSold: number;
  revenue: number;
  stock: number;
}

export interface DashboardTopCategory {
  id: number;
  name: string;
  revenue: number;
  unitsSold: number;
  productsCount: number;
}

export interface DashboardLowStockItem {
  id: number;
  title: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  thumbnail: string | null;
  isAvailable: boolean;
}

export interface DashboardRecentOrder {
  id: number;
  orderCode: string;
  customerName: string;
  phone: string;
  status: OrderStatus;
  finalTotal: number;
  itemsCount: number;
  paymentMethod: PaymentMethod | null;
  isPaid: boolean;
  createdAt: string;
}

export interface DashboardResponse {
  range: DashboardRange;
  generatedAt: string;
  kpis: {
    revenue: {
      current: number;
      previous: number | null;
      deltaPercent: number | null;
      averageOrderValue: number;
      allTime: number;
    };
    orders: {
      current: number;
      previous: number | null;
      deltaPercent: number | null;
      pendingCount: number;
      awaitingDispatchCount: number;
      torobOrdersCount: number;
      totalAllTime: number;
    };
    customers: {
      total: number;
      newInRange: number;
      previousNew: number | null;
      deltaPercent: number | null;
      verifiedMobile: number;
    };
    catalog: {
      totalProducts: number;
      activeProducts: number;
      inStock: number;
      lowStock: number;
      outOfStock: number;
      categoriesCount: number;
      brandsCount: number;
      tagsCount: number;
    };
    engagement: {
      pendingProductComments: number;
      totalProductComments: number;
      pendingMagazineComments: number;
      publishedArticles: number;
      totalArticleViews: number;
      activePromotions: number;
      totalPromoUsages: number;
      activeBanners: number;
      totalBannerViews: number;
      totalBannerClicks: number;
    };
  };
  dailySeries: DashboardDailyPoint[];
  orderStatuses: DashboardStatusItem[];
  paymentMethods: DashboardPaymentMethodItem[];
  topProducts: DashboardTopProduct[];
  topCategories: DashboardTopCategory[];
  lowStockProducts: DashboardLowStockItem[];
  recentOrders: DashboardRecentOrder[];
}
