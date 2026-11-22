<template>
  <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs mb-6 space-y-4">
    <!-- ردیف اول: جستجو و فیلترهای اصلی -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <!-- جستجو -->
      <div class="lg:col-span-2">
        <div class="relative w-full">
          <InputText
            v-model="searchQuery"
            placeholder="جستجو در نام فایل، نام اصلی یا شناسه مالک..."
            class="w-full !pr-10 !pl-8 !rounded-xl !text-xs !py-2.5"
          />
          <i
            class="pi pi-search absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="searchQuery = ''"
          >
            <i class="pi pi-times text-xs" />
          </button>
        </div>
      </div>

      <!-- فیلتر نوع بخش / مالکیت -->
      <div>
        <Select
          v-model="selectedOwnerType"
          :options="ownerTypeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="بخش مربوطه"
          class="w-full !rounded-xl !text-xs"
        />
      </div>

      <!-- فیلتر نوع فرمت -->
      <div>
        <Select
          v-model="selectedFormat"
          :options="formatOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="فرمت فایل"
          class="w-full !rounded-xl !text-xs"
        />
      </div>

      <!-- فیلتر وضعیت اتصال -->
      <div>
        <Select
          v-model="selectedStatus"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="وضعیت فایل"
          class="w-full !rounded-xl !text-xs"
        />
      </div>
    </div>

    <!-- ردیف دوم: مرتب‌سازی، تعداد، تغییر نما و عملیات گروهی -->
    <div
      class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs"
    >
      <!-- بخش راست: مرتب‌سازی و حالت نمایش -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- مرتب‌سازی -->
        <Select
          v-model="selectedSort"
          :options="sortOptions"
          optionLabel="label"
          optionValue="value"
          class="!rounded-xl !text-xs min-w-[130px]"
        />

        <!-- تعداد در صفحه -->
        <Select
          v-model="pageLimit"
          :options="limitOptions"
          optionLabel="label"
          optionValue="value"
          class="!rounded-xl !text-xs min-w-[110px]"
        />

        <!-- دکمه تغییر نما (گرید یا جدول) -->
        <div class="flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            :class="[
              'px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium',
              viewMode === 'grid'
                ? 'bg-white text-brand-600 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800',
            ]"
            title="نمایش کارتی / شبکه‌ای"
            @click="$emit('update:viewMode', 'grid')"
          >
            <i class="pi pi-th-large text-xs" />
            <span class="hidden sm:inline">کارتی</span>
          </button>
          <button
            type="button"
            :class="[
              'px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium',
              viewMode === 'table'
                ? 'bg-white text-brand-600 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800',
            ]"
            title="نمایش جدولی"
            @click="$emit('update:viewMode', 'table')"
          >
            <i class="pi pi-bars text-xs" />
            <span class="hidden sm:inline">جدول</span>
          </button>
        </div>

        <!-- دکمه تازه‌سازی -->
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          variant="outlined"
          class="!rounded-xl !text-xs !p-2"
          :loading="isLoading"
          title="تازه‌سازی لیست"
          @click="$emit('refresh')"
        />
      </div>

      <!-- بخش چپ: اکشن‌ها و عملیات گروهی -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- اکشن‌های چندتایی هنگام انتخاب فایل‌ها -->
        <template v-if="selectedCount > 0">
          <span class="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1.5 rounded-xl">
            {{ selectedCount }} فایل انتخاب شده
          </span>

          <Button
            label="تغییر مالکیت گروهی"
            icon="pi pi-user-edit"
            severity="warn"
            size="small"
            class="!rounded-xl !text-xs"
            @click="$emit('bulk-reassign')"
          />

          <Button
            label="حذف دسته‌جمعی"
            icon="pi pi-trash"
            severity="danger"
            size="small"
            class="!rounded-xl !text-xs"
            @click="$emit('bulk-delete')"
          />
        </template>

        <!-- دکمه آپلود فایل جدید -->
        <Button
          label="آپلود فایل جدید"
          icon="pi pi-cloud-upload"
          severity="primary"
          size="small"
          class="!rounded-xl !text-xs font-bold"
          @click="$emit('open-upload')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MediaOwnerType } from '@nimoura/shared-types';

