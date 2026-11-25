<template>
  <section class="space-y-6">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'ویترینهای دستهبندی', href: '/showcases' },
      ]"
      title="ویترینهای دستهبندی"
      subtitle="مدیریت کامل شوکیسهای صفحه اصلی و سایر بخشهای سایت"
    />

    <div class="flex justify-end">
      <button
        type="button"
        class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        @click="navigateTo('/showcases/new')"
      >
        + ویترین جدید
      </button>
    </div>

    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-right text-xs text-gray-600">
          <tr>
            <th class="p-3">نام / کلید</th>
            <th class="p-3">چیدمان</th>
            <th class="p-3">تعداد آیتم</th>
            <th class="p-3">وضعیت</th>
            <th class="p-3">عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="border-t border-gray-100">
            <td class="p-3">
              <div class="font-semibold text-gray-800">{{ item.name }}</div>
              <div class="mt-0.5 font-mono text-[11px] text-gray-500">{{ item.key }}</div>
            </td>
            <td class="p-3 text-gray-600">{{ variantLabel(item.variant) }}</td>
            <td class="p-3 text-gray-600">
              {{ (item.items || []).length }} + {{ item.centerItem ? 1 : 0 }} مرکز
            </td>
            <td class="p-3">
              <span
                class="rounded-full px-2 py-1 text-[11px] font-medium"
                :class="item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'"
              >
                {{ item.isActive ? 'فعال' : 'غیرفعال' }}
              </span>
            </td>
            <td class="p-3">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-700 hover:border-brand-400 hover:text-brand-600"
                  @click="navigateTo(`/showcases/${item.id}`)"
                >
                  ویرایش
                </button>
                <button
                  type="button"
                  class="rounded-md border border-rose-100 px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50"
                  @click="remove(item.id)"
                >
                  حذف
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!items.length && !isLoading">
            <td colspan="5" class="p-6 text-center text-gray-500">ویترینی یافت نشد.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
const { items, isLoading, fetchShowcases, deleteShowcase } = useAdminShowcases();

await fetchShowcases();

function variantLabel(variant: string) {
  const labels: Record<string, string> = {
    grid: 'شبکهای',
    scroll: 'اسکرولی',
    circle: 'دایرهای ساده',
    radial: 'دایرهای (مرکز + حلقه)',
    'hero-cards': 'کارتهای هیرو',
  };
  return labels[variant] || variant;
}

async function remove(id: number) {
  if (!window.confirm('آیا از حذف این ویترین اطمینان دارید؟')) return;
  if (await deleteShowcase(id)) await fetchShowcases();
}
</script>
