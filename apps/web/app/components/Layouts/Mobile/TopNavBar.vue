<template>
  <header
    class="sticky top-0 z-40 flex flex-col w-full shadow-sm backdrop-blur-2xl bg-white/70"
  >
    <div class="flex items-center gap-2 px-4 py-3">
      <!-- دکمه بازگشت (همه‌جا به‌جز صفحه اصلی) -->
      <button
        v-if="!isHome"
        type="button"
        class="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-nimoura-text-600 transition-colors active:bg-gray-200"
        aria-label="بازگشت"
        @click="goBack"
      >
        <i class="pi pi-arrow-right text-sm" />
      </button>

      <!-- لوگو (فقط صفحه اصلی) -->
      <!-- <NuxtLink v-else to="/" class="flex shrink-0 flex-col items-center text-center">
        <span class="font-modam flex items-center text-xl font-bold text-nimoura-primary">
          نیمورا
        </span>
      </NuxtLink> -->

      <!-- سرچ باکس -->
      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-gray-400 transition-colors active:bg-gray-200"
        @click="searchOpen = true"
      >
        <i class="pi pi-search shrink-0 text-base" />
        <span class="truncate text-sm">
          جستجو در <span class="font-bold text-nimoura-primary">نیمورا</span>
        </span>
      </button>

      <!-- آیکون سبد خرید (فقط صفحه‌ی تکی محصول) -->
      <NuxtLink
        to="/cart"
        class="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-nimoura-text-600 transition-colors active:bg-gray-200"
        aria-label="سبد خرید"
      >
        <i class="pi pi-shopping-cart text-sm!" />

        <span
          v-if="cart.totalCount > 0"
          class="absolute -right-1 -top-1 flex h-4 w-4"
        >
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-nimoura-primary opacity-75"
          />
          <ClientOnly>
            <span
              class="font-modam relative flex h-4 w-4 items-center justify-center rounded-full bg-nimoura-primary text-[10px] font-bold text-white"
            >
              {{ cart.totalCount }}
            </span>
          </ClientOnly>
        </span>
      </NuxtLink>
      <NuxtLink
        to="/profile"
        class="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-nimoura-text-600 transition-colors active:bg-gray-200"
        aria-label="پروفایل"
      >
        <i class="pi pi-user text-sm!" />
      </NuxtLink>
    </div>
  </header>

  <LayoutsMobileSearchBar v-model:open="searchOpen" />
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const cart = useCartStore();

const searchOpen = ref(false);

const isHome = computed(() => route.path === "/");

function goBack() {
  // اگه تاریخچه‌ی مرورگر وجود داره (کاربر واقعاً از یک صفحه‌ی دیگه‌ی همین سایت اومده)، برگرد
  // وگرنه (مثلاً لینک مستقیم/رفرش) به‌جای گیرکردن، به صفحه‌ی اصلی برو
  if (window.history.state?.back) {
    router.back();
  } else {
    router.push("/");
  }
}
</script>
