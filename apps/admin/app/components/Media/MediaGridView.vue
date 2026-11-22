<template>
  <div>
    <!-- شبکه کارت‌های مدیا -->
    <div
      v-if="items.length"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      <div
        v-for="item in items"
        :key="item.id"
        :class="[
          'group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-md',
          isSelected(item.id)
            ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/10'
            : 'border-gray-200/80 hover:border-gray-300',
        ]"
      >
        <!-- بخش تصویر و نشان‌ها -->
        <div class="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
          <!-- چک‌باکس انتخاب -->
          <div class="absolute top-2 right-2 z-20">
            <input
              type="checkbox"
              :checked="isSelected(item.id)"
              class="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 cursor-pointer shadow-xs"
              @click.stop="toggleSelect(item.id)"
            />
          </div>

          <!-- نشان وضعیت موقت -->
          <div v-if="isTempFile(item)" class="absolute top-2 left-2 z-20">
            <span
              class="bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs"
            >
              موقت
            </span>
          </div>

          <!-- تصویر با پیش‌نمایش بزرگ‌نمایی -->
          <template v-if="isImage(item.mimeType)">
            <Image
              :src="item.publicUrl"
              :alt="item.originalName || item.fileName"
              preview
              imageClass="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              class="w-full h-full flex items-center justify-center"
            />
          </template>

          <!-- پیش‌نمایش ویدیو -->
          <template v-else-if="isVideo(item.mimeType)">
            <div class="flex flex-col items-center justify-center text-rose-500 gap-1 p-2">
              <i class="pi pi-video text-3xl" />
              <span class="text-[10px] font-mono text-gray-500">ویدیو</span>
            </div>
          </template>

          <!-- پیش‌نمایش سند / پی‌دی‌اف -->
          <template v-else>
            <div class="flex flex-col items-center justify-center text-blue-500 gap-1 p-2">
              <i class="pi pi-file-pdf text-3xl" />
              <span class="text-[10px] font-mono text-gray-500">سند</span>
            </div>
          </template>

          <!-- لایه هاور برای پیش‌نمایش سریع یا باز کردن جزییات -->
          <div
            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center"
          >
            <span class="text-white text-xs bg-black/60 px-2 py-1 rounded-lg backdrop-blur-xs">
              مشاهده فایل
            </span>
          </div>
        </div>

        <!-- متادیتا و مشخصات فایل -->
        <div class="p-3 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <!-- نام فایل -->
            <p
              :title="item.originalName || item.fileName"
              class="text-xs font-semibold text-gray-800 truncate leading-snug"
            >
              {{ item.originalName || item.fileName }}
            </p>

            <!-- اطلاعات مالکیت -->
            <div class="flex items-center gap-1 mt-1.5 flex-wrap">
              <Tag
                :value="getOwnerLabel(item.ownerType)"
                :severity="getOwnerSeverity(item.ownerType)"
                rounded
                class="!px-1.5 !py-0.2 !text-[9px]"
              />
              <span
                v-if="item.ownerId && item.ownerId !== 'temp'"
                :title="'شناسه: ' + item.ownerId"
                class="text-[10px] text-gray-400 font-mono bg-gray-100 px-1 py-0.5 rounded truncate max-w-[80px]"
              >
                {{ item.ownerId }}
              </span>
            </div>
          </div>

          <!-- حجم و تاریخ -->
          <div class="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100">
            <span>{{ formatFileSize(item.size) }}</span>
            <span>{{ formatDate(item.createdAt) }}</span>
          </div>

          <!-- دکمه‌های اکشن سریع -->
          <div class="flex items-center justify-between gap-1 pt-1 border-t border-gray-50">
            <!-- کپی آدرس -->
            <button
              type="button"
              class="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              title="کپی آدرس فایل"
              @click.stop="copyUrl(item.publicUrl)"
            >
              <i class="pi pi-copy text-xs" />
            </button>

            <!-- دانلود فایل -->
            <a
              :href="item.publicUrl"
              target="_blank"
              download
              class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="دانلود یا باز کردن مستقیم"
              @click.stop
            >
              <i class="pi pi-external-link text-xs" />
            </a>

            <!-- ویرایش مالکیت و مشخصات -->
            <button
              type="button"
              class="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="تغییر مالکیت و ویرایش"
              @click.stop="$emit('edit', item)"
            >
              <i class="pi pi-pencil text-xs" />
            </button>

            <!-- حذف تکی -->
            <button
              type="button"
              class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="حذف فایل"
              @click.stop="$emit('delete', item)"
            >
              <i class="pi pi-trash text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- حالت خالی -->
    <div
      v-else
      class="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs flex flex-col items-center justify-center gap-3"
    >
      <div class="w-16 h-16 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center text-3xl">
        <i class="pi pi-folder-open" />
      </div>
      <p class="text-sm font-bold text-gray-700">هیچ فایلی با این فیلترها یافت نشد</p>
      <p class="text-xs text-gray-400">می‌توانید فیلترها را ریست کنید یا فایل‌های جدیدی آپلود نمایید.</p>
    </div>
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

function isSelected(id: number): boolean {
  return props.selectedIds.includes(id);
}

function toggleSelect(id: number) {
  if (isSelected(id)) {
    emit('update:selectedIds', props.selectedIds.filter((item) => item !== id));
  } else {
    emit('update:selectedIds', [...props.selectedIds, id]);
  }
}

function isImage(mime: string): boolean {
  return Boolean(mime && mime.startsWith('image/'));
}

function isVideo(mime: string): boolean {
  return Boolean(mime && mime.startsWith('video/'));
}

function isTempFile(item: MediaItem): boolean {
  return item.ownerId === 'temp' || item.ownerId?.startsWith('temp_');
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
    toast.success('آدرس مستقیم فایل در حافظه کپی شد', 'کپی شد', 2000);
  } catch {
    toast.error('امکان کپی خودکار فراهم نشد');
  }
}
</script>
