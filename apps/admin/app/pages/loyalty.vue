<script setup lang="ts">
import { numberFormat, formatDate } from '@nimoura/utils';

const toast = useAppToast();
const {
  settings,
  stats,
  loading,
  fetchSettings,
  updateSettings,
  fetchStats,
  fetchLedger,
  searchUsers,
  submitAdjustment,
  fetchWithdrawals,
  processWithdrawal,
  fetchReferrals,
} = useLoyaltySettings();

const activeTab = ref<'settings' | 'ledger' | 'adjustment' | 'withdrawals' | 'referrals'>('settings');

// ─── Settings Form ──────────────────────────────
const form = reactive({
  isEnabled: true,
  weeklyRewardAmount: 15000,
  cashbackEnabled: true,
  cashbackMinimumOrderAmount: 2000000,
  cashbackAmount: 100000,
  autoRedeemEnabled: true,
  referralEnabled: true,
  referralRewardAmount: 50000,
  referralDiscountAmount: 50000,
  referralMinOrder: 150000,
});

// ─── Ledger State ───────────────────────────────
const ledgerItems = ref<any[]>([]);
const ledgerTotal = ref(0);
const ledgerPage = ref(1);
const ledgerLimit = ref(15);
const ledgerTypeFilter = ref('');
const ledgerSearch = ref('');
const ledgerLoading = ref(false);

// ─── Adjustment State ───────────────────────────
const userSearchQuery = ref('');
const searchedUsers = ref<any[]>([]);
const selectedUser = ref<any | null>(null);
const userSearching = ref(false);
const adjustmentType = ref<'add' | 'subtract'>('add');
const adjustmentAmount = ref<number | null>(null);
const adjustmentDescription = ref('');
const adjustmentSubmitting = ref(false);
const showAdjustmentConfirm = ref(false);

// ─── Withdrawals State ──────────────────────────
const withdrawalItems = ref<any[]>([]);
const withdrawalTotal = ref(0);
const withdrawalPage = ref(1);
const withdrawalStatusFilter = ref('');
const withdrawalLoading = ref(false);
const rejectingWithdrawal = ref<any | null>(null);
const rejectNote = ref('');
const processingWithdrawalId = ref<number | null>(null);

// ─── Referrals State ────────────────────────────
const referralItems = ref<any[]>([]);
const referralTotal = ref(0);
const referralPage = ref(1);
const referralStatusFilter = ref('');
const referralLoading = ref(false);

async function loadReferrals() {
  referralLoading.value = true;
  try {
    const res = await fetchReferrals({
      page: referralPage.value,
      limit: 15,
      status: referralStatusFilter.value || undefined,
    });
    referralItems.value = res?.items ?? [];
    referralTotal.value = res?.total ?? 0;
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا در بارگذاری لیست رفرال‌ها',
      detail: e?.message,
      life: 4000,
    });
  } finally {
    referralLoading.value = false;
  }
}

watch([referralPage, referralStatusFilter], () => {
  if (activeTab.value === 'referrals') {
    loadReferrals();
  }
});

watch(activeTab, (tab) => {
  if (tab === 'referrals' && !referralItems.value.length) {
    loadReferrals();
  }
});

// ─── Initial Load ───────────────────────────────
onMounted(async () => {
  await Promise.all([loadSettings(), fetchStats()]);
});

async function loadSettings() {
  try {
    const value = await fetchSettings();
    if (value) {
      Object.assign(form, {
        isEnabled: value.isEnabled,
        weeklyRewardAmount: Number(value.weeklyRewardAmount),
        cashbackEnabled: value.cashbackEnabled,
        cashbackMinimumOrderAmount: Number(value.cashbackMinimumOrderAmount),
        cashbackAmount: Number(value.cashbackAmount),
        autoRedeemEnabled: Boolean(value.autoRedeemEnabled),
        referralEnabled: value.referralEnabled !== false,
        referralRewardAmount: Number(value.referralRewardAmount ?? 50000),
        referralDiscountAmount: Number(value.referralDiscountAmount ?? 50000),
        referralMinOrder: Number(value.referralMinOrder ?? 150000),
      });
    }
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا در دریافت تنظیمات',
      detail: e?.data?.statusMessage || e?.message,
      life: 4000,
    });
  }
}

async function saveSettings() {
  try {
    await updateSettings({ ...form });
    toast.add({
      severity: 'success',
      summary: 'موفقیت',
      detail: 'تنظیمات باشگاه مشتریان با موفقیت ذخیره شد.',
      life: 3000,
    });
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'ذخیره تنظیمات ناموفق بود',
      detail: e?.data?.statusMessage || e?.message,
      life: 4000,
    });
  }
}

// ─── Ledger Actions ─────────────────────────────
watch(
  [activeTab, ledgerPage, ledgerTypeFilter],
  () => {
    if (activeTab.value === 'ledger') {
      loadLedger();
    }
  },
);

async function loadLedger() {
  ledgerLoading.value = true;
  try {
    const res = await fetchLedger({
      page: ledgerPage.value,
      limit: ledgerLimit.value,
      type: ledgerTypeFilter.value || undefined,
      search: ledgerSearch.value?.trim() || undefined,
    });
    ledgerItems.value = res?.items ?? [];
    ledgerTotal.value = res?.total ?? 0;
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا در بارگذاری تراکنش‌ها',
      detail: e?.message,
      life: 3000,
    });
  } finally {
    ledgerLoading.value = false;
  }
}

