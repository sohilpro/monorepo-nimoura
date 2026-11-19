import { LoyaltyLedgerType } from '../enums/loyalty-ledger-type.enum';
import { LoyaltyWithdrawalStatus } from '../enums/loyalty-withdrawal-status.enum';

export interface LoyaltySummaryResponseDto {
  balance: number;
  weeklyVisitCount: number;
  weeklyVisitDates: string[];
  weekCompleted: boolean;
  weeklyReward: number;
  cashbackMinOrder: number;
  cashbackAmount: number;
  enabled: boolean;
  cashbackEnabled: boolean;
  autoRedeem: boolean;
}

export interface LoyaltyLedgerItemDto {
  id: number;
  userId: number;
  amount: number;
  type: LoyaltyLedgerType;
  description?: string;
  orderId?: number;
  idempotencyKey: string;
  createdAt: Date;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    mobile?: string;
  };
}

export interface LoyaltyStatsResponseDto {
  totalCreditIssued: number;
  totalCreditRedeemed: number;
  remainingBalance: number;
  activeUsersThisWeek: number;
}

export interface LoyaltyWithdrawalItemDto {
  id: number;
  userId: number;
  amount: number;
  iban: string;
  cardNumber?: string;
  accountHolderName: string;
  status: LoyaltyWithdrawalStatus;
  adminNote?: string;
  createdAt: Date;
  processedAt?: Date;
  processedByAdminId?: number;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    mobile?: string;
  };
}
