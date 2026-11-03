<template>
  <div class="space-y-2" dir="rtl">
    <label v-if="label" class="block mb-1 font-medium text-sm text-slate-700 dark:text-slate-300">
      {{ label }}
    </label>

    <!-- لیست تصاویر بارگذاری‌شده یا موجود -->
    <div v-if="displayItems.length" class="flex flex-wrap gap-3.5 mb-3">
      <div
        v-for="item in displayItems"
        :key="item.source + '-' + (item.id ?? item.url)"
        class="relative w-28 h-28 sm:w-32 sm:h-32 border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden group shadow-xs bg-slate-50 dark:bg-slate-800 transition-all hover:border-brand-500"
      >
        <img
          :src="item.url"
          class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          alt="پیش‌نمایش تصویر"
        />

        <!-- لایه دکمه حذف هنگام هاور -->
        <div
          v-if="!item.uploading"
          class="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2"
        >
          <button
            type="button"
            class="bg-rose-600 hover:bg-rose-700 text-white rounded-full p-2.5 shadow-md hover:scale-110 active:scale-95 transition-transform"
            title="حذف تصویر"
            @click.stop="stageForRemoval(item)"
          >
            <i class="pi pi-trash text-sm" />
          </button>
        </div>

        <!-- لایه لودینگ هنگام آپلود -->
        <div
          v-if="item.uploading"
          class="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center gap-1.5 p-2 text-center"
        >
          <div class="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-[10px] text-slate-600 dark:text-slate-300 font-medium">در حال آپلود...</span>
        </div>
      </div>
    </div>

    <!-- کادر دراگ و دراپ برای انتخاب فایل -->
    <div
      v-if="multiple || displayItems.length === 0"
      @click="triggerBrowse"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all group select-none',
        isDragging
          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 scale-[0.99]'
          : 'border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-brand-50/20',
      ]"
    >
      <div class="flex flex-col items-center gap-2">
        <div
          class="w-11 h-11 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs"
        >
          <i class="pi pi-cloud-upload text-xl" />
        </div>
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          برای انتخاب فایل کلیک کنید یا فایل را به اینجا بکشید
        </p>
        <p class="text-xs text-slate-400">
          {{ multiple ? 'امکان انتخاب چند تصویر هم‌زمان (JPG، PNG، WEBP)' : 'یک تصویر شاخص (JPG، PNG، WEBP)' }}
        </p>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      class="hidden"
      accept="image/png,image/jpeg,image/webp,image/svg+xml"
      :name="name"
      :multiple="multiple"
      @change="handleFileInputChange"
    />
  </div>
</template>

<script setup lang="ts">
export interface MediaItem {
  id?: number | string;
  url: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: MediaItem[] | MediaItem | string[] | string | null;
    name?: string;
    label?: string;
    multiple?: boolean;
    ownerType: string;
    ownerId?: string | number;
    existing?: { id?: string | number; url: string }[];
  }>(),
  {
    name: 'file',
    multiple: false,
    ownerId: 'temp',
    existing: () => [],
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: any): void;
  (e: 'file-uploaded', fileData: MediaItem): void;
  (e: 'file-removed', fileData: any): void;
  (e: 'remove-existing', fileData: any): void;
}>();

const toast = useAppToast();
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const uploadingItems = ref<Array<{ id: string; url: string; uploading: boolean }>>([]);

// کلیدهای آیتم‌های قبلی که حذف شدند
const removedExistingKeys = ref<Set<string>>(new Set());
const pendingDeleteUrls = ref<string[]>([]);

function itemKey(item: { id?: string | number; url: string }) {
  return String(item.id ?? item.url);
}

const displayItems = computed(() => {
  const existingList = (props.existing || [])
    .filter((e) => !removedExistingKeys.value.has(itemKey(e)))
    .map((e) => ({ ...e, uploading: false, source: 'existing' as const }));

  const newList: any[] = [];
  if (props.multiple) {
    if (Array.isArray(props.modelValue)) {
      for (const item of props.modelValue) {
        const normalized = typeof item === 'string' ? { url: item } : item;
        if (!existingList.some((ex) => ex.url === normalized.url)) {
          newList.push({ ...normalized, uploading: false, source: 'new' as const });
        }
      }
    }
    return [
      ...existingList,
      ...newList,
      ...uploadingItems.value.map((u) => ({ ...u, source: 'uploading' as const })),
    ];
  }

  // حالت تکی
  if (props.modelValue) {
    const normalized =
      typeof props.modelValue === 'string' ? { url: props.modelValue } : props.modelValue;

    const isSameAsExisting = existingList.some((ex) => ex.url === normalized.url);
    if (!isSameAsExisting) {
      newList.push({ ...normalized, uploading: false, source: 'new' as const });
      return [...newList, ...uploadingItems.value.map((u) => ({ ...u, source: 'uploading' as const }))];
    }
  }

  return [...existingList, ...uploadingItems.value.map((u) => ({ ...u, source: 'uploading' as const }))];
});