function handleLedgerSearch() {
  ledgerPage.value = 1;
  loadLedger();
}

// ─── User Search for Adjustment ─────────────────
let searchTimer: any = null;
function onUserSearchInput() {
  clearTimeout(searchTimer);
  if (!userSearchQuery.value || userSearchQuery.value.trim().length < 2) {
    searchedUsers.value = [];
    return;
  }
  searchTimer = setTimeout(async () => {
    userSearching.value = true;
    try {
      searchedUsers.value = await searchUsers(userSearchQuery.value.trim());
    } finally {
      userSearching.value = false;
    }
  }, 350);
}

function selectUserForAdjustment(u: any) {
  selectedUser.value = u;
  searchedUsers.value = [];
  userSearchQuery.value = `${u.firstName || ''} ${u.lastName || ''} (${u.mobile || ''})`.trim();
}

function resetAdjustmentForm() {
  selectedUser.value = null;
  userSearchQuery.value = '';
  adjustmentAmount.value = null;
  adjustmentDescription.value = '';
}

function askAdjustmentConfirm() {
  if (!selectedUser.value) {
    toast.add({ severity: 'warn', summary: 'کاربر انتخاب نشده است', life: 3000 });
    return;
  }
  if (!adjustmentAmount.value || adjustmentAmount.value <= 0) {
    toast.add({ severity: 'warn', summary: 'مبلغ نامعتبر است', life: 3000 });
    return;
  }
  if (!adjustmentDescription.value.trim()) {
    toast.add({ severity: 'warn', summary: 'توضیحات و دلیل تغییر الزامی است', life: 3000 });
    return;
  }
  if (
    adjustmentType.value === 'subtract' &&
    adjustmentAmount.value > (selectedUser.value.balance || 0)
  ) {
    toast.add({
      severity: 'error',
      summary: 'موجودی ناکافی',
      detail: 'مبلغ کسر بیشتر از موجودی فعلی کاربر است.',
      life: 3000,
    });
    return;
  }
  showAdjustmentConfirm.value = true;
}

async function doSubmitAdjustment() {
  if (!selectedUser.value || !adjustmentAmount.value) return;
  adjustmentSubmitting.value = true;
  try {
    const finalAmount =
      adjustmentType.value === 'add'
        ? Number(adjustmentAmount.value)
        : -Number(adjustmentAmount.value);

    await submitAdjustment({
      userId: selectedUser.value.id,
      amount: finalAmount,
      description: adjustmentDescription.value.trim(),
    });

    toast.add({
      severity: 'success',
      summary: 'ثبت شد',
      detail: 'تغییر دستی اعتبار با موفقیت اعمال گردید.',
      life: 3000,
    });

    showAdjustmentConfirm.value = false;
    resetAdjustmentForm();
    await fetchStats();
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا در ثبت تغییر اعتبار',
      detail: e?.data?.message || e?.message,
      life: 4000,
    });
  } finally {
    adjustmentSubmitting.value = false;
  }
}

// ─── Withdrawals Actions ────────────────────────
watch([activeTab, withdrawalPage, withdrawalStatusFilter], () => {
  if (activeTab.value === 'withdrawals') {
    loadWithdrawals();
  }
});

async function loadWithdrawals() {
  withdrawalLoading.value = true;
  try {
    const res = await fetchWithdrawals({
      page: withdrawalPage.value,
      limit: 15,
      status: withdrawalStatusFilter.value || undefined,
    });
    withdrawalItems.value = res?.items ?? [];
    withdrawalTotal.value = res?.total ?? 0;
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا در دریافت درخواست‌های برداشت',
      detail: e?.message,
      life: 3000,
    });
  } finally {
    withdrawalLoading.value = false;
  }
}

async function handleApproveWithdrawal(id: number) {
  processingWithdrawalId.value = id;
  try {
    await processWithdrawal(id, 'APPROVED');
    toast.add({
      severity: 'success',
      summary: 'تأیید شد',
      detail: 'درخواست برداشت تأیید و تسویه ثبت شد.',
      life: 3000,
    });
    await loadWithdrawals();
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا در تأیید درخواست',
      detail: e?.data?.message || e?.message,
      life: 4000,
    });
  } finally {
    processingWithdrawalId.value = null;
  }
}

function openRejectWithdrawalModal(item: any) {
  rejectingWithdrawal.value = item;
  rejectNote.value = '';
}

async function handleConfirmRejectWithdrawal() {
  if (!rejectingWithdrawal.value) return;
  processingWithdrawalId.value = rejectingWithdrawal.value.id;
  try {
    await processWithdrawal(
      rejectingWithdrawal.value.id,
      'REJECTED',
      rejectNote.value.trim() || undefined,
    );
    toast.add({
      severity: 'info',
      summary: 'درخواست رد شد',
      detail: 'درخواست رد و مبلغ اعتبار به حساب کاربر بازگردانده شد.',
      life: 4000,
    });
    rejectingWithdrawal.value = null;
    await loadWithdrawals();
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'خطا در رد درخواست',
      detail: e?.data?.message || e?.message,
      life: 4000,
    });
  } finally {
    processingWithdrawalId.value = null;
  }
}

