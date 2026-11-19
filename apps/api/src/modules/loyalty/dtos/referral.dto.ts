import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ApplyReferralCodeDto {
  @IsString()
  @IsNotEmpty({ message: 'کد معرف الزامی است' })
  @MaxLength(32)
  code!: string;
}

export interface ReferredFriendDto {
  id: number;
  mobileMasked: string;
  firstName?: string;
  status: 'PENDING' | 'COMPLETED';
  rewardAmount: number;
  discountCode?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ReferralInfoResponseDto {
  referralCode: string;
  referralLink: string;
  discountAmount: number;
  rewardAmount: number;
  minOrderAmount: number;
  totalInvited: number;
  successfulOrders: number;
  totalEarned: number;
  friends: ReferredFriendDto[];
}

export interface AdminReferralItemDto {
  id: number;
  referralCode: string;
  discountCode?: string;
  status: 'PENDING' | 'COMPLETED';
  rewardAmount: number;
  discountAmount: number;
  orderId?: number;
  createdAt: Date;
  completedAt?: Date;
  referrer: {
    id: number;
    firstName?: string;
    lastName?: string;
    mobile?: string;
  };
  referredUser: {
    id: number;
    firstName?: string;
    lastName?: string;
    mobile?: string;
  };
}
