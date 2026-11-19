export interface LoyaltyBalance {
  balance: number;
  weeklyVisitCount: number;
  weeklyVisitDates?: string[];
  weekCompleted?: boolean;
  weeklyReward?: number;
  cashbackMinOrder?: number;
  cashbackAmount?: number;
  enabled?: boolean;
  cashbackEnabled?: boolean;
  autoRedeem?: boolean;
}

export interface LoyaltyWithdrawalItem {
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
}

export interface CreateWithdrawalPayload {
  amount: number;
  iban: string;
  cardNumber?: string;
  accountHolderName: string;
}

function normalizeLoyaltyResponse(response: any): LoyaltyBalance {
  const value = response?.data !== undefined ? response.data : response;
  if (typeof value === 'number') {
    return {
      balance: value,
      weeklyVisitCount: 0,
      weeklyVisitDates: [],
      weekCompleted: false,
      weeklyReward: 0,
    };
  }

  const rawBalance =
    typeof value?.balance === 'number'
      ? value.balance
      : Number(value?.balance ?? 0);

  return {
    balance: isNaN(rawBalance) ? 0 : rawBalance,
    weeklyVisitCount: Number(value?.weeklyVisitCount ?? value?.days ?? 0),
    weeklyVisitDates: Array.isArray(value?.weeklyVisitDates)
      ? value.weeklyVisitDates
      : [],
    weekCompleted: Boolean(value?.weekCompleted ?? value?.completed),
    weeklyReward: Number(value?.weeklyReward ?? value?.reward ?? 0),
    cashbackMinOrder: Number(value?.cashbackMinOrder ?? 2000000),
    cashbackAmount: Number(value?.cashbackAmount ?? 100000),
    enabled: Boolean(value?.enabled ?? true),
    cashbackEnabled: Boolean(value?.cashbackEnabled ?? true),
    autoRedeem: Boolean(value?.autoRedeem ?? true),
  };
}

export function useLoyalty() {
  const auth = useAuth();
  const balance = useState<LoyaltyBalance | null>(
    'loyalty-balance',
    () => null,
  );
  const pending = useState('loyalty-pending', () => false);
  const error = useState<unknown>('loyalty-error', () => null);
  const withdrawals = useState<LoyaltyWithdrawalItem[]>(
    'loyalty-withdrawals',
    () => [],
  );

  async function refresh() {
    if (!auth.value) {
      balance.value = null;
      return null;
    }
    pending.value = true;
    error.value = null;
    try {
      const response = await $fetch<any>('/api/loyalty/summary');
      balance.value = normalizeLoyaltyResponse(response);
      return balance.value;
    } catch (cause) {
      error.value = cause;
      return null;
    } finally {
      pending.value = false;
    }
  }

  async function registerVisit() {
    if (!auth.value) return null;
    try {
      const response = await $fetch<any>('/api/loyalty/visit', {
        method: 'POST',
      });
      balance.value = normalizeLoyaltyResponse(response);
      return balance.value;
    } catch (cause) {
      error.value = cause;
      return null;
    }
  }

  async function requestWithdrawal(payload: CreateWithdrawalPayload) {
    const res = await $fetch<any>('/api/loyalty/withdrawals', {
      method: 'POST',
      body: payload,
    });
    await refresh();
    await fetchWithdrawals();
    return res;
  }

  async function fetchWithdrawals() {
    if (!auth.value) return [];
    try {
      const res = await $fetch<any>('/api/loyalty/withdrawals');
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      withdrawals.value = list;
      return list;
    } catch {
      return [];
    }
  }

  const balanceAmount = computed(() => balance.value?.balance ?? 0);
  const visitCount = computed(() =>
    Math.min(balance.value?.weeklyVisitCount ?? 0, 7),
  );

  return {
    balance,
    balanceAmount,
    visitCount,
    withdrawals,
    pending,
    error,
    refresh,
    registerVisit,
    requestWithdrawal,
    fetchWithdrawals,
  };
}
