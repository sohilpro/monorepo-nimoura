<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- کل فایل‌ها -->
    <div
      class="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:shadow-sm"
    >
      <div class="space-y-1">
        <span class="text-xs font-medium text-gray-500">کل فایل‌های ذخیره‌شده</span>
        <div class="text-2xl font-black text-gray-900">
          {{ isStatsLoading ? '...' : (stats?.totalCount ? toPersianDigits(stats.totalCount) : '۰') }}
        </div>
        <span class="text-[11px] text-gray-400">در پوشه uploads</span>
      </div>
      <div
        class="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl shadow-2xs"
      >
        <i class="pi pi-images" />
      </div>
    </div>

    <!-- حجم کل ذخیره‌سازی -->
    <div
      class="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:shadow-sm"
    >
      <div class="space-y-1">
        <span class="text-xs font-medium text-gray-500">حجم کل مصرفی دیسک</span>
        <div class="text-2xl font-black text-emerald-600">
          {{ isStatsLoading ? '...' : formatFileSize(stats?.totalSize || 0) }}
        </div>
        <span class="text-[11px] text-emerald-500/80">بهینه‌سازی شده با WebP</span>
      </div>
      <div
        class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-2xs"
      >
        <i class="pi pi-database" />
      </div>
    </div>

    <!-- فایل‌های متصل به بخش‌ها -->
    <div
      class="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:shadow-sm"
    >
      <div class="space-y-1">
        <span class="text-xs font-medium text-gray-500">فایل‌های دارای مالک</span>
        <div class="text-2xl font-black text-blue-600">
          {{ isStatsLoading ? '...' : (stats?.attachedCount ? toPersianDigits(stats.attachedCount) : '۰') }}
        </div>
        <span class="text-[11px] text-blue-500/80">محصولات، بنرها، برندها و...</span>
      </div>
      <div
        class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-2xs"
      >
        <i class="pi pi-link" />
      </div>
    </div>

    <!-- فایل‌های موقت / بلاتکلیف -->
    <div
      class="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:shadow-sm"
    >
      <div class="space-y-1">
        <span class="text-xs font-medium text-gray-500">فایل‌های موقت (Temp)</span>
        <div class="text-2xl font-black text-amber-600">
          {{ isStatsLoading ? '...' : (stats?.tempCount ? toPersianDigits(stats.tempCount) : '۰') }}
        </div>
        <span class="text-[11px] text-amber-500/80">قابل انتساب یا پاکسازی</span>
      </div>
      <div
        class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-2xs"
      >
        <i class="pi pi-clock" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaStats } from '@nimoura/shared-types';
import { formatFileSize, toPersianDigits } from '@nimoura/utils';

defineProps<{
  stats: MediaStats | null;
  isStatsLoading: boolean;
}>();
</script>
