<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="ویرایش مشخصات و تغییر مالکیت فایل"
    :style="{ width: '90vw', maxWidth: '560px' }"
    :pt="{
      root: { class: '!rounded-2xl !p-0 !border-0 shadow-2xl' },
      header: { class: '!p-5 !border-b !border-gray-100 !bg-gray-50/50 !rounded-t-2xl' },
      content: { class: '!p-6' },
      footer: { class: '!p-4 !border-t !border-gray-100 !bg-gray-50/50 !rounded-b-2xl' },
    }"
  >
    <div v-if="mediaItem" class="space-y-5 text-xs" dir="rtl">
      <!-- پیش‌نمایش تصویر و اطلاعات اولیه -->
      <div class="flex items-center gap-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
        <div class="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0 flex items-center justify-center">
          <img
            v-if="isImage(mediaItem.mimeType)"
            :src="mediaItem.publicUrl"
            :alt="mediaItem.originalName"
            class="w-full h-full object-cover"
          />
          <i v-else-if="isVideo(mediaItem.mimeType)" class="pi pi-video text-2xl text-rose-500" />
          <i v-else class="pi pi-file-pdf text-2xl text-blue-500" />
        </div>
        <div class="space-y-1 min-w-0 flex-1">
          <p class="font-bold text-gray-800 truncate text-sm">
            {{ mediaItem.originalName || mediaItem.fileName }}
          </p>
          <p class="text-[11px] text-gray-400 font-mono truncate">
            {{ mediaItem.fileName }}
          </p>
          <div class="flex items-center gap-2 text-[10px] text-gray-500 pt-1">
            <span>{{ formatFileSize(mediaItem.size) }}</span>
            <span>•</span>
            <span class="uppercase font-mono">{{ mediaItem.mimeType }}</span>
          </div>
        </div>
      </div>

      <!-- فرم ویرایش -->
      <div class="space-y-4">
        <!-- عنوان / نام نمایشی فایل -->
        <div class="space-y-1.5">
          <label class="font-bold text-gray-700">نام فایل / عنوان اصلی</label>
          <InputText
            v-model="form.originalName"
            placeholder="مثال: تصویر شاخص کرم ضد آفتاب..."
            class="w-full !rounded-xl !text-xs !py-2.5"
          />
        </div>

        <!-- نوع بخش / مالکیت فایل (OwnerType) -->
        <div class="space-y-1.5">
          <label class="font-bold text-gray-700">بخش مربوطه (تایپ مالکیت)</label>
          <Select
            v-model="form.ownerType"
            :options="ownerTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="انتخاب نوع بخش"
            class="w-full !rounded-xl !text-xs"
          />
          <span class="text-[10px] text-gray-400 block">
            با تغییر این بخش، ارتباط منطقی فایل در سامانه جابجا می‌شود.
          </span>
        </div>

        <!-- شناسه مالک (OwnerId) -->
        <div class="space-y-1.5">
          <label class="font-bold text-gray-700">شناسه رکورد مالک (Owner ID)</label>
          <InputText
            v-model="form.ownerId"
            placeholder="مثال: 14 (شناسه محصول، برند یا مقاله)"
            class="w-full !rounded-xl !text-xs !py-2.5 font-mono text-left"
            dir="ltr"
          />
          <span class="text-[10px] text-gray-400 block">
            برای فایل‌های موقت، مقدار <code class="text-amber-600 font-mono">temp</code> وارد می‌شود.
          </span>
        </div>

        <!-- ترتیب نمایش (Order) -->
        <div class="space-y-1.5">
          <label class="font-bold text-gray-700">ترتیب نمایش (اولویت)</label>
          <InputText
            v-model.number="form.order"
            type="number"
            placeholder="0"
            class="w-full !rounded-xl !text-xs !py-2.5"
          />
        </div>

        <!-- آدرس عمومی قابل دسترسی -->
        <div class="space-y-1.5">
          <label class="font-bold text-gray-700">آدرس عمومی فایل (Public URL)</label>
          <div class="flex items-center gap-2">
            <InputText
              :value="mediaItem.publicUrl"
              readonly
              class="w-full !rounded-xl !text-xs !py-2 font-mono bg-gray-50 text-gray-500"
              dir="ltr"
            />
            <Button
              icon="pi pi-copy"
              severity="secondary"
              class="!rounded-xl !px-3"
              title="کپی لینک"
              @click="copyUrl(mediaItem.publicUrl)"
            />
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
          label="ذخیره تغییرات"
          icon="pi pi-check"
          severity="primary"
          class="!rounded-xl !text-xs font-bold"
          :loading="saving"
          @click="handleSave"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { MediaItem, UpdateMediaPayload } from '@nimoura/shared-types';
