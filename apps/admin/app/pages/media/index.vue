<template>
  <div class="space-y-6" dir="rtl">
    <!-- هدر صفحه و ناوبری -->
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'مدیریت فایل‌ها و رسانه', href: '/media' },
      ]"
      title="مدیریت رسانه و فایل‌ها (Uploads)"
      subtitle="مدیریت جامع فایل‌های ذخیره‌شده، تصاویر محصولات، بنرها، تغییر مالکیت و پاکسازی دیسک"
    />

    <!-- کارت‌های آمار بالای صفحه -->
    <MediaStatsHeader
      :stats="stats"
      :isStatsLoading="isStatsLoading"
    />

    <!-- نوار فیلتر و کنترل‌های پرایم‌ویو -->
    <MediaFilterBar
      v-model:viewMode="viewMode"
      :selectedCount="selectedIds.length"
      :isLoading="isLoading"
      @filter-change="handleFilterChange"
      @refresh="loadData"
      @open-upload="isUploadModalOpen = true"
      @bulk-delete="handleConfirmBulkDelete"
      @bulk-reassign="isReassignModalOpen = true"
    />

    <!-- محتوای اصلی: نمایش شبکه‌ای یا جدولی -->
    <div class="relative min-h-[300px]">
      <!-- لودینگ روی محتوا -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/70 backdrop-blur-2xs z-30 flex flex-col items-center justify-center gap-2 rounded-2xl"
      >
        <div class="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs font-semibold text-gray-600">در حال بارگذاری فایل‌ها...</span>
      </div>

      <!-- نمای شبکه‌ای (کارتی) -->
      <MediaGridView
        v-if="viewMode === 'grid'"
        :items="items"
        v-model:selectedIds="selectedIds"
        @edit="openEditModal"
        @delete="handleConfirmDelete"
      />

      <!-- نمای جدولی (DataTable) -->
      <MediaTableView
        v-else
        :items="items"
        v-model:selectedIds="selectedIds"
        @edit="openEditModal"
        @delete="handleConfirmDelete"
      />
    </div>

    <!-- صفحه‌بندی پرایم‌ویو (Paginator) -->
    <div
      v-if="meta.total > meta.limit"
      class="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs flex items-center justify-center"
    >
      <Paginator
        :rows="meta.limit"
        :totalRecords="meta.total"
        :first="(meta.page - 1) * meta.limit"
        class="nimoura-paginator text-xs"
        @page="handlePageChange"
      />
    </div>

    <!-- مودال ویرایش تک‌فایل و تغییر مالکیت -->
    <MediaEditModal
      v-model:visible="isEditModalOpen"
      :mediaItem="editingItem"
      :saving="isSaving"
      @save="handleSaveEdit"
    />

    <!-- مودال تغییر مالکیت گروهی -->
    <MediaReassignModal
      v-model:visible="isReassignModalOpen"
      :selectedItems="selectedItemsList"
      :saving="isSaving"
      @reassign="handleSaveBulkReassign"
    />

    <!-- مودال آپلود فایل جدید -->
    <MediaUploadModal
      v-model:visible="isUploadModalOpen"
      :uploading="isUploading"
      @upload="handleUploadFiles"
    />
  </div>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import type {
  MediaItem,
  MediaQueryFilter,
  UpdateMediaPayload,
  ReassignOwnerPayload,
} from '@nimoura/shared-types';


const route = useRoute();
const confirm = useConfirm();

const {
  items,
  meta,
  stats,
  isLoading,
  isStatsLoading,
  fetchMedia,
  fetchStats,
  updateMedia,
  deleteMedia,
  bulkDeleteMedia,
  reassignOwner,
  uploadFiles,
} = useAdminMedia();

const viewMode = ref<'grid' | 'table'>('grid');
const selectedIds = ref<number[]>([]);
const currentFilters = ref<MediaQueryFilter>({
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
});

// مودال‌ها
const isEditModalOpen = ref(false);
const editingItem = ref<MediaItem | null>(null);

