<template>
  <div
    dir="rtl"
    class="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200/90 bg-gradient-to-b from-gray-50/60 via-white to-gray-50/30 px-6 py-12 text-center transition-all duration-300 sm:py-16"
  >
    <!-- آیکون و بج چندلایه شیک -->
    <div class="relative mb-5 flex items-center justify-center">
      <!-- هاله نور پشت آیکون -->
      <div
        class="absolute -inset-1.5 animate-pulse rounded-full opacity-60 blur-lg transition-all"
        :class="isSearch ? 'bg-amber-200/50' : 'bg-brand-200/50'"
      />

      <!-- باکس آیکون اصلی -->
      <div
        class="relative flex h-20 w-20 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 hover:scale-105 sm:h-24 sm:w-24"
        :class="
          isSearch
            ? 'border-amber-200 bg-gradient-to-tr from-amber-50 to-orange-100/60 text-amber-600'
            : 'border-brand-200 bg-gradient-to-tr from-brand-50 to-rose-100/60 text-brand-600'
        "
      >
        <i
          :class="[
            displayIcon,
            'text-3xl sm:text-4xl transition-transform duration-300',
          ]"
        />

        <!-- نشانگر کوچک تزیینی گوشه -->
        <span
          class="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-2xs"
          :class="isSearch ? 'bg-amber-500 text-white' : 'bg-brand-500 text-white'"
        >
          <i
            :class="isSearch ? 'pi pi-search' : 'pi pi-inbox'"
            class="text-[10px]"
          />
        </span>
      </div>
    </div>

    <!-- عنوان اصلی پیام -->
    <h3 class="text-base font-bold text-gray-800 sm:text-lg">
      {{ displayTitle }}
    </h3>

    <!-- توضیحات و راهنما -->
    <p
      class="mt-2 max-w-md text-xs leading-relaxed text-gray-500 sm:text-sm"
    >
      {{ displaySubtitle }}
    </p>

    <!-- کادر اطلاعات جستجو (در صورت وجود کوئری) -->
    <div
      v-if="isSearch && searchQuery"
      class="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 shadow-2xs"
    >
      <span class="text-gray-400">جستجو برای:</span>
      <span class="font-bold text-gray-800 font-mono">"{{ searchQuery }}"</span>
    </div>

    <!-- دکمه‌های عملیاتی -->
    <div class="mt-6 flex flex-wrap items-center justify-center gap-2.5">
      <!-- دکمه پاکسازی فیلتر / سرچ -->
      <button
        v-if="isSearch"
        type="button"
        @click="$emit('clear-search')"
        class="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:border-gray-400 hover:bg-gray-50"
      >
        <i class="pi pi-times text-xs text-gray-500" />
        <span>{{ clearSearchLabel || 'پاک کردن فیلترها' }}</span>
      </button>

      <!-- دکمه ایجاد آیتم جدید (در صورت ارسال لینک) -->
      <NuxtLink
        v-if="createUrl"
        :to="createUrl"
        class="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
      >
        <i class="pi pi-plus text-xs" />
        <span>{{ createLabel || 'افزودن مورد جدید' }}</span>
      </NuxtLink>

      <!-- دکمه بروزرسانی مجدد -->
      <button
        v-if="showRefresh"
        type="button"
        @click="$emit('refresh')"
        class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-2xs transition-colors hover:border-brand-300 hover:text-brand-600"
      >
        <i class="pi pi-refresh text-xs" />
        <span>بارگذاری مجدد</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    icon?: string;
    isSearch?: boolean;
    searchQuery?: string;
    createUrl?: string;
    createLabel?: string;
    clearSearchLabel?: string;
    showRefresh?: boolean;
  }>(),
  {
    title: '',
    subtitle: '',
    icon: '',
    isSearch: false,
    searchQuery: '',
    createUrl: '',
    createLabel: '',
    clearSearchLabel: 'پاک کردن فیلترها',
    showRefresh: true,
  }
);

defineEmits<{
  (e: 'clear-search'): void;
  (e: 'refresh'): void;
}>();

const displayIcon = computed(() => {
  if (props.icon) return props.icon;
  if (props.isSearch) return 'pi pi-search-minus';
  return 'pi pi-box';
});

const displayTitle = computed(() => {
  if (props.title) return props.title;
  if (props.isSearch) return 'نتیجه‌ای برای جستجوی شما یافت نشد!';
  return 'هیچ آیتمی برای نمایش وجود ندارد';
});

const displaySubtitle = computed(() => {
  if (props.subtitle) return props.subtitle;
  if (props.isSearch) {
    return 'عبارت دیگری را جستجو کنید یا فیلترهای اعمال‌شده را پاک نمایید تا نتایج بیشتری مشاهده کنید.';
  }
  return 'در حال حاضر داده‌ای در این بخش ثبت نشده است. می‌توانید با استفاده از گزینه‌های موجود، اولین رکورد را ایجاد نمایید.';
});
</script>
