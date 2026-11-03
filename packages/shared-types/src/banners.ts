import { BannerDevice, BannerStatus, LinkTarget } from './enums.js';

export interface BannerPosition {
  id: number;
  key: string;
  name: string;
  description?: string;
  recommendedWidth?: number;
  recommendedHeight?: number;
  maxItems?: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Banner {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  linkTarget?: LinkTarget;
  positionId: number;
  position?: BannerPosition;
  device: BannerDevice;
  status: BannerStatus;
  sortOrder: number;
  startAt?: string | Date;
  endAt?: string | Date;
  views?: number;
  clicks?: number;
  metadata?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateBannerPayload {
  title: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  linkTarget?: LinkTarget;
  positionId: number;
  device?: BannerDevice;
  status?: BannerStatus;
  sortOrder?: number;
  startAt?: string;
  endAt?: string;
  metadata?: Record<string, any>;
}

export interface UpdateBannerPayload extends Partial<CreateBannerPayload> {}
