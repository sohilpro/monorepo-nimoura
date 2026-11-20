<template>
  <div>
    <!-- دکمه ورودی سرچ در هدر (دسکتاپ) -->
    <div class="hidden lg:block">
      <button
        type="button"
        @click="openModal"
        class="flex h-10 w-72 xl:w-96 items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 px-3 text-right text-xs text-gray-500 shadow-2xs transition-all duration-200 hover:border-brand-300 hover:bg-white hover:text-gray-800 focus:outline-hidden"
      >
        <div class="flex items-center gap-2">
          <i class="pi pi-search text-gray-400 text-sm" />
          <span>جستجو در بخش‌ها، سفارشات، کالاها...</span>
        </div>
        <kbd
          class="flex items-center gap-0.5 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-gray-400 shadow-2xs"
        >
          <span>Ctrl</span>
          <span>K</span>
        </kbd>
      </button>
    </div>

    <!-- دکمه کوچک سرچ برای موبایل/تبلت -->
    <div class="lg:hidden">
      <button
        type="button"
        @click="openModal"
        class="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        title="جستجو (Ctrl+K)"
      >
        <i class="pi pi-search text-base" />
      </button>
    </div>

    <!-- مودال پالت فرمان (Command Palette) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 p-4 pt-16 sm:pt-24 backdrop-blur-xs"
          @click.self="closeModal"
          dir="rtl"
        >
          <div
            class="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl transition-all"
            @keydown="handleKeyNavigation"
          >
            <!-- فیلد ورودی سرچ -->
            <div class="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5">
              <i
                v-if="!loading"
                class="pi pi-search text-lg text-gray-400"
              />
              <i
                v-else
                class="pi pi-spin pi-spinner text-lg text-brand-500"
              />

              <input
                ref="searchInputRef"
                v-model="query"
                type="text"
                placeholder="جستجو در پنل مدیریت، محصولات، سفارشات، مشتریان..."
                class="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden"
                @input="handleQueryChange"
              />

              <button
                v-if="query"
                type="button"
                @click="clearQuery"
                class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <i class="pi pi-times text-xs" />
              </button>

              <button
                type="button"
                @click="closeModal"
                class="rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-50"
              >
                ESC
              </button>
            </div>

            <!-- بخش نتایج و صفحات -->
            <div class="max-h-[60vh] overflow-y-auto p-3 no-scrollbar space-y-4">
              <!-- نتایج سرچ آنلاین (در صورت وجود ورودی) -->
              <div v-if="query.trim().length >= 2">
                <!-- محصولات یافت شده -->
                <div v-if="liveResults.products.length > 0" class="mb-3">
                  <div class="mb-1.5 flex items-center justify-between px-2 text-[11px] font-bold text-gray-400">
                    <span>محصولات</span>
                    <span class="text-[10px]">{{ liveResults.products.length }} نتیجه</span>
                  </div>
                  <div class="space-y-1">
                    <button
                      v-for="(prod, idx) in liveResults.products"
                      :key="'p-' + (prod.id || idx)"
                      type="button"
                      class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-right text-xs transition-colors hover:bg-brand-50 hover:text-brand-700"
                      @click="navigateToUrl('/product')"
                    >
                      <div class="flex items-center gap-2.5 truncate">
                        <i class="pi pi-box text-brand-500" />
                        <span class="font-medium text-gray-800">{{ prod.title || prod.name || 'بدون عنوان' }}</span>
                      </div>
                      <span v-if="prod.price" class="text-[11px] font-mono text-gray-500">
                        {{ Number(prod.price).toLocaleString() }} تومان
                      </span>
                    </button>
                  </div>
                </div>

                <!-- سفارشات یافت شده -->
                <div v-if="liveResults.orders.length > 0" class="mb-3">
                  <div class="mb-1.5 flex items-center justify-between px-2 text-[11px] font-bold text-gray-400">
                    <span>سفارشات</span>
                    <span class="text-[10px]">{{ liveResults.orders.length }} نتیجه</span>
                  </div>
                  <div class="space-y-1">
                    <button
                      v-for="(ord, idx) in liveResults.orders"
                      :key="'o-' + (ord.id || idx)"
                      type="button"
                      class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-right text-xs transition-colors hover:bg-brand-50 hover:text-brand-700"
                      @click="navigateToUrl('/order')"
                    >
                      <div class="flex items-center gap-2.5 truncate">
                        <i class="pi pi-shopping-bag text-emerald-500" />
                        <span class="font-medium text-gray-800">
                          سفارش #{{ ord.order_number || ord.id }}
                        </span>
                        <span v-if="ord.user?.first_name || ord.user_name" class="text-gray-400 text-[11px]">
                          ({{ ord.user?.first_name }} {{ ord.user?.last_name || '' }})
                        </span>
                      </div>
                      <span v-if="ord.total_price || ord.totalAmount" class="text-[11px] font-mono text-gray-500">
                        {{ Number(ord.total_price || ord.totalAmount).toLocaleString() }} تومان
                      </span>
                    </button>
                  </div>
                </div>

                <!-- کاربران یافت شده -->
                <div v-if="liveResults.users.length > 0" class="mb-3">
                  <div class="mb-1.5 flex items-center justify-between px-2 text-[11px] font-bold text-gray-400">
                    <span>کاربران و مشتریان</span>
                    <span class="text-[10px]">{{ liveResults.users.length }} نتیجه</span>
                  </div>
                  <div class="space-y-1">
                    <button
                      v-for="(usr, idx) in liveResults.users"
                      :key="'u-' + (usr.id || idx)"
                      type="button"
                      class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-right text-xs transition-colors hover:bg-brand-50 hover:text-brand-700"
                      @click="navigateToUrl('/customers')"
                    >
                      <div class="flex items-center gap-2.5 truncate">
                        <i class="pi pi-user text-blue-500" />
                        <span class="font-medium text-gray-800">
                          {{ usr.first_name || '' }} {{ usr.last_name || 'کاربر' }}
                        </span>
                        <span class="text-[11px] font-mono text-gray-400">
                          {{ usr.mobile || usr.email || '' }}
                        </span>
                      </div>
                      <span class="text-[10px] text-gray-400">
                        {{ usr.role === 'owner' ? 'مالک' : usr.role === 'admin' ? 'مدیر' : 'مشتری' }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- صفحات و بخش‌های منطبق پنل -->
              <div>
                <div class="mb-1.5 px-2 text-[11px] font-bold text-gray-400">
                  {{ query.trim() ? 'صفحات مرتبط' : 'دسترسی سریع به بخش‌ها' }}
                </div>
                <div class="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  <button
                    v-for="page in filteredPages"
                    :key="page.path"
                    type="button"
                    class="flex items-center justify-between rounded-xl px-3 py-2 text-right text-xs transition-colors hover:bg-gray-100 group"
                    @click="navigateToUrl(page.path)"
                  >
                    <div class="flex items-center gap-2.5">
                      <div
                        class="flex h-7 w-7 items-center justify-center rounded-lg text-xs"
                        :class="page.badgeBg || 'bg-gray-100 text-gray-600'"
                      >
                        <i :class="page.icon" />
                      </div>
                      <span class="font-medium text-gray-700 group-hover:text-brand-600">
                        {{ page.label }}
                      </span>
                    </div>
                    <span class="text-[10px] text-gray-400 font-mono">
                      {{ page.section }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- وضعیت عدم یافت نتیجه -->
              <div
                v-if="
                  query.trim().length >= 2 &&
                  !loading &&
                  filteredPages.length === 0 &&
                  liveResults.products.length === 0 &&
                  liveResults.orders.length === 0 &&
                  liveResults.users.length === 0
                "
                class="py-8 text-center"
              >
                <div class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                  <i class="pi pi-search text-base" />
                </div>
                <p class="text-xs font-semibold text-gray-700">
                  موردی برای "{{ query }}" پیدا نشد!
                </p>
                <p class="mt-1 text-[11px] text-gray-400">
                  نام دقیق‌تر محصول، شماره سفارش یا نام کاربر را بررسی کنید.
                </p>
              </div>
            </div>

            <!-- راهنمای کلیدها در فوتر مودال -->
            <div class="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-4 py-2.5 text-[11px] text-gray-400">
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <kbd class="rounded border border-gray-200 bg-white px-1 font-mono text-[9px]">ESC</kbd>
                  بستن
                </span>
                <span class="flex items-center gap-1">
                  <kbd class="rounded border border-gray-200 bg-white px-1 font-mono text-[9px]">↵</kbd>
                  انتخاب
                </span>
              </div>
              <span>جستجوی هوشمند نیمورا</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false);
const query = ref("");
const loading = ref(false);
const searchInputRef = ref<HTMLInputElement | null>(null);

interface PageItem {
  label: string;
  path: string;
  icon: string;
  section: string;
  keywords: string;
  badgeBg?: string;
}

const quickPages: PageItem[] = [
  { label: "داشبورد اصلی", path: "/", icon: "pi pi-home", section: "عمومی", keywords: "خانه آمار فروش", badgeBg: "bg-blue-50 text-blue-600" },
  { label: "همه محصولات", path: "/product", icon: "pi pi-box", section: "محصولات", keywords: "کالا انبار اجناس", badgeBg: "bg-amber-50 text-amber-600" },
  { label: "افزودن محصول جدید", path: "/product/create", icon: "pi pi-plus-circle", section: "محصولات", keywords: "ایجاد درج ثبت کالا", badgeBg: "bg-amber-50 text-amber-600" },
  { label: "همه سفارشات", path: "/order", icon: "pi pi-shopping-bag", section: "سفارشات", keywords: "خرید فاکتور فروش", badgeBg: "bg-emerald-50 text-emerald-600" },
  { label: "سفارشات ارسال نشده", path: "/order/no-sending", icon: "pi pi-truck", section: "سفارشات", keywords: "پست ارسال معلق بسته", badgeBg: "bg-emerald-50 text-emerald-600" },
  { label: "مشتریان و کاربران", path: "/customers", icon: "pi pi-users", section: "کاربران", keywords: "خریداران اعضا یوزر", badgeBg: "bg-violet-50 text-violet-600" },
  { label: "دسته‌بندی‌های کالا", path: "/category", icon: "pi pi-sitemap", section: "محصولات", keywords: "گروه شاخه دسته", badgeBg: "bg-amber-50 text-amber-600" },
  { label: "برندها و تولیدکنندگان", path: "/brand", icon: "pi pi-verified", section: "محصولات", keywords: "مارک شرکت برند", badgeBg: "bg-amber-50 text-amber-600" },
  { label: "کدهای تخفیف و پروموشن", path: "/promotion", icon: "pi pi-percentage", section: "تخفیف", keywords: "کوپن پروموشن جشنواره آف", badgeBg: "bg-rose-50 text-rose-600" },
  { label: "باشگاه مشتریان و رفرال", path: "/loyalty", icon: "pi pi-gift", section: "باشگاه", keywords: "دعوت کش بک پاداش اعتبار امتیاز", badgeBg: "bg-pink-50 text-pink-600" },
  { label: "دیدگاه‌های کاربران", path: "/comments", icon: "pi pi-comments", section: "نظرات", keywords: "کامنت بازخورد رضایت نقد", badgeBg: "bg-indigo-50 text-indigo-600" },
  { label: "تیکت‌ها و پشتیبانی", path: "/tickets", icon: "pi pi-ticket", section: "پشتیبانی", keywords: "پیام تیکت چت پاسخ مشکل", badgeBg: "bg-cyan-50 text-cyan-600" },
  { label: "اعضای خبرنامه", path: "/news-letter", icon: "pi pi-envelope", section: "خبرنامه", keywords: "ایمیل پیامک خبرنامه اعضا", badgeBg: "bg-teal-50 text-teal-600" },
  { label: "مقالات مجله زیبایی", path: "/magazine/articles", icon: "pi pi-book", section: "مجله", keywords: "بلاگ مقاله نوشته وبلاگ", badgeBg: "bg-orange-50 text-orange-600" },
  { label: "مدیریت بنرها", path: "/banners", icon: "pi pi-images", section: "طراحی", keywords: "اسلایدر بنر تبلیغات عکس", badgeBg: "bg-fuchsia-50 text-fuchsia-600" },
];

const liveResults = ref<{
  products: any[];
  orders: any[];
  users: any[];
}>({
  products: [],
  orders: [],
  users: [],
});

const filteredPages = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return quickPages;
  return quickPages.filter(
    (page) =>
      page.label.toLowerCase().includes(q) ||
      page.section.toLowerCase().includes(q) ||
      page.keywords.toLowerCase().includes(q)
  );
});

