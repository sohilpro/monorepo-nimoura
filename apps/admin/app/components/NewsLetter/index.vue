<template>
  <section class="space-y-6" dir="rtl">
    <!-- Header with Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <UtilsHeaderWithActions
        :breadcrumbs="[
          { label: 'داشبورد', href: '/' },
          { label: 'خبرنامه و بازاریابی', href: '' },
        ]"
        title="خبرنامه و بازاریابی پیامکی"
        subtitle="مدیریت اعضای خبرنامه، ارسال کد تخفیف جشنواره‌ها و خروجی لیست شماره‌ها"
      />

      <div class="flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          label="ارسال کد تخفیف / جشنواره"
          icon="pi pi-send"
          class="!bg-brand-500 !border-brand-500 text-white p-button-sm shadow-sm"
          @click="showBroadcastModal = true"
        />
        <Button
          type="button"
          label="خروجی CSV"
          icon="pi pi-download"
          class="p-button-outlined p-button-sm text-gray-700 border-gray-300 hover:bg-gray-50"
          @click="exportSubscribersCsv"
        />
      </div>
    </div>

    <!-- KPI Statistics Cards -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500">کل اعضای خبرنامه</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <i class="pi pi-users text-base" />
          </span>
        </div>
        <p class="mt-3 text-2xl font-bold font-modam text-purple-700">
          {{ stats?.total ?? 0 }} <span class="text-xs font-normal text-gray-400">عضو</span>
        </p>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500">مخاطبان پیامکی (موبایل)</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <i class="pi pi-mobile text-base" />
          </span>
        </div>
        <p class="mt-3 text-2xl font-bold font-modam text-emerald-700">
          {{ stats?.withMobile ?? 0 }} <span class="text-xs font-normal text-gray-400">شماره</span>
        </p>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500">مخاطبان ایمیلی</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <i class="pi pi-envelope text-base" />
          </span>
        </div>
        <p class="mt-3 text-2xl font-bold font-modam text-blue-700">
          {{ stats?.withEmail ?? 0 }} <span class="text-xs font-normal text-gray-400">ایمیل</span>
        </p>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500">اعضای فعال</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <i class="pi pi-check-circle text-base" />
          </span>
        </div>
        <p class="mt-3 text-2xl font-bold font-modam text-amber-700">
          {{ stats?.active ?? 0 }} <span class="text-xs font-normal text-gray-400">عضو فعال</span>
        </p>
      </div>
    </div>

    <!-- Subscribers Table -->
    <UtilsTableDynamic
      :data="newsletter?.data?.newsletter || []"
      :columns="columns"
      :total="newsletter?.data?.total"
      :page="page"
      :limit="limit"
      :serverSide="true"
      :onPageChange="onPageChange"
      :onSearch="onSearch"
      :onSort="onSort"
      :sortKey="sortBy"
      :sortOrder="sortOrder"
      :searchQuery="search"
      url-edit="newsletter"
      api-delete-base="/api/newsletter"
      :on-refresh="refreshBoth"
      itemNameKey="email"
    />

    <!-- Broadcast Campaign Modal -->
    <Dialog
      v-model:visible="showBroadcastModal"
      modal
      header="ارسال کد تخفیف و جشنواره به اعضای خبرنامه"
      :style="{ width: '90vw', maxWidth: '480px' }"
      dir="rtl"
    >
      <div class="space-y-4 pt-2 text-xs text-gray-700 font-vazir">
        <div class="rounded-xl bg-amber-50 p-3.5 border border-amber-200 space-y-1">
          <div class="flex items-center gap-1.5 font-bold text-amber-900">
            <i class="pi pi-info-circle text-sm text-amber-600" />
            <span>اطلاعیه ارسال همگانی</span>
          </div>
          <p class="text-amber-800 leading-relaxed">
            این پیامک برای کلیه مخاطبان فعال خبرنامه (حدود <strong>{{ stats?.withMobile ?? 0 }} شماره تماس</strong>) از طریق الگوی پیامکی پنل ارسال خواهد شد.
          </p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-800 mb-1.5">
            کد تخفیف اختصاصی یا نام جشنواره: <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="promoCodeInput"
            type="text"
            dir="ltr"
            placeholder="مثال: SPRING50 یا FESTIVAL"
            class="w-full rounded-xl border border-gray-300 p-2.5 font-mono text-sm uppercase focus:border-brand-500 focus:outline-none"
          />
          <p class="text-[11px] text-gray-400 mt-1">
            این کد به عنوان متغیر درون الگوی پیامک خبرنامه (MELI_SMS_PATTERN_NEWSLETTER) قرار می‌گیرد.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            label="انصراف"
            class="p-button-text p-button-sm text-gray-500"
            @click="showBroadcastModal = false"
          />
          <Button
            type="button"
            label="ارسال پیامک به همه اعضا"
            icon="pi pi-send"
            class="!bg-brand-500 !border-brand-500 text-white p-button-sm px-4"
            :loading="sendingBroadcast"
            :disabled="!promoCodeInput.trim()"
            @click="handleBroadcast"
          />
        </div>
      </template>
    </Dialog>
  </section>
