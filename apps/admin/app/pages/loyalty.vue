<script setup lang="ts">
const toast = useAppToast();
const { settings, loading, fetchSettings, updateSettings } = useLoyaltySettings();
const form = reactive({
  isEnabled: true,
  weeklyRewardAmount: 15000,
  cashbackEnabled: true,
  cashbackMinimumOrderAmount: 2000000,
  cashbackAmount: 100000,
  autoRedeemEnabled: true,
});

onMounted(async () => {
  try {
    const value = await fetchSettings();
    if (value) Object.assign(form, {
      ...value,
      weeklyRewardAmount: Number(value.weeklyRewardAmount),
      cashbackMinimumOrderAmount: Number(value.cashbackMinimumOrderAmount),
      cashbackAmount: Number(value.cashbackAmount),
    });
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'دریافت تنظیمات ناموفق بود', detail: e?.data?.statusMessage, life: 4000 });
  }
});

async function save() {
  try {
    await updateSettings({ ...form });
    toast.add({ severity: 'success', summary: 'تنظیمات باشگاه مشتریان ذخیره شد', life: 3000 });
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'ذخیره تنظیمات ناموفق بود', detail: e?.data?.statusMessage, life: 4000 });
  }
}
</script>

<template>
  <section class="space-y-6" dir="rtl">
    <UtilsHeaderWithActions
      :breadcrumbs="[{ label: 'داشبورد', href: '/' }, { label: 'باشگاه مشتریان', href: '' }]"
      title="باشگاه مشتریان"
      subtitle="تنظیمات پاداش هفتگی و کش‌بک"
    />
    <form class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6" @submit.prevent="save">
      <div class="flex items-center justify-between border-b pb-5">
        <div><h2 class="font-semibold text-gray-800">فعال‌سازی باشگاه مشتریان</h2><p class="text-sm text-gray-500">ثبت حضور هفتگی و اعتبار مشتریان</p></div>
        <ToggleSwitch v-model="form.isEnabled" />
      </div>
      <div class="grid gap-5 md:grid-cols-2">
        <CommonFormattedNumberInput v-model="form.weeklyRewardAmount" label="پاداش تکمیل ۷ روز (تومان)" />
        <CommonFormattedNumberInput v-model="form.cashbackMinimumOrderAmount" label="حداقل مبلغ سفارش کش‌بک (تومان)" />
        <CommonFormattedNumberInput v-model="form.cashbackAmount" label="مبلغ کش‌بک (تومان)" />
      </div>
      <div class="flex items-center justify-between border-t pt-5">
        <div><h2 class="font-semibold text-gray-800">فعال‌سازی کش‌بک</h2><p class="text-sm text-gray-500">پس از پرداخت موفق سفارش ثبت می‌شود</p></div>
        <ToggleSwitch v-model="form.cashbackEnabled" />
      </div>
      <div class="flex justify-end"><Button type="submit" label="ذخیره تنظیمات" icon="pi pi-check" :loading="loading" /></div>
    </form>
  </section>
</template>