let searchTimeout: any = null;

const handleQueryChange = () => {
  const q = query.value.trim();
  clearTimeout(searchTimeout);

  if (q.length < 2) {
    liveResults.value = { products: [], orders: [], users: [] };
    loading.value = false;
    return;
  }

  loading.value = true;
  searchTimeout = setTimeout(async () => {
    try {
      const res = await $fetch<any>("/api/search", {
        params: { q },
      });
      if (res?.data) {
        liveResults.value = {
          products: res.data.products || [],
          orders: res.data.orders || [],
          users: res.data.users || [],
        };
      }
    } catch {
      // Ignore
    } finally {
      loading.value = false;
    }
  }, 250);
};

const clearQuery = () => {
  query.value = "";
  liveResults.value = { products: [], orders: [], users: [] };
  searchInputRef.value?.focus();
};

const openModal = () => {
  isOpen.value = true;
  nextTick(() => {
    searchInputRef.value?.focus();
  });
};

const closeModal = () => {
  isOpen.value = false;
  query.value = "";
  liveResults.value = { products: [], orders: [], users: [] };
};

const navigateToUrl = async (url: string) => {
  closeModal();
  await navigateTo(url);
};

const handleKeyDownGlobal = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (isOpen.value) {
      closeModal();
    } else {
      openModal();
    }
  } else if (event.key === "Escape" && isOpen.value) {
    closeModal();
  }
};

const handleKeyNavigation = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeModal();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDownGlobal);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDownGlobal);
});
</script>
