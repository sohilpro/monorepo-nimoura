export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: string;
  maxDiscountAmount: string | null;
  minOrderAmount: string | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  usedCount: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  firstOrderOnly: boolean;
  applicableProductIds: string[] | null;
  applicableCategoryIds: string[] | null;
  excludedProductIds: string[] | null;
  allowedUserIds: string[] | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCodeFormState {
  id?: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number | null;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  firstOrderOnly: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PromoCodeQuery {
  page?: number;
  limit?: number;
  search?: string;
  discountType?: DiscountType;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
