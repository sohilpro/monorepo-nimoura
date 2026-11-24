<template>
  <div class="space-y-6 max-w-4xl mx-auto" dir="rtl">
    <UtilsHeaderWithActions
      :breadcrumbs="[
        { label: 'داشبورد', href: '/' },
        { label: 'مدیریت فایل‌ها و رسانه', href: '/media' },
        { label: 'آپلود فایل جدید', href: '/media/upload' },
      ]"
      title="آپلود فایل و تصویر جدید"
      subtitle="بارگذاری تصاویر و فایل‌ها در پوشه uploads و انتساب به بخش‌های مختلف فروشگاه"
    />

    <div class="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- انتخاب بخش -->
        <div class="space-y-1.5">
          <label class="font-bold text-gray-700 text-xs">بخش ذخیره‌سازی مقصد</label>
          <Select
            v-model="ownerType"
            :options="ownerTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="انتخاب بخش"
            class="w-full !rounded-xl !text-xs"
          />
        </div>

        <!-- شناسه مالک -->
        <div class="space-y-1.5">
          <label class="font-bold text-gray-700 text-xs">شناسه مالک (یا temp)</label>
          <InputText
            v-model="ownerId"
            placeholder="مثال: temp یا 15"
            class="w-full !rounded-xl !text-xs !py-2.5 font-mono text-left"
            dir="ltr"
          />
        </div>
      </div>

      <!-- ناحیه دراگ و دراپ -->
      <div
        class="border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-2xl p-10 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-brand-50/10 flex flex-col items-center justify-center gap-3"
        @click="triggerFileInput"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl shadow-xs"
        >
          <i class="pi pi-cloud-upload" />
        </div>
        <p class="font-bold text-gray-700 text-sm">
          برای انتخاب فایل‌ها کلیک کنید یا فایل‌ها را به اینجا بکشید
        </p>
        <p class="text-xs text-gray-400">
          امکان انتخاب هم‌زمان چند تصویر، ویدیو یا فایل PDF
        </p>
        <input
          ref="fileInputRef"
          type="file"
          multiple
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- لیست فایل‌های آماده آپلود -->
      <div v-if="files.length" class="space-y-3">
        <div class="flex items-center justify-between text-xs font-bold text-gray-700">
          <span>فایل‌های آماده برای ارسال ({{ files.length }})</span>
          <button
            type="button"
            class="text-rose-600 hover:underline text-xs"
            @click="files = []"
          >
            پاک کردن لیست
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="(f, idx) in files"
            :key="idx"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <i class="pi pi-file text-brand-600 text-lg" />
              <div class="min-w-0">
                <p class="font-medium text-gray-800 truncate text-xs">{{ f.name }}</p>
                <span class="text-[10px] text-gray-400">{{ formatFileSize(f.size) }}</span>
              </div>
            </div>
            <button
              type="button"
              class="text-gray-400 hover:text-rose-600 p-1"
              @click="files.splice(idx, 1)"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            label="انصراف"
            severity="secondary"
            variant="outlined"
            class="!rounded-xl !text-xs"
            @click="navigateTo('/media')"
          />
          <Button
            :label="`شروع آپلود (${files.length} فایل)`"
            icon="pi pi-cloud-upload"
            severity="primary"
            class="!rounded-xl !text-xs font-bold"
            :loading="isLoading"
            @click="submitUpload"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MediaOwnerType } from '@nimoura/shared-types';
import { formatFileSize } from '@nimoura/utils';


const { uploadFiles, isLoading } = useAdminMedia();

const ownerType = ref<string>(MediaOwnerType.BANNER);
const ownerId = ref('temp');
const files = ref<File[]>([]);
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
    files.value = [...files.value, ...Array.from(target.files)];
    target.value = '';
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files) {
    files.value = [...files.value, ...Array.from(event.dataTransfer.files)];
  }
}

async function submitUpload() {
  if (files.value.length === 0) return;
  const success = await uploadFiles(
    files.value,
    ownerType.value,
    ownerId.value.trim() || 'temp',
  );
  if (success) {
    await navigateTo('/media');
  }
}
</script>
