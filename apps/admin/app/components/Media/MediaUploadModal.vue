<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="آپلود فایل و تصویر جدید به سرور"
    :style="{ width: '90vw', maxWidth: '620px' }"
    :pt="{
      root: { class: '!rounded-2xl !p-0 !border-0 shadow-2xl' },
      header: { class: '!p-5 !border-b !border-gray-100 !bg-gray-50/50 !rounded-t-2xl' },
      content: { class: '!p-6' },
      footer: { class: '!p-4 !border-t !border-gray-100 !bg-gray-50/50 !rounded-b-2xl' },
    }"
  >
    <div class="space-y-5 text-xs" dir="rtl">
      <!-- تنظیمات مالکیت مقصد -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <!-- بخش مقصد -->
        <div class="space-y-1.5">
          <label class="font-bold text-gray-700">بخش ذخیره‌سازی مقصد</label>
          <Select
            v-model="targetOwnerType"
            :options="ownerTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="انتخاب بخش"
            class="w-full !rounded-xl !text-xs"
          />
        </div>

        <!-- شناسه مالک -->
        <div class="space-y-1.5">
          <label class="font-bold text-gray-700">شناسه رکورد مالک (یا temp)</label>
          <InputText
            v-model="targetOwnerId"
            placeholder="temp یا شناسه عددی"
            class="w-full !rounded-xl !text-xs !py-2.5 font-mono text-left"
            dir="ltr"
          />
        </div>
      </div>

      <!-- کادر Drag and Drop و انتخاب فایل -->
      <div
        class="border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-gray-50/40 hover:bg-brand-50/10 flex flex-col items-center justify-center gap-2"
        @click="triggerFileInput"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div
          class="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl shadow-xs"
        >
          <i class="pi pi-cloud-upload" />
        </div>
        <p class="font-bold text-gray-700 text-sm">
          برای انتخاب فایل‌ها کلیک کنید یا فایل‌ها را به اینجا بکشید
        </p>
        <p class="text-[11px] text-gray-400">
          پشتیبانی از تصاویر (WebP, JPG, PNG, SVG)، ویدیوها و اسناد تا سقف مجاز
        </p>
        <input
          ref="fileInputRef"
          type="file"
          multiple
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- لیست فایل‌های انتخاب شده قبل از آپلود -->
      <div v-if="selectedFiles.length" class="space-y-2">
        <div class="flex items-center justify-between text-gray-600 font-bold">
          <span>فایل‌های انتخاب‌شده ({{ selectedFiles.length }})</span>
          <button
            type="button"
            class="text-rose-600 hover:underline text-[11px]"
            @click="selectedFiles = []"
          >
            پاک کردن همه
          </button>
        </div>

        <div class="max-h-48 overflow-y-auto space-y-2 pr-1">
          <div
            v-for="(f, idx) in selectedFiles"
            :key="idx"
            class="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100 shadow-2xs"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <i class="pi pi-file text-brand-600 text-base" />
              <div class="min-w-0">
                <p class="font-medium text-gray-800 truncate max-w-xs">{{ f.name }}</p>
                <span class="text-[10px] text-gray-400">{{ formatFileSize(f.size) }}</span>
              </div>
            </div>
            <button
              type="button"
              class="text-gray-400 hover:text-rose-600 p-1"
              @click="removeFile(idx)"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- فوتر دیالوگ -->
    <template #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <Button
          label="انصراف"
          severity="secondary"
          variant="outlined"
          class="!rounded-xl !text-xs"
          @click="dialogVisible = false"
        />
        <Button
          :label="selectedFiles.length ? `شروع آپلود (${selectedFiles.length} فایل)` : 'آپلود'"
          icon="pi pi-cloud-upload"
          severity="primary"
          class="!rounded-xl !text-xs font-bold"
          :disabled="selectedFiles.length === 0"
          :loading="uploading"
          @click="handleUpload"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { MediaOwnerType } from '@nimoura/shared-types';
import { formatFileSize } from '@nimoura/utils';

const props = defineProps<{
  visible: boolean;
  uploading: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'upload', payload: { files: File[]; ownerType: string; ownerId: string }): void;
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const targetOwnerType = ref<string>(MediaOwnerType.BANNER);
const targetOwnerId = ref('temp');
const selectedFiles = ref<File[]>([]);
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const ownerTypeOptions = [
  { label: 'بنرها و اسلایدرها (banner)', value: MediaOwnerType.BANNER },
  { label: 'تصویر شاخص محصول (product_thumbnail)', value: MediaOwnerType.PRODUCT_THUMBNAIL },
  { label: 'گالری محصول (product_gallery)', value: MediaOwnerType.PRODUCT_GALLERY },
  { label: 'تنوع‌های محصول (product_variant)', value: MediaOwnerType.PRODUCT_VARIANT },
  { label: 'لوگوی برند (brand_logo)', value: MediaOwnerType.BRAND_LOGO },
  { label: 'تصویر شاخص دسته‌بندی (category_image)', value: MediaOwnerType.CATEGORY_IMAGE },
  { label: 'آیکون دسته‌بندی (category_icon)', value: MediaOwnerType.CATEGORY_ICON },
  { label: 'کاور مقاله مجله (magazine_cover)', value: MediaOwnerType.MAGAZINE_COVER },
  { label: 'تصویر محتوای مقاله (magazine_content_image)', value: MediaOwnerType.MAGAZINE_CONTENT_IMAGE },
  { label: 'محتوای مقاله (article_content)', value: MediaOwnerType.ARTICLE_CONTENT },
  { label: 'تصویر دیدگاه (comment_image)', value: MediaOwnerType.COMMENT_IMAGE },
  { label: 'ضمیمه تیکت (ticket_attachment)', value: MediaOwnerType.TICKET_ATTACHMENT },
  { label: 'ویدیوی اکسپلور (explore_video)', value: MediaOwnerType.EXPLORE_VIDEO },
];

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    addFiles(Array.from(target.files));
    target.value = '';
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files));
  }
}

function addFiles(files: File[]) {
  selectedFiles.value = [...selectedFiles.value, ...files];
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1);
}

function handleUpload() {
  if (selectedFiles.value.length === 0) return;
  emit('upload', {
    files: selectedFiles.value,
    ownerType: targetOwnerType.value,
    ownerId: targetOwnerId.value.trim() || 'temp',
  });
}

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      selectedFiles.value = [];
    }
  },
);
</script>
