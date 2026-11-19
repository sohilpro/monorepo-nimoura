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

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_USER = 'waiting_user',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketDepartment {
  TECHNICAL = 'technical',
  FINANCIAL = 'financial',
  ORDERS = 'orders',
  SALES = 'sales',
  GENERAL = 'general',
}

export enum TicketSenderRole {
  USER = 'user',
  ADMIN = 'admin',
}

