export type ReferralStats = {
  totalInvited: number;
  completedInvites: number;
  totalEarned: number;
};

export type ReferralHistoryItem = {
  id: number;
  friendName: string;
  friendPhone: string;
  status: 'PENDING' | 'COMPLETED';
  orderAmount: number;
  rewardEarned: number;
  discountCode?: string;
  createdAt: string;
  completedAt: string | null;
};

export type ReferralInfo = {
  referralCode: string;
  referralLink: string;
  rewardAmount: number;
  discountAmount: number;
  minOrderAmount: number;
  stats: ReferralStats;
  history: ReferralHistoryItem[];
};

export function useReferral() {
  const info = useState<ReferralInfo | null>('nimoura-referral-info', () => null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const toast = useAppToast();

  const fetchReferralInfo = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res: any = await $fetch('/api/loyalty/referral');
      const raw = res?.data || res;
      if (raw) {
        info.value = {
          referralCode: raw.referralCode,
          referralLink: raw.referralLink,
          rewardAmount: raw.rewardAmount,
          discountAmount: raw.discountAmount,
          minOrderAmount: raw.minOrderAmount,
          stats: {
            totalInvited: raw.totalInvited ?? 0,
            completedInvites: raw.successfulOrders ?? 0,
            totalEarned: raw.totalEarned ?? 0,
          },
          history: (raw.friends || []).map((f: any) => ({
            id: f.id,
            friendName: f.firstName,
            friendPhone: f.mobileMasked,
            status: f.status,
            orderAmount: 0,
            rewardEarned: f.rewardAmount,
            discountCode: f.discountCode,
            createdAt: f.createdAt,
            completedAt: f.completedAt,
          })),
        };
      }
    } catch (e: any) {
      error.value = e?.data?.message || 'خطا در دریافت اطلاعات معرف';
    } finally {
      loading.value = false;
    }
  };

  const copyCode = async () => {
    if (!info.value?.referralCode) return;
    try {
      await navigator.clipboard.writeText(info.value.referralCode);
      toast.add({
        severity: 'success',
        summary: 'کپی شد',
        detail: 'کد دعوت با موفقیت کپی شد',
        life: 2500,
      });
    } catch {
      toast.add({
        severity: 'warn',
        summary: 'کد دعوت',
        detail: info.value.referralCode,
        life: 4000,
      });
    }
  };

  const copyLink = async () => {
    if (!info.value) return;
    const link =
      info.value.referralLink ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}/?ref=${info.value.referralCode}`
        : '');
    try {
      await navigator.clipboard.writeText(link);
      toast.add({
        severity: 'success',
        summary: 'کپی شد',
        detail: 'لینک اختصاصی دعوت کپی شد',
        life: 2500,
      });
    } catch {
      toast.add({
        severity: 'warn',
        summary: 'لینک دعوت',
        detail: link,
        life: 4000,
      });
    }
  };

  const share = async () => {
    if (!info.value) return;
    const link =
      info.value.referralLink ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}/?ref=${info.value.referralCode}`
        : '');
    const text = `سلام! با لینک من از نیمورا خرید کن و ۵۰٬۰۰۰ تومان تخفیف روی اولین سفارشت بگیر:\n${link}`;
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: 'دعوت به فروشگاه نیمورا',
          text,
          url: link,
        });
        return;
      } catch {
        // share cancelled or unsupported
      }
    }
    await copyLink();
  };

  const copySpecificCode = async (code: string) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.add({
        severity: 'success',
        summary: 'کپی شد',
        detail: `کد تخفیف ${code} با موفقیت کپی شد`,
        life: 2500,
      });
    } catch {
      toast.add({
        severity: 'warn',
        summary: 'کد تخفیف',
        detail: code,
        life: 4000,
      });
    }
  };

  const validateCode = async (code: string, subtotal: number) => {
    try {
      const res: any = await $fetch('/api/loyalty/referral/validate', {
        method: 'POST',
        body: { code, subtotal },
      });
      return { valid: true, data: res?.data || res };
    } catch (e: any) {
      return {
        valid: false,
        message: e?.data?.message || 'کد معرف نامعتبر است',
      };
    }
  };

  return {
    info,
    loading,
    error,
    fetchReferralInfo,
    copyCode,
    copyLink,
    copySpecificCode,
    share,
    validateCode,
  };
}
