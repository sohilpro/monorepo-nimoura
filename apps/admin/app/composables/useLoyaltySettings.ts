export interface LoyaltySettings {
  isEnabled: boolean;
  weeklyRewardAmount: number;
  cashbackEnabled: boolean;
  cashbackMinimumOrderAmount: number;
  cashbackAmount: number;
  autoRedeemEnabled: boolean;
  referralEnabled?: boolean;
  referralRewardAmount?: number;
  referralDiscountAmount?: number;
  referralMinOrder?: number;
}

export interface LoyaltyStats {
  totalCreditIssued: number;
  totalCreditRedeemed: number;
  remainingBalance: number;
  activeUsersThisWeek: number;
}

export interface LoyaltyLedgerRecord {
  id: number;
  userId: number;
  amount: number;
  type: string;
  description?: string;
  orderId?: number;
  idempotencyKey: string;
  createdAt: string;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    mobile?: string;
  };
}

export interface LoyaltyWithdrawalRecord {
  id: number;
  userId: number;
  amount: number;
  iban: string;
  cardNumber?: string;
  accountHolderName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    mobile?: string;
  };
}

export interface AdminReferralRecord {
  id: number;
  referrerId: number;
  referrerName: string;
  referrerMobile: string;
  referredUserId: number;
  referredUserName: string;
  referredUserMobile: string;
  referralCode: string;
  discountCode?: string;
  status: 'PENDING' | 'COMPLETED';
  orderId?: number;
  orderFinalTotal?: number;
  rewardAmount: number;
  discountAmount: number;
  createdAt: string;
  completedAt?: string;
}

function normalizeSettings(value: any): LoyaltySettings {
  return {
    isEnabled: Boolean(value?.isEnabled ?? value?.enabled ?? true),
    weeklyRewardAmount: Number(
      value?.weeklyRewardAmount ?? value?.weeklyReward ?? 15000,
    ),
    cashbackEnabled: Boolean(value?.cashbackEnabled ?? true),
    cashbackMinimumOrderAmount: Number(
      value?.cashbackMinimumOrderAmount ?? value?.cashbackMinOrder ?? 2000000,
    ),
    cashbackAmount: Number(value?.cashbackAmount ?? 100000),
    autoRedeemEnabled: Boolean(
      value?.autoRedeemEnabled ?? value?.autoRedeem ?? true,
    ),
    referralEnabled: Boolean(value?.referralEnabled ?? true),
    referralRewardAmount: Number(value?.referralRewardAmount ?? 50000),
    referralDiscountAmount: Number(value?.referralDiscountAmount ?? 50000),
    referralMinOrder: Number(value?.referralMinOrder ?? 150000),
  };
}

function toApiPayload(payload: Partial<LoyaltySettings>) {
  return {
    ...(payload.isEnabled !== undefined
      ? { enabled: Boolean(payload.isEnabled) }
      : {}),
    ...(payload.weeklyRewardAmount !== undefined
      ? { weeklyReward: Number(payload.weeklyRewardAmount) }
      : {}),
    ...(payload.cashbackEnabled !== undefined
      ? { cashbackEnabled: Boolean(payload.cashbackEnabled) }
      : {}),
    ...(payload.cashbackMinimumOrderAmount !== undefined
      ? { cashbackMinOrder: Number(payload.cashbackMinimumOrderAmount) }
      : {}),
    ...(payload.cashbackAmount !== undefined
      ? { cashbackAmount: Number(payload.cashbackAmount) }
      : {}),
    ...(payload.autoRedeemEnabled !== undefined
      ? { autoRedeem: Boolean(payload.autoRedeemEnabled) }
      : {}),
    ...(payload.referralEnabled !== undefined
      ? { referralEnabled: Boolean(payload.referralEnabled) }
      : {}),
    ...(payload.referralRewardAmount !== undefined
      ? { referralRewardAmount: Number(payload.referralRewardAmount) }
      : {}),
    ...(payload.referralDiscountAmount !== undefined
      ? { referralDiscountAmount: Number(payload.referralDiscountAmount) }
      : {}),
    ...(payload.referralMinOrder !== undefined
      ? { referralMinOrder: Number(payload.referralMinOrder) }
      : {}),
  };
}

export function useLoyaltySettings() {
  const settings = useState<LoyaltySettings | null>(
    'admin-loyalty-settings',
    () => null,
  );
  const stats = useState<LoyaltyStats | null>('admin-loyalty-stats', () => null);
  const loading = ref(false);
  const error = ref<unknown>(null);

  async function fetchSettings() {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch<any>('/api/loyalty/settings');
      settings.value = normalizeSettings(response?.data ?? response);
      return settings.value;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateSettings(payload: Partial<LoyaltySettings>) {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch<any>('/api/loyalty/settings', {
        method: 'PATCH',
        body: toApiPayload(payload),
      });
      settings.value = normalizeSettings(response?.data ?? response);
      return settings.value;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStats() {
    try {
      const response = await $fetch<any>('/api/loyalty/stats');
      const val = response?.data ?? response;
      stats.value = {
        totalCreditIssued: Number(val?.totalCreditIssued ?? 0),
        totalCreditRedeemed: Number(val?.totalCreditRedeemed ?? 0),
        remainingBalance: Number(val?.remainingBalance ?? 0),
        activeUsersThisWeek: Number(val?.activeUsersThisWeek ?? 0),
      };
      return stats.value;
    } catch (err) {
      return null;
    }
  }

  async function fetchLedger(query: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
  }) {
    const res = await $fetch<any>('/api/loyalty/ledger', {
      params: query,
    });
    return res?.data ?? res;
  }

  async function searchUsers(q: string) {
    if (!q?.trim()) return [];
    const res = await $fetch<any>('/api/loyalty/users', {
      params: { q: q.trim() },
    });
    return res?.data ?? res;
  }

  async function submitAdjustment(payload: {
    userId: number;
    amount: number;
    description: string;
  }) {
    const res = await $fetch<any>('/api/loyalty/adjustments', {
      method: 'POST',
      body: payload,
    });
    await fetchStats();
    return res?.data ?? res;
  }

  async function fetchWithdrawals(query?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const res = await $fetch<any>('/api/loyalty/withdrawals', {
      params: query,
    });
    return res?.data ?? res;
  }

  async function processWithdrawal(
    id: number,
    status: 'APPROVED' | 'REJECTED',
    adminNote?: string,
  ) {
    const res = await $fetch<any>(`/api/loyalty/withdrawals/${id}`, {
      method: 'PATCH',
      body: { status, adminNote },
    });
    await fetchStats();
    return res?.data ?? res;
  }

  async function fetchReferrals(query?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const res = await $fetch<any>('/api/loyalty/referrals', {
      params: query,
    });
    return res?.data ?? res;
  }

  return {
    settings,
    stats,
    loading,
    error,
    fetchSettings,
    updateSettings,
    fetchStats,
    fetchLedger,
    searchUsers,
    submitAdjustment,
    fetchWithdrawals,
    processWithdrawal,
    fetchReferrals,
  };
}
