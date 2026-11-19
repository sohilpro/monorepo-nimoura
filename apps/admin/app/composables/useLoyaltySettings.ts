export interface LoyaltySettings {
  isEnabled: boolean;
  weeklyRewardAmount: number;
  cashbackEnabled: boolean;
  cashbackMinimumOrderAmount: number;
  cashbackAmount: number;
  autoRedeemEnabled?: boolean;
}

function normalizeSettings(value: any): LoyaltySettings {
  return {
    isEnabled: Boolean(value?.isEnabled ?? value?.enabled ?? true),
    weeklyRewardAmount: Number(value?.weeklyRewardAmount ?? value?.weeklyReward ?? 15000),
    cashbackEnabled: Boolean(value?.cashbackEnabled ?? true),
    cashbackMinimumOrderAmount: Number(value?.cashbackMinimumOrderAmount ?? value?.cashbackMinOrder ?? 2000000),
    cashbackAmount: Number(value?.cashbackAmount ?? 100000),
    autoRedeemEnabled: Boolean(value?.autoRedeemEnabled ?? value?.autoRedeem ?? true),
  };
}

function toApiPayload(payload: Partial<LoyaltySettings>) {
  return {
    ...(payload.isEnabled !== undefined ? { enabled: Boolean(payload.isEnabled) } : {}),
    ...(payload.weeklyRewardAmount !== undefined ? { weeklyReward: Number(payload.weeklyRewardAmount) } : {}),
    ...(payload.cashbackEnabled !== undefined ? { cashbackEnabled: Boolean(payload.cashbackEnabled) } : {}),
    ...(payload.cashbackMinimumOrderAmount !== undefined ? { cashbackMinOrder: Number(payload.cashbackMinimumOrderAmount) } : {}),
    ...(payload.cashbackAmount !== undefined ? { cashbackAmount: Number(payload.cashbackAmount) } : {}),
    ...(payload.autoRedeemEnabled !== undefined ? { autoRedeem: Boolean(payload.autoRedeemEnabled) } : {}),
  };
}

export function useLoyaltySettings() {
  const settings = useState<LoyaltySettings | null>('admin-loyalty-settings', () => null);
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

  return { settings, loading, error, fetchSettings, updateSettings };
}