</template>

<script setup>
const toast = useAppToast();
const showBroadcastModal = ref(false);
const promoCodeInput = ref('');
const sendingBroadcast = ref(false);

const {
  page,
  limit,
  search,
  sortBy,
  sortOrder,
  queryParams,
  onPageChange,
  onSearch,
  onSort,
} = useTableQuery({ defaultSortBy: 'createdAt' });

const fetchUrl = computed(() => {
  const q = queryParams.value;
  const params = new URLSearchParams();
  if (q.page) params.set('page', String(q.page));
  if (q.limit) params.set('limit', String(q.limit));
  if (q.search) params.set('search', String(q.search));
  if (q.sortBy && q.sortBy !== 'undefined') params.set('sortBy', String(q.sortBy));
  if (q.sortOrder && q.sortOrder !== 'undefined') params.set('sortOrder', String(q.sortOrder));
  return `/api/newsletter?${params.toString()}`;
});

const { data: newsletter, refresh } = await useFetch(fetchUrl);
const { data: statsData, refresh: refreshStats } = await useFetch('/api/newsletter/stats');

const stats = computed(() => {
  const d = statsData.value;
  return d?.data ?? d ?? {};
});

async function refreshBoth() {
  await Promise.all([refresh(), refreshStats()]);
}

const columns = [
  {
    key: 'email',
    label: 'اطلاعات تماس (موبایل / ایمیل)',
  },
  {
    key: 'source',
    label: 'منبع ثبت‌نام',
    formatter: (val) => {
      const map = { footer: 'فوتر سایت', magazine: 'مجله نیمورا', popup: 'پاپ‌آپ تخفیف' };
      return map[val] || val || 'سایت';
    },
  },
  {
    key: 'campaignCount',
    label: 'پیامک‌های دریافتی',
    formatter: (val) => `${val || 0} پیامک`,
  },
  {
    key: 'isActive',
    label: 'وضعیت',
    formatter: (val) => (val ? 'فعال' : 'غیرفعال'),
  },
  {
    key: 'subscribedAt',
    label: 'تاریخ عضویت',
    formatter: (val) => (val ? new Date(val).toLocaleDateString('fa-IR') : '–'),
  },
];

async function handleBroadcast() {
  if (!promoCodeInput.value.trim()) {
    toast.add({ severity: 'warn', summary: 'کد تخفیف الزامی است', life: 3000 });
    return;
  }

  sendingBroadcast.value = true;
  try {
    const res = await $fetch('/api/newsletter/broadcast', {
      method: 'POST',
      body: { promoCode: promoCodeInput.value.trim().toUpperCase() },
    });

    toast.add({
      severity: 'success',
      summary: 'موفقیت در ارسال',
      detail: res?.message || 'ارسال پیامک برای اعضای خبرنامه انجام شد.',
      life: 4000,
    });
    showBroadcastModal.value = false;
    promoCodeInput.value = '';
    await refreshBoth();
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'خطا در ارسال پیامک',
      detail: err?.data?.message || err?.message || 'خطایی در ارسال رخ داد.',
      life: 4000,
    });
  } finally {
    sendingBroadcast.value = false;
  }
}

function exportSubscribersCsv() {
  const items = newsletter.value?.data?.newsletter || [];
  if (!items.length) {
    toast.add({
      severity: 'warn',
      summary: 'موردی یافت نشد',
      detail: 'داده‌ای برای خروجی گرفتن وجود ندارد.',
      life: 3000,
    });
    return;
  }

  const headers = ['شناسه', 'اطلاعات تماس', 'موبایل', 'ایمیل', 'منبع', 'وضعیت', 'پیامک‌های ارسالی', 'تاریخ عضویت'];
  const rows = items.map((i) => [
    i.id,
    `"${i.email || ''}"`,
    `"${i.mobile || ''}"`,
    `"${i.actualEmail || ''}"`,
    `"${i.source || ''}"`,
    i.isActive ? 'فعال' : 'غیرفعال',
    i.campaignCount || 0,
    i.subscribedAt ? new Date(i.subscribedAt).toLocaleDateString('fa-IR') : '-',
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>