// ─── Export CSV ─────────────────────────────────
function exportLedgerCsv() {
  if (!ledgerItems.value.length) return;
  const headers = ['شناسه', 'کاربر', 'شماره موبایل', 'نوع تراکنش', 'مبلغ (تومان)', 'توضیحات', 'کد پیگیری/سفارش', 'تاریخ'];
  const rows = ledgerItems.value.map((i) => [
    i.id,
    `${i.user?.firstName || ''} ${i.user?.lastName || ''}`.trim() || '-',
    i.user?.mobile || '-',
    getLedgerTypeLabel(i.type),
    i.amount,
    `"${(i.description || '').replace(/"/g, '""')}"`,
    i.orderId || '-',
    formatDate(i.createdAt),
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `loyalty_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getLedgerTypeLabel(type: string): string {
  const map: Record<string, string> = {
    WEEKLY_VISIT_REWARD: 'پاداش هفتگی',
    CASHBACK: 'کش‌بک سفارش',
    ORDER_REDEMPTION: 'مصرف در سفارش',
    ORDER_REDEMPTION_REFUND: 'استرداد لغو سفارش',
    MANUAL_ADJUSTMENT: 'تنظیم دستی',
    REFERRAL_REWARD: 'پاداش دعوت دوست (رفرال)',
    WITHDRAWAL: 'برداشت و تسویه',
    WITHDRAWAL_REFUND: 'استرداد برداشت رد شده',
  };
  return map[type] || type;
}

function getLedgerTypeBadgeClass(type: string): string {
  switch (type) {
    case 'WEEKLY_VISIT_REWARD':
    case 'CASHBACK':
    case 'REFERRAL_REWARD':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'ORDER_REDEMPTION':
    case 'WITHDRAWAL':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'ORDER_REDEMPTION_REFUND':
    case 'WITHDRAWAL_REFUND':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    default:
      return 'bg-purple-50 text-purple-700 border-purple-200';
  }
}
</script>

<template>
  <section class="space-y-6" dir="rtl">
    <!-- Header -->
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'باشگاه مشتریان و کش‌بک', href: '' },
      ]"
      title="باشگاه مشتریان و کش‌بک"
      subtitle="مدیریت جامع پاداش هفتگی، تراکنش‌ها، کش‌بک و تسویه اعتبار مشتریان"
    />

    <!-- KPI Statistics Cards -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500">کل اعتبار صادرشده</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <i class="pi pi-arrow-up-right text-base" />
          </span>
        </div>
        <p class="mt-3 text-xl font-bold font-modam text-emerald-600">
          {{ numberFormat(stats?.totalCreditIssued ?? 0) }} <span class="text-xs font-normal text-gray-500">تومان</span>
        </p>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500">کل اعتبار مصرف‌شده</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <i class="pi pi-shopping-cart text-base" />
          </span>
        </div>
        <p class="mt-3 text-xl font-bold font-modam text-rose-600">
          {{ numberFormat(stats?.totalCreditRedeemed ?? 0) }} <span class="text-xs font-normal text-gray-500">تومان</span>
        </p>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500">موجودی باقیمانده نزد کاربران</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <i class="pi pi-wallet text-base" />
          </span>
        </div>
        <p class="mt-3 text-xl font-bold font-modam text-blue-600">
          {{ numberFormat(stats?.remainingBalance ?? 0) }} <span class="text-xs font-normal text-gray-500">تومان</span>
        </p>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500">مشتریان فعال این هفته</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <i class="pi pi-users text-base" />
          </span>
        </div>
        <p class="mt-3 text-xl font-bold font-modam text-purple-600">
          {{ numberFormat(stats?.activeUsersThisWeek ?? 0) }} <span class="text-xs font-normal text-gray-500">کاربر</span>
        </p>
      </div>
    </div>

    <!-- Tab Bar -->
    <div class="flex gap-2 border-b border-gray-200 pb-2">
      <button
        type="button"
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer"
        :class="
          activeTab === 'settings'
            ? 'bg-brand-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        "
        @click="activeTab = 'settings'"
      >
        <i class="pi pi-cog text-xs" />
        <span>تنظیمات سیستم</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer"
        :class="
          activeTab === 'ledger'
            ? 'bg-brand-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        "
        @click="activeTab = 'ledger'"
      >
        <i class="pi pi-list text-xs" />
        <span>تراکنش‌های باشگاه (Ledger)</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer"
        :class="
          activeTab === 'adjustment'
            ? 'bg-brand-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        "
        @click="activeTab = 'adjustment'"
      >
        <i class="pi pi-user-edit text-xs" />
        <span>تنظیم دستی اعتبار</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer"
        :class="
          activeTab === 'withdrawals'
            ? 'bg-brand-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        "
        @click="activeTab = 'withdrawals'"
      >
        <i class="pi pi-money-bill text-xs" />
        <span>درخواست‌های تسویه و برداشت</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer"
        :class="
          activeTab === 'referrals'
            ? 'bg-brand-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        "
        @click="activeTab = 'referrals'"
      >
        <i class="pi pi-users text-xs" />
        <span>سیستم رفرال و معرف‌ها</span>
      </button>
    </div>

    <!-- ══ TAB 1: SETTINGS ══ -->
    <div v-if="activeTab === 'settings'" class="space-y-6">
      <form
        class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6"
        @submit.prevent="saveSettings"
      >
        <!-- General Toggles -->
        <div class="grid gap-6 md:grid-cols-2 border-b border-gray-100 pb-5">
          <div class="flex items-center justify-between rounded-xl bg-gray-50/60 p-4 border border-gray-100">
            <div>
              <h2 class="font-semibold text-gray-800 text-sm">فعال‌سازی باشگاه مشتریان</h2>
              <p class="text-xs text-gray-500 mt-0.5">ثبت حضور هفتگی و فعال بودن سیستم اعتبار</p>
            </div>
            <ToggleSwitch v-model="form.isEnabled" />
          </div>

          <div class="flex items-center justify-between rounded-xl bg-gray-50/60 p-4 border border-gray-100">
            <div>
              <h2 class="font-semibold text-gray-800 text-sm">مصرف خودکار اعتبار در فاکتور (Auto-Redeem)</h2>
              <p class="text-xs text-gray-500 mt-0.5">کسر خودکار موجودی از مبلغ قابل پرداخت کاربر در چکاوت</p>
            </div>
            <ToggleSwitch v-model="form.autoRedeemEnabled" />
          </div>
        </div>

        <!-- Weekly & Cashback Numbers -->
        <div class="grid gap-5 md:grid-cols-3">
          <CommonFormattedNumberInput
            v-model="form.weeklyRewardAmount"
            label="پاداش تکمیل ۷ روز بازدید (تومان)"
          />
          <CommonFormattedNumberInput
            v-model="form.cashbackMinimumOrderAmount"
            label="حداقل سبد خرید برای کش‌بک (تومان)"
          />
          <CommonFormattedNumberInput
            v-model="form.cashbackAmount"
            label="مبلغ کش‌بک دریافتی (تومان)"
          />
        </div>

        <!-- Cashback Toggle -->
        <div class="flex items-center justify-between rounded-xl bg-gray-50/60 p-4 border border-gray-100">
          <div>
            <h2 class="font-semibold text-gray-800 text-sm">فعال‌سازی کش‌بک سفارش‌ها</h2>
            <p class="text-xs text-gray-500 mt-0.5">پس از پرداخت قطعی سفارش‌های بالاتر از حد نصاب ثبت می‌شود</p>
          </div>
          <ToggleSwitch v-model="form.cashbackEnabled" />
        </div>

        <!-- Referral Settings Section -->
        <div class="border-t border-gray-100 pt-5 space-y-4">
          <div class="flex items-center justify-between rounded-xl bg-gray-50/60 p-4 border border-gray-100">
            <div>
              <h2 class="font-semibold text-gray-800 text-sm">فعال‌سازی سیستم معرفی و رفرال (دعوت دوستان)</h2>
              <p class="text-xs text-gray-500 mt-0.5">اعطای کد تخفیف به دوست و شارژ پاداش نقدی به معرف پس از خرید اول</p>
            </div>
            <ToggleSwitch v-model="form.referralEnabled" />
          </div>

          <div class="grid gap-5 md:grid-cols-3">
            <CommonFormattedNumberInput
              v-model="form.referralRewardAmount"
              label="پاداش نقدی معرف (تومان)"
            />
            <CommonFormattedNumberInput
              v-model="form.referralDiscountAmount"
              label="مبلغ تخفیف دوست دعوت‌شده (تومان)"
            />
            <CommonFormattedNumberInput
              v-model="form.referralMinOrder"
              label="حداقل سبد خرید برای تخفیف دوست (تومان)"
            />
          </div>
        </div>

        <!-- Live Preview Banner -->
        <div class="rounded-xl border border-brand-200 bg-brand-50/40 p-4 text-brand-900 text-sm flex items-start gap-3">
          <i class="pi pi-info-circle text-brand-600 mt-0.5 text-base" />
          <div>
            <p class="font-semibold text-brand-800">پیش‌نمایش زنده قانون باشگاه مشتریان و رفرال:</p>
            <p class="text-xs text-brand-700 mt-1 leading-relaxed">
              • کاربر با حضور در هر ۷ روز هفته (از شنبه تا جمعه بر اساس تقویم ایران)، مبلغ
              <strong>{{ numberFormat(form.weeklyRewardAmount) }} تومان</strong> پاداش دریافت می‌کند.
              <br />
              • در صورت فعال بودن کش‌بک، مشتری با خرید به مبلغ حداقل
              <strong>{{ numberFormat(form.cashbackMinimumOrderAmount) }} تومان</strong>، مبلغ
              <strong>{{ numberFormat(form.cashbackAmount) }} تومان</strong> کش‌بک نقدی در کیف پول خود دریافت می‌نماید.
              <br />
              • در صورت فعال بودن رفرال، هر دوست دعوت‌شده بلافاصله پس از ثبت‌نام با کد معرف، مبلغ
              <strong>{{ numberFormat(form.referralRewardAmount) }} تومان</strong> اعتبار نقدی در باشگاه مشتریان دریافت نموده و یک کد تخفیف اختصاصی
              <strong>{{ numberFormat(form.referralDiscountAmount) }} تومانی</strong> (برای سفارش‌های حداقل {{ numberFormat(form.referralMinOrder) }} تومان) به همراه پیامک تبریک برای معرف صادر می‌گردد.
            </p>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <Button
            type="submit"
            label="ذخیره تنظیمات"
            icon="pi pi-check"
            class="!bg-brand-500 !border-brand-500 text-white px-6"
            :loading="loading"
          />
        </div>
      </form>
    </div>

    <!-- ══ TAB 2: LEDGER ══ -->
    <div v-else-if="activeTab === 'ledger'" class="space-y-4">
      <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <!-- Filters Row -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <input
              v-model="ledgerSearch"
              type="text"
              placeholder="جستجو در توضیحات، کاربر یا شماره موبایل..."
              class="h-10 w-64 rounded-xl border border-gray-300 px-3 text-xs focus:border-brand-400 focus:outline-none"
              @keyup.enter="handleLedgerSearch"
            />
            <Button
              label="جستجو"
              icon="pi pi-search"
              class="p-button-sm !bg-gray-100 !text-gray-700 !border-gray-200 hover:!bg-gray-200"
              @click="handleLedgerSearch"
            />
            <select
              v-model="ledgerTypeFilter"
              class="h-10 rounded-xl border border-gray-300 px-3 text-xs focus:border-brand-400 focus:outline-none bg-white"
            >
              <option value="">همه انواع تراکنش‌ها</option>
              <option value="WEEKLY_VISIT_REWARD">پاداش هفتگی</option>
              <option value="CASHBACK">کش‌بک خرید</option>
              <option value="ORDER_REDEMPTION">مصرف در سفارش</option>
              <option value="ORDER_REDEMPTION_REFUND">استرداد لغو سفارش</option>
              <option value="MANUAL_ADJUSTMENT">تنظیم دستی ادمین</option>
              <option value="WITHDRAWAL">برداشت و تسویه</option>
              <option value="WITHDRAWAL_REFUND">استرداد برداشت رد شده</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <Button
              label="خروجی CSV"
              icon="pi pi-file-excel"
              class="p-button-sm p-button-outlined text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              :disabled="!ledgerItems.length"
              @click="exportLedgerCsv"
            />
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs text-gray-700">
            <thead class="bg-gray-50 text-gray-500 font-semibold border-b">
              <tr>
                <th class="py-3 px-3">شناسه</th>
                <th class="py-3 px-3">کاربر</th>
                <th class="py-3 px-3">نوع تراکنش</th>
                <th class="py-3 px-3">مبلغ (تومان)</th>
                <th class="py-3 px-3">سفارش</th>
                <th class="py-3 px-3">توضیحات</th>
                <th class="py-3 px-3">تاریخ</th>
              </tr>
            </thead>
            <tbody v-if="!ledgerLoading && ledgerItems.length" class="divide-y divide-gray-100">
              <tr v-for="item in ledgerItems" :key="item.id" class="hover:bg-gray-50/50">
                <td class="py-3 px-3 font-mono text-gray-400">#{{ item.id }}</td>
                <td class="py-3 px-3">
                  <div v-if="item.user">
                    <p class="font-medium text-gray-800">
                      {{ item.user.firstName || '' }} {{ item.user.lastName || '' }}
                    </p>
                    <p class="text-[11px] text-gray-400 font-mono">{{ item.user.mobile }}</p>
                  </div>
                  <span v-else class="text-gray-400">کاربر #{{ item.userId }}</span>
                </td>
                <td class="py-3 px-3">
                  <span
                    class="rounded-full px-2.5 py-1 text-[11px] font-medium border"
                    :class="getLedgerTypeBadgeClass(item.type)"
                  >
                    {{ getLedgerTypeLabel(item.type) }}
                  </span>
                </td>
                <td class="py-3 px-3 font-modam font-bold text-sm">
                  <span :class="item.amount > 0 ? 'text-emerald-600' : 'text-rose-600'">
                    {{ item.amount > 0 ? '+' : '' }}{{ numberFormat(item.amount) }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span v-if="item.orderId" class="font-mono text-gray-600">#{{ item.orderId }}</span>
                  <span v-else class="text-gray-300">-</span>
                </td>
                <td class="py-3 px-3 max-w-xs truncate text-gray-600" :title="item.description">
                  {{ item.description || '-' }}
                </td>
                <td class="py-3 px-3 text-gray-400 whitespace-nowrap">
                  {{ formatDate(item.createdAt) }}
                </td>
              </tr>
            </tbody>
            <tbody v-else-if="ledgerLoading">
              <tr>
                <td colspan="7" class="py-8 text-center text-gray-400">در حال بارگذاری تراکنش‌ها...</td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="7" class="py-8 text-center text-gray-400">تراکنشی یافت نشد.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t pt-3 text-xs text-gray-500">
          <span>کل موارد: {{ numberFormat(ledgerTotal) }}</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg border px-2.5 py-1 disabled:opacity-40"
              :disabled="ledgerPage <= 1"
              @click="ledgerPage--"
            >
              صفحه قبل
            </button>
            <span>صفحه {{ ledgerPage }}</span>
            <button
              type="button"
              class="rounded-lg border px-2.5 py-1 disabled:opacity-40"
              :disabled="ledgerPage * ledgerLimit >= ledgerTotal"
              @click="ledgerPage++"
            >
              صفحه بعد
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ TAB 3: MANUAL ADJUSTMENT ══ -->
    <div v-else-if="activeTab === 'adjustment'" class="space-y-6">
      <div class="max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 class="text-base font-bold text-gray-800">تنظیم دستی اعتبار کاربر</h2>
          <p class="text-xs text-gray-500 mt-1">
            امکان افزایش یا کسر اعتبار با قفل اتمیک و جلوگیری از موجودی منفی
          </p>
        </div>

        <!-- User Search -->
        <div class="relative">
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            جستجو و انتخاب مشتری <span class="text-red-500">*</span>
          </label>
          <input
            v-model="userSearchQuery"
            type="text"
            placeholder="شماره موبایل، نام یا نام خانوادگی مشتری را تایپ کنید..."
            class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            @input="onUserSearchInput"
          />
          <div
            v-if="userSearching"
            class="absolute end-3 top-9 text-xs text-gray-400"
          >
            در حال جستجو...
          </div>

          <!-- Search Results Dropdown -->
          <div
            v-if="searchedUsers.length"
            class="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-56 overflow-y-auto divide-y divide-gray-100"
          >
            <div
              v-for="u in searchedUsers"
              :key="u.id"
              class="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer text-xs"
              @click="selectUserForAdjustment(u)"
            >
              <div>
                <p class="font-semibold text-gray-800">{{ u.firstName || '' }} {{ u.lastName || '' }}</p>
                <p class="text-gray-400 font-mono">{{ u.mobile }}</p>
              </div>
              <div class="text-start">
                <span class="text-gray-400 text-[10px]">موجودی:</span>
                <span class="font-modam font-bold text-brand-600 block">
                  {{ numberFormat(u.balance) }} ت
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected User Card -->
        <div
          v-if="selectedUser"
          class="rounded-xl border border-brand-200 bg-brand-50/30 p-4 text-xs flex items-center justify-between"
        >
          <div>
            <p class="font-bold text-gray-800 text-sm">
              {{ selectedUser.firstName || '' }} {{ selectedUser.lastName || '' }}
            </p>
            <p class="text-gray-500 mt-0.5 font-mono">موبایل: {{ selectedUser.mobile }}</p>
          </div>
          <div class="text-start">
            <span class="text-gray-500 text-xs">موجودی فعلی:</span>
            <p class="font-modam text-base font-bold text-brand-700">
              {{ numberFormat(selectedUser.balance) }} تومان
            </p>
          </div>
        </div>

        <!-- Operation Type Toggle -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-2">نوع عملیات:</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="rounded-xl border p-3 text-center text-xs font-semibold transition-all cursor-pointer"
              :class="
                adjustmentType === 'add'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              "
              @click="adjustmentType = 'add'"
            >
              <i class="pi pi-plus-circle me-1" />
              افزایش اعتبار (پاداش / تشویقی)
            </button>
            <button
              type="button"
              class="rounded-xl border p-3 text-center text-xs font-semibold transition-all cursor-pointer"
              :class="
                adjustmentType === 'subtract'
                  ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              "
              @click="adjustmentType = 'subtract'"
            >
              <i class="pi pi-minus-circle me-1" />
              کسر اعتبار (جریمه / تسویه)
            </button>
          </div>
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            مبلغ تغییر (تومان) <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="adjustmentAmount"
            type="number"
            min="1000"
            placeholder="مثلاً ۵۰۰۰۰"
            class="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            علت و توضیحات تغییر <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="adjustmentDescription"
            rows="3"
            placeholder="دلیل تغییر دستی اعتبار را به صورت شفاف بنویسید (مثلاً جبران تأخیر ارسال سفارش)"
            class="w-full rounded-xl border border-gray-300 p-3 text-xs focus:border-brand-400 focus:outline-none"
          />
        </div>

        <!-- Live Balance Simulation -->
        <div
          v-if="selectedUser && adjustmentAmount"
          class="rounded-xl bg-gray-50 p-3.5 border border-gray-200 text-xs flex items-center justify-between"
        >
          <span class="text-gray-500">موجودی تخمینی پس از اعمال:</span>
          <span
            class="font-modam text-sm font-bold"
            :class="
              adjustmentType === 'add'
                ? 'text-emerald-700'
                : selectedUser.balance - adjustmentAmount < 0
                ? 'text-rose-600'
                : 'text-gray-800'
            "
          >
            {{
              numberFormat(
                adjustmentType === 'add'
                  ? selectedUser.balance + adjustmentAmount
                  : selectedUser.balance - adjustmentAmount,
              )
            }}
            تومان
          </span>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            label="انصراف"
            class="p-button-text p-button-sm text-gray-500"
            @click="resetAdjustmentForm"
          />
          <Button
            type="button"
            label="ثبت و اعمال تغییر"
            icon="pi pi-check"
            class="!bg-brand-500 !border-brand-500 text-white p-button-sm px-5"
            :disabled="!selectedUser || !adjustmentAmount || !adjustmentDescription.trim()"
            @click="askAdjustmentConfirm"
          />
        </div>
      </div>
    </div>

    <!-- ══ TAB 4: WITHDRAWALS ══ -->
    <div v-else-if="activeTab === 'withdrawals'" class="space-y-4">
      <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <!-- Filter -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <select
              v-model="withdrawalStatusFilter"
              class="h-10 rounded-xl border border-gray-300 px-3 text-xs focus:border-brand-400 focus:outline-none bg-white"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="PENDING">در انتظار بررسی</option>
              <option value="APPROVED">واریز و تأیید شده</option>
              <option value="REJECTED">رد شده</option>
            </select>
          </div>
          <Button
            label="تازه‌سازی"
            icon="pi pi-refresh"
            class="p-button-sm p-button-text text-gray-600"
            @click="loadWithdrawals"
          />
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs text-gray-700">
            <thead class="bg-gray-50 text-gray-500 font-semibold border-b">
              <tr>
                <th class="py-3 px-3">کد</th>
                <th class="py-3 px-3">مشتری</th>
                <th class="py-3 px-3">مبلغ (تومان)</th>
                <th class="py-3 px-3">شماره شبا و حساب</th>
                <th class="py-3 px-3">وضعیت</th>
                <th class="py-3 px-3">تاریخ ثبت</th>
                <th class="py-3 px-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody v-if="!withdrawalLoading && withdrawalItems.length" class="divide-y divide-gray-100">
              <tr v-for="item in withdrawalItems" :key="item.id" class="hover:bg-gray-50/50">
                <td class="py-3 px-3 font-mono text-gray-400">#{{ item.id }}</td>
                <td class="py-3 px-3">
                  <div v-if="item.user">
                    <p class="font-medium text-gray-800">
                      {{ item.user.firstName || '' }} {{ item.user.lastName || '' }}
                    </p>
                    <p class="text-[11px] text-gray-400 font-mono">{{ item.user.mobile }}</p>
                  </div>
                  <span v-else class="text-gray-400">کاربر #{{ item.userId }}</span>
                </td>
                <td class="py-3 px-3 font-modam font-bold text-sm text-gray-800">
                  {{ numberFormat(item.amount) }}
                </td>
                <td class="py-3 px-3">
                  <p class="font-mono text-xs text-gray-800" dir="ltr">{{ item.iban }}</p>
                  <p class="text-[11px] text-gray-500">صاحب حساب: {{ item.accountHolderName }}</p>
                  <p v-if="item.cardNumber" class="font-mono text-[10px] text-gray-400" dir="ltr">
                    کارت: {{ item.cardNumber }}
                  </p>
                </td>
                <td class="py-3 px-3">
                  <span
                    v-if="item.status === 'PENDING'"
                    class="rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[11px] font-medium border border-amber-200"
                  >
                    در انتظار بررسی
                  </span>
                  <span
                    v-else-if="item.status === 'APPROVED'"
                    class="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-medium border border-emerald-200"
                  >
                    واریز شد
                  </span>
                  <span
                    v-else
                    class="rounded-full bg-rose-50 text-rose-700 px-2.5 py-1 text-[11px] font-medium border border-rose-200"
                    :title="item.adminNote"
                  >
                    رد شده
                  </span>
                </td>
                <td class="py-3 px-3 text-gray-400 whitespace-nowrap">
                  {{ formatDate(item.createdAt) }}
                </td>
                <td class="py-3 px-3 text-center">
                  <div v-if="item.status === 'PENDING'" class="flex items-center justify-center gap-1.5">
                    <Button
                      label="تأیید واریز"
                      icon="pi pi-check"
                      class="p-button-xs !bg-emerald-600 !border-emerald-600 text-white text-[11px] py-1 px-2.5"
                      :loading="processingWithdrawalId === item.id"
                      @click="handleApproveWithdrawal(item.id)"
                    />
                    <Button
                      label="رد درخواست"
                      icon="pi pi-times"
                      class="p-button-xs !bg-rose-50 !text-rose-600 !border-rose-200 hover:!bg-rose-100 text-[11px] py-1 px-2.5"
                      :disabled="processingWithdrawalId === item.id"
                      @click="openRejectWithdrawalModal(item)"
                    />
                  </div>
                  <span v-else class="text-gray-400 text-xs">-</span>
                </td>
              </tr>
            </tbody>
            <tbody v-else-if="withdrawalLoading">
              <tr>
                <td colspan="7" class="py-8 text-center text-gray-400">در حال بارگذاری درخواست‌ها...</td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="7" class="py-8 text-center text-gray-400">درخواستی یافت نشد.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ══ TAB 5: REFERRALS ══ -->
    <div v-else-if="activeTab === 'referrals'" class="space-y-4">
      <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <!-- Filter & Actions -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <select
              v-model="referralStatusFilter"
              class="h-10 rounded-xl border border-gray-300 px-3 text-xs focus:border-brand-400 focus:outline-none bg-white"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="PENDING">در انتظار اولین خرید</option>
              <option value="COMPLETED">تکمیل شده (خرید موفق)</option>
            </select>
          </div>
          <Button
            label="تازه‌سازی"
            icon="pi pi-refresh"
            class="p-button-sm p-button-text text-gray-600"
            @click="loadReferrals"
          />
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs text-gray-700">
            <thead class="bg-gray-50 text-gray-500 font-semibold border-b">
              <tr>
                <th class="py-3 px-3">شناسه</th>
                <th class="py-3 px-3">معرف (دعوت‌کننده)</th>
                <th class="py-3 px-3">کاربر دعوت‌شده (دوست)</th>
                <th class="py-3 px-3">کد معرف</th>
                <th class="py-3 px-3">کد تخفیف معرف</th>
                <th class="py-3 px-3">اعتبار دوست</th>
                <th class="py-3 px-3">وضعیت</th>
                <th class="py-3 px-3">تاریخ عضویت</th>
              </tr>
            </thead>
            <tbody v-if="!referralLoading && referralItems.length" class="divide-y divide-gray-100">
              <tr v-for="item in referralItems" :key="item.id" class="hover:bg-gray-50/50">
                <td class="py-3 px-3 font-mono text-gray-400">#{{ item.id }}</td>
                <td class="py-3 px-3">
                  <p class="font-medium text-gray-800">
                    {{ item.referrerName || 'نامشخص' }}
                  </p>
                  <p class="text-[11px] text-gray-400 font-mono">{{ item.referrerMobile }}</p>
                </td>
                <td class="py-3 px-3">
                  <p class="font-medium text-gray-800">
                    {{ item.referredUserName || 'کاربر جدید' }}
                  </p>
                  <p class="text-[11px] text-gray-400 font-mono">{{ item.referredUserMobile }}</p>
                </td>
                <td class="py-3 px-3">
                  <span class="rounded-lg bg-gray-100 px-2 py-1 font-mono text-xs font-bold text-gray-700">
                    {{ item.referralCode }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span
                    v-if="item.discountCode"
                    class="rounded-lg bg-emerald-50 px-2 py-1 font-mono text-xs font-bold text-emerald-800 border border-emerald-200"
                  >
                    {{ item.discountCode }}
                  </span>
                  <span v-else class="text-gray-400 text-xs">–</span>
                </td>
                <td class="py-3 px-3 font-modam font-bold text-sm text-emerald-600">
                  {{ numberFormat(item.rewardAmount) }} تومان
                </td>
                <td class="py-3 px-3">
                  <span
                    v-if="item.status === 'COMPLETED'"
                    class="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-medium border border-emerald-200 inline-flex items-center gap-1"
                  >
                    <i class="pi pi-check text-[10px]" />
                    <span>تکمیل شد (ثبت اولین خرید)</span>
                  </span>
                  <span
                    v-else
                    class="rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-[11px] font-medium border border-amber-200 inline-flex items-center gap-1"
                  >
                    <i class="pi pi-clock text-[10px]" />
                    <span>در انتظار اولین خرید</span>
                  </span>
                </td>
                <td class="py-3 px-3 text-gray-500 font-mono text-[11px]">
                  {{ formatDate(item.createdAt) }}
                </td>
              </tr>
            </tbody>
            <tbody v-else-if="referralLoading">
              <tr>
                <td colspan="8" class="py-8 text-center text-gray-400">در حال بارگذاری لیست رفرال‌ها...</td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="8" class="py-8 text-center text-gray-400">موردی یافت نشد.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="referralTotal > 15" class="flex items-center justify-between pt-3 border-t text-xs text-gray-500">
          <span>مجموع: {{ referralTotal }} مورد</span>
          <div class="flex items-center gap-2">
            <button
              :disabled="referralPage <= 1"
              class="rounded-lg border px-3 py-1 disabled:opacity-40"
              @click="referralPage--"
            >
              قبلی
            </button>
            <span class="font-mono">صفحه {{ referralPage }}</span>
            <button
              :disabled="referralPage * 15 >= referralTotal"
              class="rounded-lg border px-3 py-1 disabled:opacity-40"
              @click="referralPage++"
            >
              بعدی
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ CONFIRM ADJUSTMENT MODAL ══ -->
    <Dialog
      v-model:visible="showAdjustmentConfirm"
      modal
      header="تأیید نهایی تغییر دستی اعتبار"
      :style="{ width: '90vw', maxWidth: '440px' }"
      dir="rtl"
    >
      <div class="space-y-3 text-xs text-gray-700 pt-2">
        <p>آیا از اعمال این تغییر بر روی حساب کاربر اطمینان دارید؟</p>
        <div class="rounded-xl bg-gray-50 p-3 border border-gray-200 space-y-1.5">
          <p><strong>کاربر:</strong> {{ selectedUser?.firstName }} {{ selectedUser?.lastName }} ({{ selectedUser?.mobile }})</p>
          <p>
            <strong>عملیات:</strong>
            <span :class="adjustmentType === 'add' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'">
              {{ adjustmentType === 'add' ? 'افزایش اعتبار (+)' : 'کسر اعتبار (-)' }}
              {{ numberFormat(adjustmentAmount) }} تومان
            </span>
          </p>
          <p><strong>توضیحات:</strong> {{ adjustmentDescription }}</p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            label="انصراف"
            class="p-button-text p-button-sm text-gray-500"
            @click="showAdjustmentConfirm = false"
          />
          <Button
            type="button"
            label="بله، ثبت کن"
            icon="pi pi-check"
            class="!bg-brand-500 !border-brand-500 text-white p-button-sm"
            :loading="adjustmentSubmitting"
            @click="doSubmitAdjustment"
          />
        </div>
      </template>
    </Dialog>

    <!-- ══ REJECT WITHDRAWAL MODAL ══ -->
    <Dialog
      v-model:visible="rejectingWithdrawal"
      modal
      header="رد درخواست برداشت و استرداد اعتبار"
      :style="{ width: '90vw', maxWidth: '440px' }"
      dir="rtl"
    >
      <div class="space-y-3 text-xs text-gray-700 pt-2">
        <p>
          با رد این درخواست، مبلغ
          <strong>{{ numberFormat(rejectingWithdrawal?.amount) }} تومان</strong>
          به صورت خودکار به اعتبار باشگاه مشتریان کاربر بازگردانده می‌شود.
        </p>
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            دلیل رد درخواست (اختیاری):
          </label>
          <textarea
            v-model="rejectNote"
            rows="3"
            placeholder="مثلاً: شماره شبا با نام صاحب حساب همخوانی ندارد"
            class="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-brand-400 focus:outline-none"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            label="انصراف"
            class="p-button-text p-button-sm text-gray-500"
            @click="rejectingWithdrawal = null"
          />
          <Button
            type="button"
            label="رد درخواست و بازگشت اعتبار"
            icon="pi pi-times"
            class="!bg-rose-600 !border-rose-600 text-white p-button-sm"
            :loading="processingWithdrawalId !== null"
            @click="handleConfirmRejectWithdrawal"
          />
        </div>
      </template>
    </Dialog>
  </section>
</template>