function triggerBrowse() {
  fileInputRef.value?.click();
}

function handleFileInputChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files?.length) return;
  uploadFiles(Array.from(target.files));
  target.value = '';
}

function handleDrop(e: DragEvent) {
  isDragging.value = false;
  if (!e.dataTransfer?.files?.length) return;
  const files = Array.from(e.dataTransfer.files).filter((f): f is File => f.type.startsWith('image/'));
  if (files.length > 0) {
    uploadFiles(props.multiple ? files : files.slice(0, 1));
  }
}

async function uploadFiles(files: File[]) {
  for (const file of files) {
    await processSingleFile(file);
  }
}

async function processSingleFile(file: File) {
  const tempUrl = URL.createObjectURL(file);
  const tempId = `temp_${Math.random().toString(36).substring(2)}`;

  uploadingItems.value.push(reactive({ id: tempId, url: tempUrl, uploading: true }));

  const formData = new FormData();
  formData.append('file', file);
  formData.append('ownerType', props.ownerType || 'article_content');
  formData.append('ownerId', String(props.ownerId || 'temp'));

  try {
    const response: any = await $fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const publicUrl = response?.url || response?.data?.publicUrl;
    const mediaId = response?.data?.id;

    if (publicUrl) {
      const createdItem: MediaItem = { id: mediaId, url: publicUrl };

      if (props.multiple) {
        const currentArr = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
        currentArr.push(createdItem as any);
        emit('update:modelValue', currentArr);
      } else {
        if (props.existing?.length) {
          props.existing.forEach((ex) => {
            removedExistingKeys.value.add(itemKey(ex));
            if (ex.url) pendingDeleteUrls.value.push(ex.url);
          });
        }
        emit('update:modelValue', createdItem as any);
      }

      emit('file-uploaded', createdItem);
      toast.success('تصویر با موفقیت بارگذاری شد', 'موفقیت', 2000);
    }
  } catch (err: any) {
    toast.error(err?.data?.message || err?.statusMessage || 'بارگذاری فایل ناموفق بود');
  } finally {
    uploadingItems.value = uploadingItems.value.filter((i) => i.id !== tempId);
    URL.revokeObjectURL(tempUrl);
  }
}

function stageForRemoval(item: any) {
  if (item.source === 'existing') {
    const next = new Set(removedExistingKeys.value);
    next.add(itemKey(item));
    removedExistingKeys.value = next;

    if (item.url) {
      pendingDeleteUrls.value.push(item.url);
    }

    if (props.multiple) {
      const currentArr = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
      const filtered = currentArr.filter((val: any) => {
        const url = typeof val === 'string' ? val : val.url;
        return url !== item.url;
      });
      emit('update:modelValue', filtered);
    } else {
      emit('update:modelValue', null);
    }

    emit('remove-existing', item);
    return;
  }

  // آیتم تازه آپلود شده
  if (props.multiple) {
    const currentArr = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const filtered = currentArr.filter((val: any) => {
      const url = typeof val === 'string' ? val : val.url;
      return url !== item.url;
    });
    emit('update:modelValue', filtered);
  } else {
    emit('update:modelValue', null);
  }
  emit('file-removed', item);

  deleteMediaFromServer(item.url);
}

async function deleteMediaFromServer(url?: string) {
  if (!url) return;
  try {
    await $fetch('/api/upload/media', {
      method: 'DELETE',
      body: { urls: [url] },
    });
  } catch (err) {
    console.warn('حذف فایل با خطا مواجه شد:', err);
  }
}

async function commitPendingDeletions() {
  if (pendingDeleteUrls.value.length === 0) return;

  const currentActiveUrl =
    typeof props.modelValue === 'string'
      ? props.modelValue
      : (props.modelValue as any)?.url;

  const uniqueUrlsToDelete = Array.from(new Set(pendingDeleteUrls.value)).filter(
    (url) => Boolean(url) && url !== currentActiveUrl
  );

  if (uniqueUrlsToDelete.length === 0) {
    pendingDeleteUrls.value = [];
    return;
  }

  try {
    await $fetch('/api/upload/media', {
      method: 'DELETE',
      body: { urls: uniqueUrlsToDelete },
    });
    pendingDeleteUrls.value = [];
  } catch (err) {
    console.warn('خطا در پاکسازی نهایی فایل‌های قدیمی:', err);
  }
}

defineExpose({
  commitPendingDeletions,
});
</script>
