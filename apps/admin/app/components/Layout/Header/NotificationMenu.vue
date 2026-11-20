<template>
  <div class="relative" ref="dropdownRef">
    <!-- دکمه زنگوله اعلان‌ها -->
    <button
      type="button"
      class="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:outline-hidden"
      @click="toggleDropdown"
      :aria-expanded="dropdownOpen"
      title="اعلان‌ها و رویدادها"
    >
      <!-- نشانگر پالس نوتیفیکیشن جدید -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs"
      >
        <span
          class="absolute inset-0 animate-ping rounded-full bg-rose-400 opacity-75"
        />
        <span class="relative">{{ unreadCount > 9 ? '+9' : unreadCount }}</span>
      </span>

      <i class="pi pi-bell text-base" />
    </button>

    <!-- منوی کشویی اعلان‌ها -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="dropdownOpen"
        dir="rtl"
        class="absolute left-0 top-full z-50 mt-2 w-[340px] max-w-[calc(100vw-24px)] origin-top-left rounded-2xl border border-gray-100 bg-white p-3 shadow-xl shadow-gray-200/50 sm:w-[380px]"
      >
        <!-- هدر منو -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div class="flex items-center gap-2">
            <h5 class="text-sm font-bold text-gray-900">اعلان‌ها و یادآوری‌ها</h5>
            <span
              v-if="unreadCount > 0"
              class="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600"
            >
              {{ unreadCount }} جدید
            </span>
          </div>

          <div class="flex items-center gap-1">
            <button
              type="button"
              class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              :class="{ 'animate-spin': pending }"
              @click="refreshNotifications"
              title="بروزرسانی"
            >
              <i class="pi pi-refresh text-xs" />
            </button>
            <button
              type="button"
              class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              @click="closeDropdown"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>
        </div>

        <!-- محتوای نوتیفیکیشن‌ها -->
        <div class="my-2 max-h-[360px] overflow-y-auto no-scrollbar space-y-1.5">
          <!-- حالت لودینگ -->
          <div v-if="pending && !items.length" class="flex flex-col items-center justify-center py-8 text-gray-400">
            <i class="pi pi-spin pi-spinner text-2xl text-brand-500 mb-2" />
            <span class="text-xs">در حال بارگذاری اعلان‌ها...</span>
          </div>

          <!-- حالت خالی (بدون اعلان) -->
          <div
            v-else-if="items.length === 0"
            class="flex flex-col items-center justify-center py-8 text-center"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-2"
            >
              <i class="pi pi-check-circle text-xl" />
            </div>
            <span class="text-xs font-bold text-gray-800">همه چیز مرتب است!</span>
            <span class="mt-1 text-[11px] text-gray-500">
              هیچ تیکت، دیدگاه یا سفارش معلقی برای اقدام وجود ندارد.
            </span>
          </div>

          <!-- لیست کارت‌های اعلان -->
          <NuxtLink
            v-else
            v-for="item in items"
            :key="item.id"
            :to="item.href"
            class="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50 group border border-transparent hover:border-gray-100"
            @click="closeDropdown"
          >
            <!-- آیکون دسته‌بندی -->
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base shadow-2xs"
              :class="item.iconBg"
            >
              <i :class="item.icon" />
            </div>

            <!-- اطلاعات پیام -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <span class="truncate text-xs font-bold text-gray-800 group-hover:text-brand-600">
                  {{ item.title }}
                </span>
                <span
                  class="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                  :class="item.badgeClass"
                >
                  {{ item.time }}
                </span>
              </div>
              <p class="mt-0.5 text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                {{ item.description }}
              </p>
            </div>
          </NuxtLink>
        </div>

        <!-- پاورقی -->
        <div class="border-t border-gray-100 pt-2 flex items-center justify-between">
          <NuxtLink
            to="/tickets"
            class="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
            @click="closeDropdown"
          >
            مرکز تیکت‌ها و پشتیبانی &larr;
          </NuxtLink>

          <span class="text-[10px] text-gray-400">
            بروزرسانی زنده
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const dropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  badgeClass: string;
  iconBg: string;
  href: string;
  time: string;
  unread: boolean;
}

const { data, pending, refresh } = await useFetch<{
  success: boolean;
  data: {
    unreadCount: number;
    items: NotificationItem[];
  };
}>("/api/notifications", {
  lazy: true,
  default: () => ({
    success: true,
    data: {
      unreadCount: 0,
      items: [],
    },
  }),
});

const unreadCount = computed(() => data.value?.data?.unreadCount || 0);
const items = computed(() => data.value?.data?.items || []);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
  if (dropdownOpen.value) {
    refresh();
  }
};

const closeDropdown = () => {
  dropdownOpen.value = false;
};

const refreshNotifications = () => {
  refresh();
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
