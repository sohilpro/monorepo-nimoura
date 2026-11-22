<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="تغییر مالکیت گروهی فایل‌ها"
    :style="{ width: '90vw', maxWidth: '480px' }"
    :pt="{
      root: { class: '!rounded-2xl !p-0 !border-0 shadow-2xl' },
      header: { class: '!p-5 !border-b !border-gray-100 !bg-gray-50/50 !rounded-t-2xl' },
      content: { class: '!p-6' },
      footer: { class: '!p-4 !border-t !border-gray-100 !bg-gray-50/50 !rounded-b-2xl' },
    }"
  >
    <div class="space-y-4 text-xs" dir="rtl">
      <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 flex items-start gap-3 text-amber-900">
        <i class="pi pi-exclamation-circle text-lg text-amber-600 mt-0.5 shrink-0" />
        <div class="space-y-1 leading-relaxed">
          <p class="font-bold">تغییر مالکیت همزمان {{ selectedItems.length }} فایل</p>
          <p class="text-[11px] text-amber-700">
            با این کار، تمام فایل‌های انتخاب‌شده به بخش و شناسه مالک جدید زیر منتسب خواهند شد.
          </p>
        </div>
      </div>

      <!-- بخش جدید (New Owner Type) -->
      <div class="space-y-1.5">
        <label class="font-bold text-gray-700">بخش مالکیت جدید</label>
        <Select
          v-model="newOwnerType"
          :options="ownerTypeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="انتخاب بخش جدید"
          class="w-full !rounded-xl !text-xs"
        />
      </div>

      <!-- شناسه جدید مالک (New Owner ID) -->
      <div class="space-y-1.5">
        <label class="font-bold text-gray-700">شناسه مالک جدید (Owner ID)</label>
        <InputText
          v-model="newOwnerId"
          placeholder="مثلاً: 25 یا slug محصول"
          class="w-full !rounded-xl !text-xs !py-2.5 font-mono text-left"
          dir="ltr"
        />
      </div>
    </div>

    <!-- فوتر -->
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
          label="اعمال تغییر مالکیت"
          icon="pi pi-check"
          severity="warn"
          class="!rounded-xl !text-xs font-bold"
          :disabled="!newOwnerId"
          :loading="saving"
          @click="handleSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { MediaItem, ReassignOwnerPayload } from '@nimoura/shared-types';
import { MediaOwnerType } from '@nimoura/shared-types';

const props = defineProps<{
  visible: boolean;
  selectedItems: MediaItem[];
  saving: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'reassign', payload: ReassignOwnerPayload): void;
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const newOwnerType = ref<MediaOwnerType>(MediaOwnerType.PRODUCT_GALLERY);
const newOwnerId = ref('');

const ownerTypeOptions = [
  { label: 'تصویر شاخص محصول', value: MediaOwnerType.PRODUCT_THUMBNAIL },
  { label: 'گالری محصول', value: MediaOwnerType.PRODUCT_GALLERY },
  { label: 'تنوع محصول', value: MediaOwnerType.PRODUCT_VARIANT },
  { label: 'لوگوی برند', value: MediaOwnerType.BRAND_LOGO },
  { label: 'بنر و اسلایدر', value: MediaOwnerType.BANNER },
  { label: 'تصویر شاخص دسته‌بندی', value: MediaOwnerType.CATEGORY_IMAGE },
  { label: 'آیکون دسته‌بندی', value: MediaOwnerType.CATEGORY_ICON },
  { label: 'کاور مقاله مجله', value: MediaOwnerType.MAGAZINE_COVER },
  { label: 'تصویر محتوای مقاله', value: MediaOwnerType.MAGAZINE_CONTENT_IMAGE },
  { label: 'تصویر دیدگاه', value: MediaOwnerType.COMMENT_IMAGE },
  { label: 'ضمیمه تیکت', value: MediaOwnerType.TICKET_ATTACHMENT },
];

function handleSubmit() {
  const publicUrls = props.selectedItems.map((item) => item.publicUrl);
  emit('reassign', {
    publicUrls,
    newOwnerType: newOwnerType.value,
    newOwnerId: newOwnerId.value.trim(),
  });
}
</script>