const props = defineProps<{
  viewMode: 'grid' | 'table';
  selectedCount: number;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:viewMode', mode: 'grid' | 'table'): void;
  (e: 'filter-change', filters: Record<string, any>): void;
  (e: 'refresh'): void;
  (e: 'open-upload'): void;
  (e: 'bulk-delete'): void;
  (e: 'bulk-reassign'): void;
}>();

const searchQuery = ref('');
const selectedOwnerType = ref('all');
const selectedFormat = ref('all');
const selectedStatus = ref('all');
const selectedSort = ref('newest');
const pageLimit = ref(20);

const ownerTypeOptions = [
  { label: 'همه بخش‌ها (کل فایل‌ها)', value: 'all' },
  { label: 'تصویر شاخص محصول', value: MediaOwnerType.PRODUCT_THUMBNAIL },
  { label: 'گالری محصول', value: MediaOwnerType.PRODUCT_GALLERY },
  { label: 'تنوع‌های محصول', value: MediaOwnerType.PRODUCT_VARIANT },
  { label: 'لوگوی برندها', value: MediaOwnerType.BRAND_LOGO },
  { label: 'بنرها و اسلایدرها', value: MediaOwnerType.BANNER },
  { label: 'تصویر شاخص دسته‌بندی', value: MediaOwnerType.CATEGORY_IMAGE },
  { label: 'آیکون دسته‌بندی', value: MediaOwnerType.CATEGORY_ICON },
  { label: 'کاور مقالات مجله', value: MediaOwnerType.MAGAZINE_COVER },
  { label: 'تصویر محتوای مقاله', value: MediaOwnerType.MAGAZINE_CONTENT_IMAGE },
  { label: 'تصاویر دیدگاه‌ها', value: MediaOwnerType.COMMENT_IMAGE },
  { label: 'ضمیمه‌های تیکت', value: MediaOwnerType.TICKET_ATTACHMENT },
  { label: 'ویدیوهای اکسپلور', value: MediaOwnerType.EXPLORE_VIDEO },
];

const formatOptions = [
  { label: 'همه فرمت‌ها', value: 'all' },
  { label: 'تصاویر (WebP, JPG, PNG, SVG)', value: 'image' },
  { label: 'ویدیوها (MP4, WebM)', value: 'video' },
  { label: 'اسناد و PDF', value: 'application' },
];

const statusOptions = [
  { label: 'همه وضعیت‌ها', value: 'all' },
  { label: 'متصل به رکوردها', value: 'attached' },
  { label: 'فایل‌های موقت (Temp)', value: 'temp' },
];

const sortOptions = [
  { label: 'جدیدترین فایل‌ها', value: 'newest' },
  { label: 'قدیمی‌ترین فایل‌ها', value: 'oldest' },
  { label: 'بیشترین حجم', value: 'largest' },
  { label: 'کمترین حجم', value: 'smallest' },
];

const limitOptions = [
  { label: '۲۰ در هر صفحه', value: 20 },
  { label: '۵۰ در هر صفحه', value: 50 },
  { label: '۱۰۰ در هر صفحه', value: 100 },
];

function notifyChange() {
  let sortBy: 'id' | 'size' | 'createdAt' = 'createdAt';
  let sortOrder: 'ASC' | 'DESC' = 'DESC';

  if (selectedSort.value === 'newest') {
    sortBy = 'createdAt';
    sortOrder = 'DESC';
  } else if (selectedSort.value === 'oldest') {
    sortBy = 'createdAt';
    sortOrder = 'ASC';
  } else if (selectedSort.value === 'largest') {
    sortBy = 'size';
    sortOrder = 'DESC';
  } else if (selectedSort.value === 'smallest') {
    sortBy = 'size';
    sortOrder = 'ASC';
  }

  let isTemp: boolean | undefined = undefined;
  if (selectedStatus.value === 'temp') isTemp = true;
  else if (selectedStatus.value === 'attached') isTemp = false;

  emit('filter-change', {
    search: searchQuery.value.trim() || undefined,
    ownerType: selectedOwnerType.value === 'all' ? undefined : selectedOwnerType.value,
    mimeType: selectedFormat.value === 'all' ? undefined : selectedFormat.value,
    isTemp,
    sortBy,
    sortOrder,
    limit: pageLimit.value,
  });
}

let searchDebounce: ReturnType<typeof setTimeout>;
watch(searchQuery, () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(notifyChange, 350);
});

watch([selectedOwnerType, selectedFormat, selectedStatus, selectedSort, pageLimit], () => {
  notifyChange();
});
</script>