const isReassignModalOpen = ref(false);
const isUploadModalOpen = ref(false);
const isSaving = ref(false);
const isUploading = ref(false);

const selectedItemsList = computed(() => {
  return items.value.filter((item) => selectedIds.value.includes(item.id));
});

// بارگذاری داده‌ها
async function loadData() {
  await Promise.all([
    fetchMedia(currentFilters.value),
    fetchStats(),
  ]);
}

// تغییر فیلترها
function handleFilterChange(filters: Record<string, any>) {
  currentFilters.value = {
    ...currentFilters.value,
    ...filters,
    page: 1, // ریست به صفحه اول در جستجو و فیلتر
  };
  selectedIds.value = [];
  fetchMedia(currentFilters.value);
}

// تغییر صفحه
function handlePageChange(event: { page: number; rows: number }) {
  currentFilters.value.page = event.page + 1;
  currentFilters.value.limit = event.rows;
  fetchMedia(currentFilters.value);
}

// باز کردن مودال ویرایش
function openEditModal(item: MediaItem) {
  editingItem.value = item;
  isEditModalOpen.value = true;
}

// ذخیره تغییرات تک‌فایل
async function handleSaveEdit(payload: { id: number; data: UpdateMediaPayload }) {
  isSaving.value = true;
  try {
    const success = await updateMedia(payload.id, payload.data);
    if (success) {
      isEditModalOpen.value = false;
      editingItem.value = null;
      await loadData();
    }
  } finally {
    isSaving.value = false;
  }
}

// ذخیره تغییر مالکیت گروهی
async function handleSaveBulkReassign(payload: ReassignOwnerPayload) {
  isSaving.value = true;
  try {
    const success = await reassignOwner(payload);
    if (success) {
      isReassignModalOpen.value = false;
      selectedIds.value = [];
      await loadData();
    }
  } finally {
    isSaving.value = false;
  }
}

// تایید و حذف یک فایل
function handleConfirmDelete(item: MediaItem) {
  confirm.require({
    header: 'حذف فایل از سرور',
    message: `آیا از حذف دائم فایل "${item.originalName || item.fileName}" از پوشه uploads اطمینان دارید؟ این عمل غیرقابل بازگشت است.`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'بله، حذف کن',
    rejectLabel: 'انصراف',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const ok = await deleteMedia(item.id);
      if (ok) {
        selectedIds.value = selectedIds.value.filter((id) => id !== item.id);
        await loadData();
      }
    },
  });
}

// تایید و حذف دسته‌جمعی فایل‌ها
function handleConfirmBulkDelete() {
  if (selectedIds.value.length === 0) return;

  confirm.require({
    header: 'حذف دسته‌جمعی فایل‌ها',
    message: `آیا از حذف دائم ${selectedIds.value.length} فایل انتخاب‌شده از سرور مطمئن هستید؟ فایل‌های فیزیکی نیز از پوشه uploads پاک خواهند شد.`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'حذف دسته‌جمعی',
    rejectLabel: 'انصراف',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const ok = await bulkDeleteMedia(selectedIds.value);
      if (ok) {
        selectedIds.value = [];
        await loadData();
      }
    },
  });
}

// آپلود مستقیم فایل‌ها
async function handleUploadFiles(payload: {
  files: File[];
  ownerType: string;
  ownerId: string;
}) {
  isUploading.value = true;
  try {
    const success = await uploadFiles(
      payload.files,
      payload.ownerType,
      payload.ownerId,
    );
    if (success) {
      isUploadModalOpen.value = false;
      await loadData();
    }
  } finally {
    isUploading.value = false;
  }
}

onMounted(() => {
  // اگر از طریق منوی آپلود با پارامتر اکشن وارد شده بود
  if (route.query.action === 'upload') {
    isUploadModalOpen.value = true;
  }
  loadData();
});
</script>

<style scoped>
:deep(.nimoura-paginator) {
  border: none;
  background: transparent;
  padding: 0;
}
</style>
