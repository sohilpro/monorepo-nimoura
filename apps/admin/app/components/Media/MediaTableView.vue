<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
    <DataTable
      v-model:selection="internalSelection"
      :value="items"
      dataKey="id"
      responsiveLayout="scroll"
      class="nimoura-media-table text-xs"
      stripedRows
    >
      <!-- ستون چک‌باکس انتخاب چندتایی -->
      <Column selectionMode="multiple" headerStyle="width: 3rem" />

      <!-- پیش‌نمایش تصویر یا مدیا -->
      <Column header="پیش‌نمایش" headerStyle="width: 5.5rem">
        <template #body="{ data }">
          <div class="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
            <template v-if="isImage(data.mimeType)">
              <Image
                :src="data.publicUrl"
                :alt="data.originalName"
                preview
                imageClass="w-full h-full object-cover"
                class="w-full h-full flex items-center justify-center"
              />
            </template>
            <template v-else-if="isVideo(data.mimeType)">
              <i class="pi pi-video text-rose-500 text-lg" />
            </template>
            <template v-else>
              <i class="pi pi-file-pdf text-blue-500 text-lg" />
            </template>
          </div>
        </template>
      </Column>

      <!-- نام فایل و آدرس -->
      <Column header="نام فایل" style="min-width: 14rem">
        <template #body="{ data }">
          <div class="space-y-0.5 max-w-xs">
            <p :title="data.originalName" class="font-bold text-gray-800 truncate">
              {{ data.originalName || data.fileName }}
            </p>
            <div class="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
              <span class="truncate max-w-[180px]">{{ data.fileName }}</span>
              <button
                type="button"
                class="hover:text-brand-600 transition-colors"
                title="کپی آدرس کامل"
                @click="copyUrl(data.publicUrl)"
              >
                <i class="pi pi-copy text-[11px]" />
              </button>
            </div>
          </div>
        </template>
      </Column>

      <!-- بخش مربوطه / مالکیت -->
      <Column header="بخش (مالکیت)" style="min-width: 9rem">
        <template #body="{ data }">
          <div class="flex flex-col gap-1 items-start">
            <Tag
              :value="getOwnerLabel(data.ownerType)"
              :severity="getOwnerSeverity(data.ownerType)"
              rounded
              class="!text-[10px] !px-2 !py-0.5"
            />
            <span
              v-if="data.ownerId && data.ownerId !== 'temp'"
              class="text-[10px] text-gray-400 font-mono"
            >
              شناسه: {{ data.ownerId }}
            </span>
          </div>
        </template>
      </Column>

      <!-- وضعیت اتصال -->
      <Column header="وضعیت" style="min-width: 6rem">
        <template #body="{ data }">
          <Tag
            v-if="isTempFile(data)"
            value="موقت (Temp)"
            severity="warn"
            rounded
            class="!text-[10px]"
          />
          <Tag
            v-else
            value="متصل"
            severity="success"
            rounded
            class="!text-[10px]"
          />
        </template>
      </Column>

      <!-- فرمت فایل -->
      <Column header="فرمت" style="min-width: 6rem">
        <template #body="{ data }">
          <span class="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-mono text-[10px] uppercase">
            {{ getFormatBadge(data) }}
          </span>
        </template>
      </Column>

      <!-- حجم -->
      <Column header="حجم" style="min-width: 6rem">
        <template #body="{ data }">
          <span class="font-medium text-gray-700 text-xs">
            {{ formatFileSize(data.size) }}
          </span>
        </template>
      </Column>

      <!-- تاریخ بارگذاری -->
      <Column header="تاریخ" style="min-width: 7rem">
        <template #body="{ data }">
          <span class="text-gray-500 text-[11px]">
            {{ formatDate(data.createdAt) }}
          </span>
        </template>
      </Column>

      <!-- عملیات -->
      <Column header="عملیات" headerStyle="width: 8rem">
        <template #body="{ data }">
          <div class="flex items-center gap-1">
            <Button
              icon="pi pi-external-link"
              severity="secondary"
              text
              rounded
              size="small"
              as="a"
              :href="data.publicUrl"
              target="_blank"
              title="مشاهده مستقیم"
            />
            <Button
              icon="pi pi-pencil"
              severity="warn"
              text
              rounded
              size="small"
              title="تغییر مالکیت و ویرایش"
              @click="$emit('edit', data)"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              size="small"
              title="حذف فایل"
              @click="$emit('delete', data)"
            />
          </div>
        </template>
      </Column>

      <!-- وضعیت خالی -->
      <template #empty>
        <div class="py-12 text-center text-gray-400">
          <i class="pi pi-inbox text-3xl mb-2 text-gray-300" />
          <p class="text-xs">هیچ فایلی برای نمایش وجود ندارد.</p>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import type { MediaItem } from '@nimoura/shared-types';
import { MediaOwnerType, MediaOwnerTypeLabels } from '@nimoura/shared-types';
import { formatDate, formatFileSize } from '@nimoura/utils';

const props = defineProps<{
  items: MediaItem[];
  selectedIds: number[];
}>();

const emit = defineEmits<{
  (e: 'update:selectedIds', ids: number[]): void;
  (e: 'edit', item: MediaItem): void;
  (e: 'delete', item: MediaItem): void;
}>();

const toast = useAppToast();

const internalSelection = computed({
  get: () => props.items.filter((item) => props.selectedIds.includes(item.id)),
  set: (val: MediaItem[]) => {
    emit(
      'update:selectedIds',
      val.map((item) => item.id),
    );
  },
});

function isImage(mime: string): boolean {
  return Boolean(mime && mime.startsWith('image/'));
}

function isVideo(mime: string): boolean {
  return Boolean(mime && mime.startsWith('video/'));
}

function isTempFile(item: MediaItem): boolean {
  return item.ownerId === 'temp' || item.ownerId?.startsWith('temp_');
}

function getFormatBadge(item: MediaItem): string {
  if (item.mimeType) {
    const parts = item.mimeType.split('/');
    return parts[1] || item.mimeType;
  }
  const ext = item.fileName.split('.').pop();
  return ext || 'FILE';
}

function getOwnerLabel(ownerType: MediaOwnerType): string {
  return MediaOwnerTypeLabels[ownerType] || ownerType || 'نامشخص';
}

function getOwnerSeverity(ownerType: MediaOwnerType): 'info' | 'success' | 'warn' | 'danger' | 'secondary' {
  switch (ownerType) {
    case MediaOwnerType.PRODUCT_THUMBNAIL:
    case MediaOwnerType.PRODUCT_GALLERY:
    case MediaOwnerType.PRODUCT_VARIANT:
      return 'info';
    case MediaOwnerType.BRAND_LOGO:
      return 'success';
    case MediaOwnerType.BANNER:
      return 'warn';
    case MediaOwnerType.MAGAZINE_COVER:
    case MediaOwnerType.MAGAZINE_CONTENT_IMAGE:
    case MediaOwnerType.ARTICLE_CONTENT:
      return 'secondary';
    case MediaOwnerType.TICKET_ATTACHMENT:
      return 'danger';
    default:
      return 'secondary';
  }
}

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('آدرس کامل فایل کپی شد', 'کپی شد', 2000);
  } catch {
    toast.error('امکان کپی خودکار فراهم نشد');
  }
}
</script>