import { MediaOwnerType } from '@nimoura/shared-types';
import { formatFileSize } from '@nimoura/utils';

const props = defineProps<{
  visible: boolean;
  mediaItem: MediaItem | null;
  saving: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', payload: { id: number; data: UpdateMediaPayload }): void;
}>();

const toast = useAppToast();

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const form = reactive({
  originalName: '',
  ownerType: MediaOwnerType.PRODUCT_THUMBNAIL,
  ownerId: '',
  order: 0,
});

watch(
  () => props.mediaItem,
  (item) => {
    if (item) {
      form.originalName = item.originalName || '';
      form.ownerType = item.ownerType || MediaOwnerType.PRODUCT_THUMBNAIL;
      form.ownerId = item.ownerId || '';
      form.order = item.order || 0;
    }
  },
  { immediate: true },
);

const ownerTypeOptions = [
  { label: 'تصویر شاخص محصول (product_thumbnail)', value: MediaOwnerType.PRODUCT_THUMBNAIL },
  { label: 'گالری محصول (product_gallery)', value: MediaOwnerType.PRODUCT_GALLERY },
  { label: 'تنوع‌های محصول (product_variant)', value: MediaOwnerType.PRODUCT_VARIANT },
  { label: 'لوگوی برند (brand_logo)', value: MediaOwnerType.BRAND_LOGO },
  { label: 'بنر و اسلایدر (banner)', value: MediaOwnerType.BANNER },
  { label: 'تصویر شاخص دسته‌بندی (category_image)', value: MediaOwnerType.CATEGORY_IMAGE },
  { label: 'آیکون دسته‌بندی (category_icon)', value: MediaOwnerType.CATEGORY_ICON },
  { label: 'کاور مقاله مجله (magazine_cover)', value: MediaOwnerType.MAGAZINE_COVER },
  { label: 'تصویر محتوای مقاله (magazine_content_image)', value: MediaOwnerType.MAGAZINE_CONTENT_IMAGE },
  { label: 'محتوای مقاله (article_content)', value: MediaOwnerType.ARTICLE_CONTENT },
  { label: 'تصویر دیدگاه کاربران (comment_image)', value: MediaOwnerType.COMMENT_IMAGE },
  { label: 'ضمیمه تیکت پشتیبانی (ticket_attachment)', value: MediaOwnerType.TICKET_ATTACHMENT },
  { label: 'ویدیوی اکسپلور (explore_video)', value: MediaOwnerType.EXPLORE_VIDEO },
];

function isImage(mime: string): boolean {
  return Boolean(mime && mime.startsWith('image/'));
}

function isVideo(mime: string): boolean {
  return Boolean(mime && mime.startsWith('video/'));
}

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('آدرس کامل کپی شد', 'کپی شد', 2000);
  } catch {
    toast.error('امکان کپی خودکار وجود ندارد');
  }
}

function handleSave() {
  if (!props.mediaItem) return;
  emit('save', {
    id: props.mediaItem.id,
    data: {
      originalName: form.originalName,
      ownerType: form.ownerType,
      ownerId: form.ownerId,
      order: form.order,
    },
  });
}
</script>
