export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  OWNER = 'owner',
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  ZARINPAL = 'zarinpal',
  TOROB_PAY = 'torobpay',
  SNAPP_PAY = 'snapp_pay',
}

export enum PaymentStatus {
  INITIATED = 'INITIATED',
  SUCCESS = 'OK',
  FAILED = 'FAILED',
}

export enum BannerStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SCHEDULED = 'scheduled',
  EXPIRED = 'expired',
}

export enum BannerDevice {
  ALL = 'all',
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
}

export enum LinkTarget {
  SELF = '_self',
  BLANK = '_blank',
}

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
