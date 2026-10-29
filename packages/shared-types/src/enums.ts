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
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum BannerDevice {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  BOTH = 'both',
}

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
